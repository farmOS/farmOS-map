/**
 * Add a behavior by name.
 */
export async function addBehavior(name, options = {}) {
  return this.attachBehavior(window.farmOS.map.namedBehaviors[name], options);
}

/**
 * Attach a behavior to the farmOS-map instance.
 */
export async function attachBehavior(behavior, options = {}) {
  return behavior.attach(this, options);
}
