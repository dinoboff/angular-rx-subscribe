/**
 * angular-rx-subscribe/directive.js
 */

export class RxSubscribeCtrl {

  constructor($log, $scope, $attrs) {
    this.$log = $log;
    this.$scope = $scope;
    this.label = $attrs.rxAs || '$rx';

    this.subscription = null;

    $scope.$watch(
      $attrs.rxSubscribe,
      src => this.subscribe(src)
    );

    $scope.$on('$destroy', () => this.close());
  }

  close() {
    this.unsubscribe();

    this.$log = null;
    this.$scope = null;
    this.subscription = null;
  }

  subscribe(src) {
    this.unsubscribe();

    if (!src || !src.subscribe) {
      this.$log.error(new Error('rxSubscribe.src should be an observable'));
      return;
    }

    this.subscription = src.subscribe({
      next: next => this.set({next}),
      error: error => this.set({error}),
      complete: () => this.update({complete: true})
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.set({});
  }

  set(obj) {
    obj = obj || {};

    this.apply(scope => Object.assign(scope, {[this.label]: obj}));
  }

  update(patch) {
    this.apply(scope => Object.assign(scope[this.label], patch));
  }

  apply(fn) {
    if (!this || !this.$scope) {
      return;
    }

    this.$scope.$applyAsync(scope => {
      if (!scope || !this) {
        return;
      }

      const last = scope[this.label] && scope[this.label].next;

      fn(scope);

      if (scope[this.label].complete || scope[this.label].hasOwnProperty('error')) {
        scope[this.label].last = last;
      }
    });
  }

}

RxSubscribeCtrl.$inject = ['$log', '$scope', '$attrs'];

export function rxSubscribeDirective() {
  return {
    restrict: 'A',
    controller: RxSubscribeCtrl,
    scope: true
  };
}

rxSubscribeDirective.$inject = [];
