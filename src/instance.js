// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import Vector source and layer, and GeoJSON format.
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

// Import defaults.
import defaults from './defaults';

// Import styles.
import styles from './styles';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target }) => ({

  // The target element ID for the map.
  target,

  // The OpenLayers map object.
  map: new Map({
    target,
    layers: defaults.layers(),
    controls: defaults.controls(),
    interactions: defaults.interactions(),
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  }),

  // Add a GeoJSON feature layer to the map.
  addGeoJSONLayer(url, color) {
    const style = styles(color);
    const source = new VectorSource({
      url,
      format: new GeoJSON(),
    });
    const layer = new VectorLayer({
      source,
      style,
    });
    this.map.addLayer(layer);
  },
});
export default createInstance;
