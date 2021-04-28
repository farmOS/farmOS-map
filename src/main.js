// Import farmOS map instance factory function.
import createInstance from './instance/instance';

// Import farmOS-map CSS.
import './styles.css';

// Export the default farmOS-map object - normally exposed globally at farmOS.map
export default {

  // Initialize an array of farmOS map instances.
  instances: [],

  // Behaviors which can be added on-demand by name via `instance.addBehavior`
  // These are objects with an attach() method that will be called when a map is
  // created. They receive the instance object so that they can perform
  // modifications to the map using instance methods.
  namedBehaviors: {
    rememberLayer: lazyLoadedBehavior('rememberLayer'),
    edit: lazyLoadedBehavior('edit'),
    google: lazyLoadedBehavior('google'),
    measure: lazyLoadedBehavior('measure'),
    snappingGrid: lazyLoadedBehavior('snappingGrid'),
  },

  // Map behaviors which will be automatically attached to all created map
  // instances.
  behaviors: {
    rememberLayer: lazyLoadedBehavior('rememberLayer'),
  },

  // Create a new farmOS map attached to a target element ID and add it to the
  // global instances array.
  create(target, options) {
    const instance = createInstance({ target, options });

    // Add the instance to the array.
    this.instances.push(instance);

    // Attach behaviors from farmOS.map.behaviors to the instance.
    // Sort by an optional weight value on each behavior.
    const behaviors = Object.keys(this.behaviors).map(i => this.behaviors[i]);
    behaviors.sort((first, second) => {
      const firstWeight = first.weight || 0;
      const secondWeight = second.weight || 0;
      if (firstWeight === secondWeight) {
        return 0;
      }
      return (firstWeight < secondWeight) ? -1 : 1;
    });
    behaviors.forEach((behavior) => {
      instance.attachBehavior(behavior);
    });

    // Return the instance.
    return instance;
  },

  // Destroy a farmOS map instance and remove it from the instances array.
  destroy(target) {
    const i = this.targetIndex(target);
    if (i > -1) {
      this.instances[i].map.setTarget(null);
      this.instances.splice(i, 1);
    }
  },

  // Look up an instance index based on its target element ID.
  targetIndex(target) {
    return this.instances.findIndex(instance => instance.target === target);
  },
};

function lazyLoadedBehavior(name) {
  return {
    async attach(instance, options) {
      return import(/* webpackChunkName: "farmOS-map-[request]" */ `./behavior/${name}`).then((module) => {
        const behavior = module.default;
        behavior.attach(instance, options);
      });
    },
  };
}
