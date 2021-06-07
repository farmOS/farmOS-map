import MapInstanceManager from './MapInstanceManager';

// Import the default projection configuration
import projection from './projection';

// Define window.farmOS if it isn't already.
if (typeof window.farmOS === 'undefined') {
  window.farmOS = {};
}

const INSTANCE = new MapInstanceManager();

// Add a farmOS.map object that is available globaly.
window.farmOS.map = INSTANCE;

// Expose MapInstanceManager
window.farmOS.map.MapInstanceManager = MapInstanceManager;

// Expose the default projection configuration
window.farmOS.map.projection = projection;

// Export the default farmOS-map object
export default INSTANCE;
