import MapInstanceManager from './MapInstanceManager';

// Define window.farmOS if it isn't already.
if (typeof window.farmOS === 'undefined') {
  window.farmOS = {};
}

const INSTANCE = new MapInstanceManager();

// Add a farmOS.map object that is available globaly.
window.farmOS.map = INSTANCE;

// Export the default farmOS-map object
export default INSTANCE;
