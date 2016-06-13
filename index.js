/**
 * Example-app entry point - boostrap the the angular app.
 */

/* eslint-env browser */

import angular from 'angular';
import Rx from 'rxjs/bundles/Rx.umd.js';
import {module, extend} from 'src/index.js';

const app = angular.module('exampleApp', [module.name]);

app.run(['$rootScope', $rootScope => extend(Rx.Observable, $rootScope)]);

app.component('app', {
  template: `
    <h1>Example</h1>

    <h2>Basic</h2>

    <p rx-subscribe="$ctrl.time">
      Time: {{$rx.next|date:'mediumTime'}}
    </p>

    <h2>Nested</h2>

    <p>
      Using 'rx-as="aLabel"' to nest "rx-subscribe" elements and differentiate
      their notifications.
    </p>

    <div rx-subscribe="$ctrl.time" rx-as="now">
      <div rx-subscribe="$ctrl.timeBefore" rx-as="before">
        <p>It's a {{now.next|date:'mediumTime'}}</p>
        <p>5 seconds ago, it's a {{before.next|date:'mediumTime'}}</p>
      </div>
    </div>

    <h2>Complete</h2>

    <p>Complete doesn't reset the "next" property.</p>

    <div rx-subscribe="$ctrl.timeLimited">
      <p>Time: {{$rx.next|date:'mediumTime'}}</p>
      <p ng-if="$rx.complete">ummm... I am losing track of time.</p>
    </div>

    <h2>Error</h2>

    <p>Error reset the "next" property.</p>

    <div rx-subscribe="$ctrl.timeError">
      <p>Time: {{$rx.next|date:'mediumTime'}}</p>
      <p ng-if="$rx.error">{{$rx.error.toString()}}</p>
    </div>

    <h2>Unpacked</h2>

    <p>Time: {{$ctrl.unpackedTime|date:'mediumTime'}}</p>

  `,
  controller: function AppController() {
    const src = Rx.Observable.interval(1000).startWith(0);
    const sub = src.$subscribe(() => {
      this.unpackedTime = new Date();
    });

    this.$onDestroy = () => sub.unsubscribe();

    this.time = src.map(() => new Date());
    this.timeBefore = src.startWith(0).map(() => new Date(Date.now() - 5000));
    this.timeLimited = src.startWith(0).map(() => new Date()).take(3);
    this.timeError = Rx.Observable.concat(this.timeLimited, Rx.Observable.throw(new Error('Err... Lost it.')));
  }
});

angular.element(document).ready(function() {
  angular.bootstrap(document, [app.name], {strictDi: true});
});
