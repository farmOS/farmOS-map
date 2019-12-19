// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import defaults.
import defaults from './defaults';

// Import instance methods.
import enableDraw from './methods/edit';
import addLayer, { getLayerByName } from './methods/layer';
import addPopup from './methods/popup';
import { zoomToVectors, zoomToLayer } from './methods/zoom';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target, options = {} }) => {
  const instance = {

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
    enableDraw,
    addLayer,
    addPopup,
    getLayerByName,
    zoomToVectors,
    zoomToLayer,
  };


  return instance;
};
export default createInstance;
