/**
 * Add a behavior by name.
 */
export async function addBehavior(name, options = {}) {
  return this.attachBehavior(this.instanceManager.namedBehaviors[name], options);
}

/**
 * Attach a behavior to the nfa-map instance.
 */
export async function attachBehavior(behavior, options = {}) {

  // Wait until all the default behaviors are done being attached
  await this.defaultBehaviorsAttached.finally();

  // Attach the requested behavior
  return behavior.attach(this, options);
}

/**
 * Attach an array of behaviors to the nfa-map instance.
 * Ensures that behaviors with higher weights are attached
 * after behaviors with lower weights. Behaviors with the
 * same weight may be attached concurrently.
 * Note: This is an internal method and does not wait until
 * the defaultBehaviorsAttached promise completes.
 * @private
 */
export async function attachBehaviorsByWeight(behaviors) {

  // Group the behaviors into an object where the keys are
  // the weights and the values are arrays of behaviors
  const behaviorsByWeight = behaviors.reduce((groups, behavior) => {
    const weight = behavior.weight || 0;

    /* eslint-disable-next-line no-param-reassign */
    groups[weight] = groups[weight] || [];

    groups[weight].push(behavior);

    return groups;
  }, {});

  // Create an array of the unique sorted weights
  const sortedWeights = Object.keys(behaviorsByWeight).sort((a, b) => ((a < b) ? -1 : 1));

  // Create a promise that is the head of a chain of promises - one for each unique weight.
  // Those promises each begin being fulfilled when the next lower weight's promise has successfully
  // been fulfilled. Each of the promises in the chain complete only when all the behaviors
  // with a given weight have been attached successfully.
  return sortedWeights.reduce(
    (previousPromise, weight) => previousPromise.then(() => {
      const behaviorsWithWeight = behaviorsByWeight[weight];

      // Make this step in the chain complete only when all the behaviors with the current weight
      // have been successfully attached.
      return Promise.all(behaviorsWithWeight.map(behavior => behavior.attach(this)));
    }),

    // Start the chain with a completed promise
    Promise.resolve(),
  );
}
