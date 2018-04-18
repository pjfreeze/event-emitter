/* EventEmitter
 * https://github.com/pjfreeze/event-emitter
 *
 * Inspired by:
 * - HTML https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
 * - Node https://nodejs.org/dist/latest-v7.x/docs/api/events.html#events_class_eventemitter
 *
 * This is free and unencumbered software released into the public domain.
 */
(function (global) {
  'use strict';

  const SUBSCRIPTIONS_SYMBOL = Symbol('subscriptions');
  const ORIGINAL_SYMBOL = Symbol('original');

  class EventEmitter {
    constructor() {
      Object.defineProperty(
        this,
        SUBSCRIPTIONS_SYMBOL,
        { value: {}, enumerable: false }
      );
    }

    /**
     * Register a handler for an event, will be invoked any time the event has been emitted so long
     * as the handler has not already been de-registered.
     *
     * @param {string} name
     * @param {function} handler
     * @param {object} [context]
     *
     * @returns {function} The function is an encapsulated de-registration action.
     */
    on(name, handler, context = null) {
      const registry = this[SUBSCRIPTIONS_SYMBOL];
      registry[name] = Array.isArray(registry[name]) ? registry[name] : [];
      registry[name].push({ context, handler });

      // Return a clean "off" with the params encapsulated
      return this.off.bind(this, name, handler, context);
    }

    /**
     * Register a handler for an event, that will only be invoked once.
     *
     * @param {string} name
     * @param {function} handler
     * @param {object} [context]
     *
     * @returns {function}
     */
    once(name, handler, context) {
      const onceHandler = function (...args) {
        off();
        handler.call(context, ...args);
      };

      // Preserve the original handler to allow matching in "off"
      onceHandler[ORIGINAL_SYMBOL] = handler;

      const off = this.on(name, onceHandler, context);
      return off;
    }

    /**
     * Invoke all handlers registered for a particular event with the provided arguments.
     *
     * @param {string} name - The name of the event to invoke handlers for
     * @param {...*} arg - Any number of additional arguments to pass to the handler
     */
    emit(name, ...args) {
      const subscriptions = this[SUBSCRIPTIONS_SYMBOL][name] || [];
      subscriptions.forEach((subscription) => {
        subscription.handler.call(subscription.context, ...args);
      });
    }

    /**
     * De-register the handler + context combination from the handlers for the provided name.
     * 
     * @param {string} name
     * @param {function} handler
     * @param {object} [context]
     */
    off(name, handler, context = null) {
      const matchesSubscription = (subscription) => {
        const matchesContext = subscription.context == context;
        const matchesHandler = (
          subscription.handler == handler ||
            subscription.handler[ORIGINAL_SYMBOL] == handler
        );
        return matchesHandler && matchesContext;
      };

      const subscriptions = this[SUBSCRIPTIONS_SYMBOL][name] || [];
      const match = subscriptions.find(matchesSubscription);
      if (match != null) {
        const index = subscriptions.indexOf(match);
        subscriptions.splice(index, 1);
      }

      if (subscriptions.length == 0) {
        delete this[SUBSCRIPTIONS_SYMBOL][name];
      }
    }
  }

  // Export logic based on Scott Hamper's Cookies.js project
  // https://github.com/ScottHamper/Cookies/blob/1.2.3/src/cookies.js
  if (typeof define == 'function' && define.amd) {
    // AMD support
    define(function () { return EventEmitter; });
  } else if (typeof exports == 'object') {
    // Support Node.js specific `module.exports` (which can be a function)
    if (typeof module == 'object' && typeof module.exports == 'object') {
      exports = module.exports = EventEmitter;
    }
  } else {
    global.EventEmitter = EventEmitter;
  }
}(typeof window == 'undefined' ? this : window));
