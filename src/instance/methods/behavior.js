// Import pre-defined behaviors from src/behavior.
import rememberLayer from '../../behavior/rememberLayer';


/**
 * Add a behavior by name.
 */
export function addBehavior(name, options = {}) {
  const behaviors = {
    rememberLayer,
  };
  this.attachBehavior(behaviors[name], options);
}

/**
 * Attach a behavior to the farmOS-map instance.
 */
export function attachBehavior(behavior, options = {}) {
  behavior.attach(this, options);
}
