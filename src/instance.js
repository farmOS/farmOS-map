// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import Vector source and layer, and GeoJSON format.
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

import { createEmpty as extentCreateEmpty, extend as extendExtend } from 'ol/extent';

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
  addGeoJSONLayer(title, url, color, visible = true) {
    const style = styles(color);
    const source = new VectorSource({
      url,
      format: new GeoJSON(),
    });
    const layer = new VectorLayer({
      title,
      source,
      style,
      visible,
    });
    this.map.addLayer(layer);

    // Zoom to the combined extent of all sources as they are loaded.
    const self = this;
    source.on('change', () => { self.zoomToVectors(); });
  },

  // Zoom to all vector sources in the map.
  zoomToVectors() {
    const extent = extentCreateEmpty();
    this.map.getLayers().forEach((layer) => {
      if (typeof layer.getSource === 'function') {
        const source = layer.getSource();
        if (source !== 'null' && source instanceof VectorSource) {
          if (source.getState() === 'ready' && source.getFeatures().length > 0) {
            extendExtend(extent, source.getExtent());
            const fitOptions = {
              size: this.map.getSize(),
              constrainResolution: false,
              padding: [20, 20, 20, 20],
            };
            this.map.getView().fit(extent, fitOptions);
          }
        }
      }
    });
  },
});
export default createInstance;
