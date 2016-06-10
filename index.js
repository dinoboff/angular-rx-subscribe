/**
 * Example-app entry point - boostrap the the angular app.
 */

/* eslint-env browser */

import angular from 'angular';
import Rx from 'rxjs/bundles/Rx.umd.js';
import {module} from 'src/index.js';

const app = angular.module('exampleApp', [module.name]);

app.component('app', {
  template: `
    <h1>Example</h1>

    <h2>Basic</h2>

    <rx-subscribe src="$ctrl.time">
      <p>Time: {{$rx.next|date:'mediumTime'}}</p>
    </rx-subscribe>

    <h2>Nested</h2>

    <p>
      Using 'as="aLabel"' to nest "rx-subscribe" elements and differentiate
      their notifications.
    </p>

    <rx-subscribe src="$ctrl.time" as="now">
      <rx-subscribe src="$ctrl.timeBefore" as="before">
        <p>It's a {{now.next|date:'mediumTime'}}</p>
        <p>5 seconds ago, it's a {{before.next|date:'mediumTime'}}</p>
      </rx-subscribe>
    </rx-subscribe>

    <h2>Complete</h2>

    <p>Complete doesn't reset the "next" property.</p>

    <rx-subscribe src="$ctrl.timeLimited">
      <p>Time: {{$rx.next|date:'mediumTime'}}</p>
      <p ng-if="$rx.complete">ummm... I am losing track of time.</p>
    </rx-subscribe>

    <h2>Error</h2>

    <p>Error reset the "next" property.</p>

    <rx-subscribe src="$ctrl.timeError">
      <p>Time: {{$rx.next|date:'mediumTime'}}</p>
      <p ng-if="$rx.error">{{$rx.error.toString()}}</p>
    </rx-subscribe>

  `,
  controller: function AppController() {
    this.time = Rx.Observable.interval(1000).startWith(0).map(() => new Date());
    this.timeBefore = Rx.Observable.interval(1000).startWith(0).map(() => new Date(Date.now() - 5000));
    this.timeLimited = Rx.Observable.interval(1000).startWith(0).map(() => new Date()).take(3);
    this.timeError = Rx.Observable.concat(this.timeLimited, Rx.Observable.throw(new Error('Err... Lost it.')));
  }
});

angular.element(document).ready(function() {
  angular.bootstrap(document, [app.name], {strictDi: true});
});
