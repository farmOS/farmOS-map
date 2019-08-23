// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import defaults.
import defaults from './defaults';

// Import instance methods.
import {
  forEachLayer,
  rememberLayer,
  addLayer,
} from './methods/layer';
import addPopup from './methods/popup';
import { zoomToVectors, zoomToLayer } from './methods/zoom';

// Import Edit control.
import Edit from '../control/Edit';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target, options = {} }) => {
  const instance = {

    // The target element ID for the map.
    target,

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
    forEachLayer,
    rememberLayer,
    addLayer,
    addPopup,
    zoomToVectors,
    zoomToLayer,
  };

  // Remember visibility state of base layers with localStorage.
  instance.forEachLayer(instance.map.getLayerGroup(), (layer) => {
    if (layer.get('type') === 'base') {
      rememberLayer(layer);
    }
  });

  // Add drawing controls, if drawing is true.
  // Make the Edit control available at instance.edit.
  if (options.drawing) {
    const opts = {
      title: 'Drawing',
      group: 'Editable layers',
      color: 'orange',
    };
    const layer = instance.addLayer('vector', opts);
    instance.edit = new Edit({ layer });
    instance.map.addControl(instance.edit);
  }

  return instance;
};
export default createInstance;
