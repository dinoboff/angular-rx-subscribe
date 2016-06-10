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
    let ctrl, log, element, transclude, clone, scope;

    beforeEach(function() {
      log = {};
      element = {
        append: sinon.spy()
      };
      clone = {};
      scope = {
        $applyAsync: sinon.stub(),
        $destroy: sinon.spy()
      };
      scope.$applyAsync.yields(scope);
      transclude = sinon.stub().withArgs(sinon.match.func).yields(clone, scope);

      ctrl = new RxSubscribeCtrl(log, element, transclude);
    });

    it('should transclude', function() {
      expect(transclude).to.have.been.calledOnce;
      expect(transclude).to.have.been.calledWithExactly(sinon.match.func);
    });

    it('should save the transclude scope', function() {
      expect(ctrl.$transScope).to.equal(scope);
    });

    it('should append the transclude clone to the element', function() {
      expect(element.append).to.have.been.calledOnce;
      expect(element.append).to.have.been.calledWithExactly(clone);
    });

    it('should update the scope with the notifications', function() {
      ctrl.src = Rx.Observable.of(1, 2).concat(Rx.Observable.never());
      ctrl.$onChanges({src: {currentValue: ctrl.src, isFirstChange: () => true}});

      expect(scope.$applyAsync).to.have.been.calledTwice;
      expect(scope.$rx).to.eql({next: 2});
    });

    it('should update the scope with the complete notifications', function() {
      ctrl.src = Rx.Observable.of(1);
      ctrl.$onChanges({src: {currentValue: ctrl.src, isFirstChange: () => true}});

      expect(scope.$applyAsync).to.have.been.calledTwice;
      expect(scope.$rx).to.eql({next: 1, last: 1, complete: true});
    });

    it('should update the scope with the error notifications', function() {
      const e = new Error();

      ctrl.src = Rx.Observable.of(1).concat(Rx.Observable.throw(e));
      ctrl.$onChanges({src: {currentValue: ctrl.src, isFirstChange: () => true}});

      expect(scope.$applyAsync).to.have.been.calledTwice;
      expect(scope.$rx).to.eql({last: 1, error: e});
    });

    it('should unsubscribe subscription on destroyed', function() {
      ctrl.src = Rx.Observable.never();
      sinon.spy(ctrl.src, 'subscribe');
      ctrl.$onChanges({src: {currentValue: ctrl.src, isFirstChange: () => true}});

      expect(ctrl.src.subscribe).to.have.been.calledOnce;

      const subscription = ctrl.src.subscribe.lastCall.returnValue;

      expect(ctrl.subscription).to.equal(subscription);
      sinon.spy(subscription, 'unsubscribe');

      ctrl.$onDestroy();
      expect(subscription.unsubscribe).to.have.been.calledOnce;
    });

    it('should destroy the transclude scope on destroyed', function() {
      ctrl.src = Rx.Observable.never();
      sinon.spy(ctrl.src, 'subscribe');
      ctrl.$onChanges({src: {currentValue: ctrl.src, isFirstChange: () => true}});

      ctrl.$onDestroy();
      expect(scope.$destroy).to.have.been.calledOnce;
    });

    it('should unsubscribe subscription on destroyed', function() {
      const firstSrc = ctrl.src = Rx.Observable.never();

      sinon.spy(ctrl.src, 'subscribe');
      ctrl.$onChanges({src: {currentValue: firstSrc, isFirstChange: () => true}});
      expect(firstSrc.subscribe).to.have.been.calledOnce;

      const subscription = firstSrc.subscribe.lastCall.returnValue;

      sinon.spy(subscription, 'unsubscribe');

      ctrl.src = Rx.Observable.never();
      sinon.spy(ctrl.src, 'subscribe');
      ctrl.$onChanges({src: {currentValue: ctrl.src, previousValue: firstSrc, isFirstChange: () => false}});

      expect(subscription.unsubscribe).to.have.been.calledOnce;
    });

    it('should resubscribe subscription on destroyed', function() {
      const firstSrc = ctrl.src = Rx.Observable.never();

      sinon.spy(ctrl.src, 'subscribe');
      ctrl.$onChanges({src: {currentValue: firstSrc, isFirstChange: () => true}});

      ctrl.src = Rx.Observable.never();
      sinon.spy(ctrl.src, 'subscribe');
      ctrl.$onChanges({src: {currentValue: ctrl.src, previousValue: firstSrc, isFirstChange: () => false}});

      expect(ctrl.src.subscribe).to.have.been.calledOnce;
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
