# angular-rx-subscribe

AngularJS 1.5+ directive to access observable notifications.


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

The rx-subscribe directive take an - ES Stage1 - Observable and inject its
notification in the child scope. The value ("$rx" by default, configurable via
the "as" attribute) will have a "next", "prev", "complete" and "error":

- "next" holds the value of current "next" notification.
- "prev" holds the value of the previous "next" notication.
- "complete" holds `true` if the Observable is completed (it doesn't reset
"next").
- "error" holds the error if the Observable throws an error (it does reset
"next")

Example:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Example</title>
  </head>
  <body>

    <app></app>

    <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.6/angular.min.js"></script>
    <script src="//npmcdn.com/@reactivex/rxjs@5.0.0-beta.8/dist/global/Rx.umd.min.js"></script>
    <script src="./node_modules/angular-rx-subscribe/angular-rx-subscribe.js"></script>

    <script>
      var app = angular.module('exampleApp', ['rxSubscribe']);

      app.component('app', {
        template: `
          <h1>Example</h1>

          <rx-subscribe src="$ctrl.time" as="$rx">
            <p>Time: {{$rx.next|date:\'mediumTime\'}}</p>
          </rx-subscribe>
        `,
        controller: function AppController() {
          this.time = Rx.Observable.interval(1000).startWith(0).map(() => new Date());
        }
      });

      angular.element(document).ready(function() {
        angular.bootstrap(document, [app.name], {strictDi: true});
      });
    </script>
  </body>
</html>
```
