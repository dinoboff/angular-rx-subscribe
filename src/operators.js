/**
 * angular-rx-subscribe/operators.js - Observable extensions for AngularJS.
 */

function wrapWithScopeApply(fn, scope) {
  if (!fn) {
    return () => scope.$applyAsync();
  }

  return v => scope.$applyAsync(() => fn(v));
}

/**
 * Extends Observable prototype with `$subscribe(observer, scope)` operator.
 *
 * @param  {Constructor}  Observable   Typically RxJS 5 - any ES stage 1
 *                                     Observable would do.
 * @param  {Scope}        defaultScope rootScope.
 */
export function extend(Observable, defaultScope) {
  Observable.prototype.$defaultScope = defaultScope;

  /**
   * Subscribe to the Observable instance, and wrap the observer notification
   * handler around a scope.$applyAsync call.
   *
   * @example
   * import {extend} from 'angular-rx-subscribe/operators.js';
   * import Rx from 'rxjs/bundles/Rx.umd.js';
   *
   * module.run(function($rootScope) {
   *   extend(Rx.Observable, $rootScope);
   * });
   *
   * module.component('x-time', {
   *   template: '{{$ctrl.time}}',
   *   controller: function() {
   *     const sub = Rx.Observable.timer(1000).startWith(0).map(
   *       () => new Date()
   *     ).$subscribe(
   *       time => this.time = time
   *     );
   *
   *     this.$onDestroy = () => sub.unsubscribe();
   *   }
   * });
   *
   * @param  {function|Observer} observer
   * @param  {Scope|undefined}            scope - default to the rootScope
   * @return {Subscription}
   */
  Observable.prototype.$subscribe = function(observer, scope) {
    scope = scope || this.$defaultScope;

    if (!scope) {
      throw new Error('No scope provided.');
    }

    if (!observer) {
      observer = {};
    } else if (typeof observer === 'function') {
      observer = {
        next: observer
      };
    }

    return this.subscribe({
      next: wrapWithScopeApply(observer.next, scope),
      error: wrapWithScopeApply(observer.error, scope),
      complete: wrapWithScopeApply(observer.complete, scope)
    });
  };
}
