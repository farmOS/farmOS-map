// Assign the public path before other imports.
import './publicPath';
import MapInstanceManager from './MapInstanceManager';

// Import the default projection configuration
import projection from './projection';

// Define window.nfa if it isn't already.
if (typeof window.nfa === 'undefined') {
  window.nfa = {};
}

const INSTANCE = new MapInstanceManager();

// Add a nfa.map object that is available globaly.
window.nfa.map = INSTANCE;

// Expose MapInstanceManager
window.nfa.map.MapInstanceManager = MapInstanceManager;

// Expose the default projection configuration
window.nfa.map.projection = projection;

// Export the default nfa-map object
export default INSTANCE;
