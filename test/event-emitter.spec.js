const assert = require('assert');

const sinon = require('sinon');

const EventEmitter = require('./../event-emitter.js');

describe('EventEmitter', () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('EventEmitter#on', () => {
    it('should store the handler and call it when the event is emitted', () => {
      const handler = sinon.spy();
      emitter.on('event', handler);
      emitter.emit('event');
      assert(handler.calledOnce);
    });

    it('should store the optional context and call the handler with it when the event is emitted', () => {
      const context = { spiritAnimal: 'Lion' };
      const handler = sinon.spy(function () {
        assert(this.spiritAnimal == context.spiritAnimal);
      });
      emitter.on('change', handler, context);
      emitter.emit('change');
      assert(handler.calledOnce);
    });

    it('should return a de-register function', () => {
      const handler = sinon.spy();
      const deregister = emitter.on('change', handler);
      assert(typeof deregister == 'function');
      // Call twice and then deregister
      emitter.emit('change');
      emitter.emit('change');
      deregister();
      // Calling a third time should not call the handler, as should have been removed
      emitter.emit('change');
      assert(handler.calledTwice);
    });
  });

  describe('EventEmitter#once', () => {
    it('should subscribe a handler for only one call', () => {
      const handler = sinon.spy();
      emitter.once('change', handler);
      emitter.emit('change');
      assert(handler.calledOnce);
      emitter.emit('change');
      assert(handler.calledOnce);
    });

    it('should call the one time handler with the provided context', () => {
      const context = { spiritAnimal: 'Peacock' };
      const handler = sinon.spy(function () {
        assert(this.spiritAnimal == context.spiritAnimal);
      });
      emitter.once('change', handler, context);
      emitter.emit('change');
      assert(handler.calledOnce);
      emitter.emit('change');
      assert(handler.calledOnce);
    });

    it('should be able to be de-registered using "off"', () => {
      const context = { spiritAnimal: 'Peacock' };
      const handler = sinon.spy();
      emitter.once('change', handler, context);
      emitter.off('change', handler, context);
      emitter.emit('change');
      assert(handler.callCount == 0);
    });

    it('should be able to be de-registered using returned function', () => {
      const context = { spiritAnimal: 'Peacock' };
      const handler = sinon.spy();
      const off = emitter.once('change', handler, context);
      off();
      emitter.emit('change');
      assert(handler.callCount == 0);
    });
  });

  describe('EventEmitter#emit', () => {
    it('should call all handlers for an event', () => {
      const handler1 = sinon.spy();
      const handler2 = sinon.spy();
      emitter.on('change', handler1);
      emitter.on('change', handler2);
      emitter.emit('change');
      assert(handler1.calledOnce);
      assert(handler2.calledOnce);
    });

    it('should call handlers in the order registered', () => {
      const handler1 = sinon.spy();
      const handler2 = sinon.spy();
      emitter.on('change', handler1);
      emitter.on('change', handler2);
      emitter.emit('change');
      assert(handler1.calledBefore(handler2));
    });

    it('should call a handler with arguments emit was called with', () => {
      const handler = sinon.spy();
      emitter.on('change', handler);
      emitter.emit('change', 'foo bar', 'biz', 'baz');
      assert(handler.calledWith('foo bar', 'biz', 'baz'));
    });
  });

  describe('EventEmitter#off', () => {
    it('should remove the handler from the known handlers', () => {
      const handler = sinon.spy();
      emitter.on('change', handler);
      emitter.emit('change');
      emitter.off('change', handler);
      emitter.emit('change');
      assert(handler.calledOnce);
    });

    it('should not call a removed handler', () => {
      const handler = sinon.spy();
      emitter.on('change', handler);
      emitter.off('change', handler);
      emitter.emit('change');
      assert(handler.callCount == 0);
    });
  });
});
