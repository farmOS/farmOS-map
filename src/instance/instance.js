// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import defaults.
import defaults from './defaults';

// Import instance methods.
import { rememberLayer, addLayer } from './methods/layer';
import addPopup from './methods/popup';
import { zoomToVectors, zoomToLayer } from './methods/zoom';

// Import forEachLayer helper function.
import forEachLayer from '../forEachLayer';

// Import Edit control.
import Edit from '../control/Edit/Edit';

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

  // Add drawing controls, if drawing is true.
  // Make the Edit control available at instance.edit.
  if (options.drawing) {
    const opts = {
      title: 'Drawing',
      group: 'Editable layers',
      color: 'orange',
    };
    const layer = instance.addLayer('vector', opts);
    const units = (options.units === 'us') ? 'us' : 'metric';
    instance.edit = new Edit({ layer, units });
    instance.map.addControl(instance.edit);
    instance.edit.measure();
  }

  return instance;
};
export default createInstance;
