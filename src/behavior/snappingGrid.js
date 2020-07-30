// Import SnappingGrid control.
import SnappingGrid from '../control/SnappingGrid/SnappingGrid';


// Snapping grid behavior.
export default {
  attach(instance) {

    // Get the units from instance options.
    const units = (instance.options.units === 'us') ? 'us' : 'metric';

    // Create the SnappingGrid control and add it to the map.
    const control = new SnappingGrid({ units });
    instance.map.addControl(control);
  },
};
