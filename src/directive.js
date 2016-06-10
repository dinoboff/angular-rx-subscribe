/**
 * angular-rx-subscribe/directive.js
 */

export class RxSubscribeCtrl {

  constructor($log, $element, $transclude) {
    this.$log = $log;
    this.$transScope = null;
    this.subscription = null;

    $transclude((clone, scope) => {
      $element.append(clone);
      this.$transScope = scope;
    });
  }

  $onChanges(changes) {
    if (!changes.src) {
      return;
    }

    this.label = this.label || '$rx';
    this.unsubscribe();

    if (!this.src || !this.src.subscribe) {
      this.$log.error(new Error('rxSubscribe.src should be an observable'));
      return;
    }

    this.subscription = this.src.subscribe({
      next: next => this.set({next}),
      error: error => this.set({error}),
      complete: () => this.update({complete: true})
    });
  }

  $onDestroy() {
    this.unsubscribe();
    this.$transScope.$destroy();

    this.$log = null;
    this.$transScope = null;
    this.subscription = null;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.set({});
    }
  }

  set(obj) {
    obj = obj || {};

    this.apply(scope => Object.assign(scope, {[this.label]: obj}));
  }

  update(patch) {
    this.apply(scope => Object.assign(scope[this.label], patch));
  }

  apply(fn) {
    if (!this || !this.$transScope || !this.$transScope.$applyAsync) {
      return;
    }

    this.$transScope.$applyAsync(scope => {
      if (!scope || !this || !this.label) {
        return;
      }

      const prev = scope[this.label] && scope[this.label].next;

      fn(scope);
      scope[this.label].prev = prev;
    });
  }

}

RxSubscribeCtrl.$inject = ['$log', '$element', '$transclude'];

export function rxSubscribeDirective() {
  return {
    restrict: 'EA',
    transclude: true,
    controller: RxSubscribeCtrl,
    controllerAs: '$ctrl',
    scope: {
      src: '<',
      label: '@?as'
    },
    bindToController: true
  };
}

rxSubscribeDirective.$inject = [];
