import namedBehaviors from '../../behavior';

/**
 * Add a behavior by name.
 */
export async function addBehavior(name, options = {}) {
  return this.attachBehavior(namedBehaviors[name], options);
}

/**
 * Attach a behavior to the farmOS-map instance.
 */
export async function attachBehavior(behavior, options = {}) {
  // Wait until all the default behaviors are done being attached
  await this.defaultBehaviorsAttached.finally();

  // Attach the requested behavior
  return behavior.attach(this, options);
}
