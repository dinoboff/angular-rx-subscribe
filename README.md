# angular-rx-subscribe

AngularJS directive to access observable notifications.


## Installation

With npm:
```
npm install angular-rx-subscribe
```

With jspm:
```
jspm install npm:angular-rx-subscribe
```


## Usage

### Observable extension

Add a `$subscribe(observer, [scope])` to an Observable prototype:
```js
const app = angular.module('exampleApp', ['rxSubscribe']);

app.run([
  '$rootScope',
  $rootScope => ngRxSubscribe.extend(Rx.Observable, $rootScope)
]);

app.component('app', {
  template: `
    <h1>Example</h1>
    <p>Time: {{$ctrl.unpackedTime|date:'mediumTime'}}</p>
  `,
  controller: function AppController() {
    const src = Rx.Observable.interval(1000).startWith(0).map(() => new Date());
    const subscription = src.$subscribe(time => {
      this.unpackedTime = time;
    });

    this.$onDestroy = () => subscription.unsubscribe();
  }
});
```

### `rx-subscribe` directive

The rx-subscribe directive take an - ES Stage1 - Observable and inject its
notification in the child scope. The value ("$rx" by default, configurable via
the "as" attribute) will have a "next", "prev", "complete" and "error":

- "next" holds the value of current "next" notification.
- "last" holds the value of the previous "next" notication after a "complete"
or "error" notification.
- "complete" holds `true` if the Observable is completed (it doesn't reset
"next").
- "error" holds the error if the Observable throws an error (it does reset
"next")

Example:
```js
const app = angular.module('exampleApp', ['rxSubscribe']);

app.component('app', {
  template: `
    <h1>Example</h1>
    <p rx-subscribe="$ctrl.time" rx-as="$rx">Time: {{$rx.next|date:'mediumTime'}}</p>
  `,
  controller: function AppController() {
    this.time = Rx.Observable.interval(1000).startWith(0).map(() => new Date());
  }
});
```
