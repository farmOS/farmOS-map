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

  // Create a new farmOS map attached to a target element ID and add it to the
  // global instances array.
  create(target) {
    const instance = createInstance({ target });
    this.instances.push(instance);
    return instance;
  },

  // Look up an instance index based on its target element ID.
  targetIndex(target) {
    return this.instances.findIndex(instance => instance.target === target);
  },
};
