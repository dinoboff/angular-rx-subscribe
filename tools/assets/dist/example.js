/* eslint-env browser */
/* global angular: true, Rx: true, ngRxSubscribe: true */
/* eslint no-var: "off" */

var app = angular.module('exampleApp', [ngRxSubscribe.module.name]);

app.component('app', {
  template: (
    '<h1>Example</h1>\n' +
    '<rx-subscribe src="$ctrl.time">\n' +
    '  <p>Time: {{$rx.next|date:\'mediumTime\'}}</p>\n' +
    '</rx-subscribe>'
  ),
  controller: function AppController() {
    this.time = Rx.Observable.interval(1000).startWith(0).map(() => new Date());
  }
});

angular.element(document).ready(function() {
  angular.bootstrap(document, [app.name], {strictDi: true});
});
