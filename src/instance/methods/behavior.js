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
  return behavior.attach(this, options);
}
