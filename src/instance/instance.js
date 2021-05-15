// Import OpenLayers base Map and View definitions.
import { Map, View } from 'ol';

// Import defaults.
import defaults from './defaults';

// Import instance methods.
import addLayer, { getLayerByName } from './methods/layer';
import addPopup from './methods/popup';
import { zoomToVectors, zoomToLayer } from './methods/zoom';
import { addBehavior, attachBehavior, attachBehaviorsByWeight } from './methods/behavior';
import { measureGeometry } from '../utils/measure';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target, options = {} }) => {

  // Get the system of measurement from options, if provided, or set a default.
  const units = (options.units === 'us') ? 'us' : 'metric';

  // Validate the units that are stored in the options, which is passed into
  // other functions below.
  /* eslint-disable-next-line no-param-reassign */
  options.units = units;

  // Create the instance object.
  const instance = {

    // Set the map's system of measurement.
    units,

    // The target element ID for the map.
    target,

    // The instance initialization options.
    options,

    // The OpenLayers map object.
    map: new Map({
      target,
      layers: defaults.layers(),
      controls: defaults.controls(options),
      interactions: defaults.interactions(options),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    }),

    // Add instance methods.
    addLayer,
    addPopup,
    getLayerByName,
    zoomToVectors,
    zoomToLayer,
    addBehavior,
    attachBehavior,
    attachBehaviorsByWeight,
    measureGeometry,
  };

  return instance;
};
export default createInstance;
