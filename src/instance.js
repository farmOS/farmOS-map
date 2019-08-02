// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import source types, layer types, and formats.
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

import { createEmpty as extentCreateEmpty, extend as extendExtend } from 'ol/extent';

// Import defaults.
import defaults from './defaults';

// Import styles.
import styles from './styles';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target, options }) => ({

  // The target element ID for the map.
  target,

  // The OpenLayers map object.
  map: new Map({
    target,
    layers: defaults.layers(),
    controls: defaults.controls(options.controls),
    interactions: defaults.interactions(options.interactions),
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

  // Add Well Known Text (WKT) geometry to the map.
  addWKTLayer(title, wkt, color, visible = true) {
    const style = styles(color);
    const isMultipart = wkt.includes('MULTIPOINT')
      || wkt.includes('MULTILINESTRING')
      || wkt.includes('MULTIPOLYGON')
      || wkt.includes('GEOMETRYCOLLECTION');
    let feature;
    if (isMultipart) {
      feature = new WKT().readFeatures(wkt);
    } else {
      feature = new WKT().readFeature(wkt);
    }
    const source = new VectorSource({
      features: [feature],
    });
    const layer = new VectorLayer({
      title,
      source,
      style,
      visible,
    });
    this.map.addLayer(layer);
  },

  // Add a WMS tile layer to the map.
  addWMSTileLayer(title, url, params, visible = true) {
    const source = new TileWMS({
      url,
      params,
    });
    const layer = new TileLayer({
      title,
      source,
      visible,
    });
    this.map.addLayer(layer);
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
