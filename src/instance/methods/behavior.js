// Import pre-defined behaviors from src/behavior.
import rememberLayer from '../../behavior/rememberLayer';


/**
 * Add a behavior by name.
 */
export function addBehavior(name) {
  const behaviors = {
    rememberLayer,
  };
  this.attachBehavior(behaviors[name]);
}

/**
 * Attach a behavior to the farmOS-map instance.
 */
export function attachBehavior(behavior) {
  behavior.attach(this);
}
