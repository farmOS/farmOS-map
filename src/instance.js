// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import defaults.
import defaults from './defaults';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target }) => ({

  // The target element ID for the map.
  target,

  // The OpenLayers map object.
  map: new Map({
    target,
    layers: defaults.layers,
    controls: defaults.controls,
    interactions: defaults.interactions,
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  }),
});
export default createInstance;
