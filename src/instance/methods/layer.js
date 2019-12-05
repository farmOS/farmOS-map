// Import source types, layer types, and formats.
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

// Import setWithCredentials function.
import { setWithCredentials } from 'ol/featureloader';

// Import styles.
import styles from '../../styles';

// Import the default projection configuration
import projection from '../../projection';

// Set withCredentials to true for all XHR requests made via OpenLayers'
// feature loader. Typically farmOS requires authentication in order to
// retrieve data from its GeoJSON endpoints. Setting withCredentials to true
// is a requirement for authentication credentials to be included in the
// request that OpenLayers makes.
setWithCredentials(true);

// Load saved layer visibility state from localStorage.
export function loadLayerVisibility(layer) {
  const title = layer.get('title');
  if (title) {
    const itemName = `farmOS.map.layers.${title}.visible`;
    const savedValue = localStorage.getItem(itemName);
    if (savedValue) {
      const visible = (localStorage.getItem(itemName) === 'true');
      layer.setVisible(visible);
    }
  }
}

// Save layer visibility state to localStorage.
export function saveLayerVisibility(layer) {
  const title = layer.get('title');
  if (title) {
    const visible = layer.get('visible');
    const itemName = `farmOS.map.layers.${title}.visible`;
    localStorage.setItem(itemName, visible);
  }
}

// Remember a layer's visibility state with localStorage.
export function rememberLayer(layer) {
  loadLayerVisibility(layer);
  layer.on('change:visible', (e) => {
    saveLayerVisibility(e.target);
  });
}

// Add a Vector layer to the map.
function addVectorLayer({
  title = 'vector', color, visible = true,
}) {
  const style = styles(color);
  const source = new VectorSource();
  const layer = new VectorLayer({
    title,
    source,
    style,
    visible,
  });
  return layer;
}

// Add a GeoJSON feature layer to the map.
function addGeoJSONLayer({
  title = 'geojson', url, color, visible = true,
}) {
  const style = styles(color);
  const format = new GeoJSON();
  const source = new VectorSource({ url, format });
  const layer = new VectorLayer({
    title,
    source,
    style,
    visible,
  });
  return layer;
}

// Add Well Known Text (WKT) geometry to the map.
function addWKTLayer({
  title = 'wkt', wkt, color, visible = true,
}) {
  const style = styles(color);
  const isMultipart = wkt.includes('MULTIPOINT')
    || wkt.includes('MULTILINESTRING')
    || wkt.includes('MULTIPOLYGON')
    || wkt.includes('GEOMETRYCOLLECTION');
  const features = isMultipart
    ? new WKT().readFeatures(wkt, projection)
    : [new WKT().readFeature(wkt, projection)];
  const source = new VectorSource({ features });
  const layer = new VectorLayer({
    title,
    source,
    style,
    visible,
  });
  return layer;
}

// Add a WMS tile layer to the map.
function addWMSTileLayer({
  title = 'wms', url, params, visible = true, base = false,
}) {
  const source = new TileWMS({
    url,
    params,
  });
  const layer = new TileLayer({
    title,
    source,
    visible,
    type: base ? 'base' : 'normal',
  });
  return layer;
}

// Add an XYZ tile layer to the map.
function addXYZTileLayer({
  title = 'xyz', url, visible = true, base = false,
}) {
  const source = new XYZ({ url });
  const layer = new TileLayer({
    title,
    source,
    visible,
    type: base ? 'base' : 'normal',
  });
  return layer;
}

// Add a layer to the map by its type.
export default function addLayer(type, opts) {
  let layer;
  if (type.toLowerCase() === 'vector') {
    layer = addVectorLayer(opts);
  }
  if (type.toLowerCase() === 'geojson') {
    if (!opts.url) {
      throw new Error('Missing a GeoJSON url.');
    }
    layer = addGeoJSONLayer(opts);
  }
  if (type.toLowerCase() === 'wkt') {
    if (!opts.wkt) {
      throw new Error('Missing a WKT string.');
    }
    layer = addWKTLayer(opts);
  }
  if (type.toLowerCase() === 'wms') {
    if (!opts.url) {
      throw new Error('Missing a WMS url.');
    }
    layer = addWMSTileLayer(opts);
  }
  if (type.toLowerCase() === 'xyz') {
    if (!opts.url) {
      throw new Error('Missing an XYZ url.');
    }
    layer = addXYZTileLayer(opts);
  }

  // If a layer was created, add it to the map.
  if (layer) {

    // If a layer group is specified, create it if it doesn't already exist.
    if (opts.group) {
      let group;
      const mapLayersArray = this.map.getLayers().getArray();
      for (let i = 0; i < mapLayersArray.length; i += 1) {
        if (mapLayersArray[i].getLayers && mapLayersArray[i].get('title') === opts.group) {
          group = mapLayersArray[i];
        }
      }
      if (!group) {
        group = new LayerGroup({ title: opts.group });
        this.map.addLayer(group);
      }

      // Add the layer to the group.
      group.getLayers().push(layer);
    }

    // Otherwise, add the layer directly to the map.
    else {
      this.map.addLayer(layer);
    }

    // If this is a base layer, remember its visibility state with localStorage.
    if (layer.get('type') === 'base') {
      rememberLayer(layer);
    }

    // Dispatch an event.
    this.map.dispatchEvent('farmOS-map.layer', layer);

    // Return the layer.
    return layer;
  }
  throw new Error('Invalid layer type.');
}
