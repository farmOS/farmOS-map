// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import defaults.
import defaults from './defaults';

// Import instance methods.
import enableDraw from './methods/edit';
import { rememberLayer, addLayer } from './methods/layer';
import addPopup from './methods/popup';
import { zoomToVectors, zoomToLayer } from './methods/zoom';

// Import forEachLayer helper function.
import forEachLayer from '../forEachLayer';

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
    rememberLayer,
    addLayer,
    addPopup,
    zoomToVectors,
    zoomToLayer,
  };

  // Remember visibility state of base layers with localStorage.
  forEachLayer(instance.map.getLayerGroup(), (layer) => {
    if (layer.get('type') === 'base') {
      rememberLayer(layer);
    }
  });

  return instance;
};
export default createInstance;
