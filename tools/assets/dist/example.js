/* eslint-env browser */
/* global angular: true, Rx: true, ngRxSubscribe: true */
/* eslint no-var: "off" */

var app = angular.module('exampleApp', [ngRxSubscribe.module.name]);

app.run([
  '$rootScope',
  $rootScope => ngRxSubscribe.extend(Rx.Observable, $rootScope)
]);

app.component('app', {
  template: (
    '<h1>Example</h1>\n' +
    '<h2>rx-subscribe</h2>\n' +
    '<rx-subscribe src="$ctrl.time">\n' +
    '  <p>Time: {{$rx.next|date:\'mediumTime\'}}</p>\n' +
    '</rx-subscribe>\n' +
    '<h2>$subscribe</h2>\n' +
    '<p>Time: {{$ctrl.unpackedTime|date:\'mediumTime\'}}</p>\n'
  ),
  controller: function AppController() {
    this.time = Rx.Observable.interval(1000).startWith(0).map(() => new Date());

    const sub = this.time.$subscribe(time => {
      this.unpackedTime = time;
    });

    this.$onDestroy = () => sub.unsubscribe();
  }
});

angular.element(document).ready(function() {
  angular.bootstrap(document, [app.name], {strictDi: true});
});
