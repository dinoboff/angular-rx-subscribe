import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Rx from 'rxjs/bundles/Rx.umd.js';

import {RxSubscribeCtrl} from './directive.js';
import {extend} from './operators.js';

const expect = chai.expect;

chai.use(sinonChai);

describe('rxSubscribe', function() {

  describe('controller', function() {
    let ctrl, log, scope, attrs;

    beforeEach(function() {
      log = {};
      scope = {
        $applyAsync: sinon.stub(),
        $on: sinon.spy(),
        $watch: sinon.stub(),
        $eval: sinon.stub()
      };
      scope.$applyAsync.yields(scope);
      attrs = {rxSubscribe: '$ctrl.src'};
    });

    it('should set default label to "$rx"', function() {
      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      expect(ctrl.label).to.equal('$rx');
    });

    it('should get label from "rx-as" attribute', function() {
      attrs.rxAs = 'foo';
      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      expect(ctrl.label).to.equal('foo');
    });

    it('should watch for "rx-subscribe" attribute value', function() {
      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      expect(scope.$watch).to.have.been.calledOnce;
      expect(scope.$watch).to.have.been.calledWithExactly('$ctrl.src', sinon.match.func);
    });

    it('should subscribe to the observable "rx-subscribe" reference', function() {
      const src = new Rx.Subject();

      sinon.spy(src, 'subscribe');
      scope.$watch.yields(src);

      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      expect(src.subscribe).to.have.been.calledOnce;
      expect(ctrl.subscription).to.equal(src.subscribe.lastCall.returnValue);
    });

    it('should update the scope with next notification', function() {
      const src = new Rx.Subject();

      sinon.spy(src, 'subscribe');
      scope.$watch.yields(src);

      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      expect(scope.$rx).to.eql({});
      expect(scope.$applyAsync).to.have.been.calledOnce;
      src.next('foo');

      expect(scope.$rx.next).to.equal('foo');
      expect(scope.$applyAsync).to.have.been.calledTwice;
    });

    it('should update the scope with complete notification', function() {
      const src = new Rx.Subject();

      sinon.spy(src, 'subscribe');
      scope.$watch.yields(src);

      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      src.next('foo');
      src.complete();

      expect(scope.$rx.next).to.equal('foo');
      expect(scope.$rx.last).to.equal('foo');
      expect(scope.$rx.complete).to.equal(true);
      expect(scope.$applyAsync).to.have.been.calledThrice;
    });

    it('should update the scope with error notification', function() {
      const src = new Rx.Subject();
      const err = new Error();

      sinon.spy(src, 'subscribe');
      scope.$watch.yields(src);

      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      src.next('foo');
      src.error(err);

      expect(scope.$rx.next).to.equal(undefined);
      expect(scope.$rx.last).to.equal('foo');
      expect(scope.$rx.error).to.equal(err);
      expect(scope.$applyAsync).to.have.been.calledThrice;
    });

    it('should listen for scope destroy event', function() {
      scope.$watch.yields(Rx.Observable.never());

      ctrl = new RxSubscribeCtrl(log, scope, attrs);

      expect(scope.$on).to.have.been.calledOnce;
      expect(scope.$on).to.have.been.calledWithExactly('$destroy', sinon.match.func);
    });

    it('should unsubscribe on destroy', function() {
      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      scope.$watch.lastCall.args[1](Rx.Observable.never());

      const subscription = ctrl.subscription;
      sinon.spy(subscription, 'unsubscribe');

      scope.$on.lastCall.args[1]();
      expect(subscription.unsubscribe).to.have.calledOnce;
    });

    it('should unsubscribe on source change', function() {
      ctrl = new RxSubscribeCtrl(log, scope, attrs);
      scope.$watch.lastCall.args[1](Rx.Observable.never());

      const subscription = ctrl.subscription;
      sinon.spy(subscription, 'unsubscribe');

      scope.$watch.lastCall.args[1](Rx.Observable.never());
      expect(subscription.unsubscribe).to.have.calledOnce;
    });

  });

});

describe('extend', function() {
  let Observable, defaultScope;

  beforeEach(function() {
    defaultScope = {
      $applyAsync: sinon.stub()
    };

    Observable = function() {};
    Observable.prototype.subscribe = sinon.stub();

    extend(Observable, defaultScope);
  });

  it('should set $subscribe', function() {
    expect(Observable.prototype.$subscribe).to.be.a('function');
  });

  it('should set $defaultScope', function() {
    expect(Observable.prototype.$defaultScope).to.equal(defaultScope);
  });

  describe('$subscribe', function() {
    let src, scope;

    beforeEach(function() {
      scope = {
        $applyAsync: sinon.stub()
      };
      src = new Observable();
    });

    it('should subscribe to observable', function() {
      const subscription = {};

      src.subscribe.withArgs(sinon.match({
        next: sinon.match.func,
        error: sinon.match.func,
        complete: sinon.match.func
      })).returns(subscription);

      expect(src.$subscribe({}, scope)).to.equal(subscription);
      expect(src.subscribe).to.have.been.calledOnce;
    });

    it(`should wrap observer function`, function() {
      const handler = sinon.spy();
      const v = {};

      src.$subscribe(handler, scope);

      const observer = src.subscribe.lastCall.args[0];

      observer.next(v);
      expect(scope.$applyAsync).to.have.been.calledOnce;
      expect(scope.$applyAsync).to.have.been.calledWithExactly(sinon.match.func);

      expect(handler).to.not.have.been.called;
      scope.$applyAsync.lastCall.args[0]();
      expect(handler).to.have.been.calledOnce;
      expect(handler).to.have.been.calledWithExactly(v);
    });

    ['next', 'error', 'complete'].forEach(function(name) {

      it(`should wrap ${name} handler`, function() {
        const handler = sinon.spy();
        const v = {};

        src.$subscribe({[name]: handler}, scope);

        const observer = src.subscribe.lastCall.args[0];

        observer[name](v);
        expect(scope.$applyAsync).to.have.been.calledOnce;
        expect(scope.$applyAsync).to.have.been.calledWithExactly(sinon.match.func);

        expect(handler).to.not.have.been.called;
        scope.$applyAsync.lastCall.args[0]();
        expect(handler).to.have.been.calledOnce;
        expect(handler).to.have.been.calledWithExactly(v);
      });

      it(`should wrap ${name} handler`, function() {
        const handler = sinon.spy();
        const v = {};

        src.$subscribe({[name]: handler});

        const observer = src.subscribe.lastCall.args[0];

        observer[name](v);
        expect(defaultScope.$applyAsync).to.have.been.calledOnce;
        expect(defaultScope.$applyAsync).to.have.been.calledWithExactly(sinon.match.func);

        expect(handler).to.not.have.been.called;
        defaultScope.$applyAsync.lastCall.args[0]();
        expect(handler).to.have.been.calledOnce;
        expect(handler).to.have.been.calledWithExactly(v);
      });

      it(`should wrap missing ${name} handler`, function() {
        const v = {};

        src.$subscribe({}, scope);

        const observer = src.subscribe.lastCall.args[0];

        observer[name](v);
        expect(scope.$applyAsync).to.have.been.calledOnce;
        expect(scope.$applyAsync).to.have.been.calledWithExactly();
      });

      it(`should wrap missing ${name} handler around defaultScope`, function() {
        const v = {};

        src.$subscribe({});

        const observer = src.subscribe.lastCall.args[0];

        observer[name](v);
        expect(defaultScope.$applyAsync).to.have.been.calledOnce;
        expect(defaultScope.$applyAsync).to.have.been.calledWithExactly();
      });

    });
  });

});
