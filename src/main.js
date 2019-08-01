// Import farmOS map instance factory function.
import createInstance from './instance';

// Define window.farmOS if it isn't already.
if (typeof window.farmOS === 'undefined') {
  window.farmOS = {};
}

// Add a farmOS.map object that is available globaly.
window.farmOS.map = {

  // Initialize an array of farmOS map instances.
  instances: [],

  // Initialize map behaviors.
  // These are objects with an attach() method that will be called when a map is
  // created. They receive the instance object so that they can perform
  // modifications to the map using instance methods.
  behaviors: {},

  // Create a new farmOS map attached to a target element ID and add it to the
  // global instances array.
  create(target, options) {
    const instance = createInstance({ target, options });

    // Add the instance to the array.
    this.instances.push(instance);

    // Attach behaviors to the instance.
    this.attachBehaviors(instance);

    // Return the instance.
    return instance;
  },

  // Attach behaviors to an instance.
  attachBehaviors(instance) {
    Object.keys(this.behaviors).forEach((key) => {
      if (typeof this.behaviors[key].attach === 'function') {
        this.behaviors[key].attach(instance);
      }
    });
  },

  // Look up an instance index based on its target element ID.
  targetIndex(target) {
    return this.instances.findIndex(instance => instance.target === target);
  },
};
