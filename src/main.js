// Import farmOS map instance factory function.
import createInstance from './instance/instance';

import namedBehaviors from './behavior';

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
  namedBehaviors,

  // Map behaviors which will be automatically attached to all created map
  // instances.
  behaviors: {
    rememberLayer: namedBehaviors.rememberLayer,
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

    const behaviorsByWeight = behaviors.reduce((groups, behavior) => {
      const weight = behavior.weight || 0;

      if (!groups.hasOwnProperty(weight)) {
        groups[weight] = [];
      }

      groups[weight].push(behavior);

      return groups;
    }, {});

    const sortedWeights = Object.keys(behaviorsByWeight).sort((a, b) => (a < b) ? -1 : 1);

    instance.defaultBehaviorsAttached = sortedWeights.reduce((previousPromise, weight) => {
      return previousPromise.then(() => {
        const behaviorsWithWeight = behaviorsByWeight[weight];

        return Promise.all(behaviorsWithWeight.map(behavior => behavior.attach(instance)));
      });
    }, Promise.resolve());

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
