// Import source types, layer types, and formats.
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import Google from 'ol/source/Google';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import GeoJSON from 'ol/format/GeoJSON';

// Import setWithCredentials function.
import { setWithCredentials } from 'ol/featureloader';

// Import styles.
import * as Style from 'ol/style';
import colorStyles, { clusterStyle } from '../../styles';

// Import readFeatures function.
import readFeatures from './features';

// Import GoogleLogoAttribution control.
import GoogleLogoAttribution from '../../control/Google/GoogleLogoAttribution';

// Set withCredentials to true for all XHR requests made via OpenLayers'
// feature loader. Typically farmOS requires authentication in order to
// retrieve data from its GeoJSON endpoints. Setting withCredentials to true
// is a requirement for authentication credentials to be included in the
// request that OpenLayers makes.
setWithCredentials(true);

// Add a Vector layer to the map.
function addVectorLayer({
  title = 'vector', color = 'orange', styleFunction = null, visible = true, attribution = '',
}) {
  const style = styleFunction
    ? (feature, resolution) => styleFunction(feature, resolution, Style)
    : colorStyles(color);
  const attributions = [attribution];
  const source = new VectorSource({
    attributions,
  });
  const layer = new VectorLayer({
    title,
    source,
    style,
    visible,
  });
  return layer;
}

// Add a cluster layer to the map.
function addClusterLayer({
  title = 'cluster', url, styleFunction = clusterStyle, visible = true, attribution = '',
}) {
  const style = (feature, resolution) => styleFunction(feature, resolution, Style);
  const format = new GeoJSON();
  const attributions = [attribution];
  const centroidSource = new VectorSource({
    url,
    format,
    attributions,
  });
  const clusterSource = new Cluster({
    distance: 50,
    source: centroidSource,
  });
  const clusterLayer = new VectorLayer({
    title,
    source: clusterSource,
    style,
    visible,
  });
  return clusterLayer;
}

// Add a GeoJSON feature layer to the map.
function addGeoJSONLayer({
  title = 'geojson', url = '', geojson = {}, color = 'orange', styleFunction = null, visible = true, attribution = '',
}) {
  const style = styleFunction
    ? (feature, resolution) => styleFunction(feature, resolution, Style)
    : colorStyles(color);
  const format = new GeoJSON();
  const attributions = [attribution];
  let source;
  if (url) {
    source = new VectorSource({
      url,
      format,
      attributions,
    });
  } else {
    source = new VectorSource({
      features: readFeatures('geojson', geojson),
      format,
      attributions,
    });
  }
  const layer = new VectorLayer({
    title,
    source,
    style,
    visible,
  });
  return layer;
}

// Add a Google Map Tiles layer to the map.
function addGoogleMapTilesLayer({
  title = 'google-map-tiles', key, mapType = 'satellite', layerTypes = [], language = 'en-US', region = 'US', apiOptions = null, visible = true, base = true,
}) {
  const source = new Google({
    key,
    mapType,
    layerTypes,
    language,
    region,
    apiOptions,
    scale: 'scaleFactor2x',
    highDpi: true,
  });
  const layer = new TileLayer({
    title,
    source,
    visible,
    type: base ? 'base' : 'normal',
  });
  return layer;
}

// Add a Tile ArcGIS MapServer layer to the map.
function addTileArcGISMapServerLayer({
  title = 'arcgis-tile', url, params, visible = true, base = false, attribution = '', crossOrigin = null,
}) {
  const attributions = [attribution];
  const source = new TileArcGISRest({
    url,
    params,
    attributions,
    crossOrigin,
  });
  const layer = new TileLayer({
    title,
    source,
    visible,
    type: base ? 'base' : 'normal',
  });
  return layer;
}

// Add Well Known Text (WKT) geometry to the map.
function addWKTLayer({
  title = 'wkt', wkt, color = 'orange', styleFunction = null, visible = true, attribution = '',
}) {
  const style = styleFunction
    ? (feature, resolution) => styleFunction(feature, resolution, Style)
    : colorStyles(color);
  const features = readFeatures('wkt', wkt);
  const attributions = [attribution];
  const source = new VectorSource({
    features,
    attributions,
  });
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
  title = 'wms', url, params, visible = true, base = false, attribution = '', crossOrigin = null,
}) {
  const attributions = [attribution];
  const source = new TileWMS({
    url,
    params,
    attributions,
    crossOrigin,
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
  title = 'xyz', url, tileSize = 256, visible = true, base = false, attribution = '', crossOrigin = null,
}) {
  const attributions = [attribution];
  const source = new XYZ({
    url,
    tileSize,
    attributions,
    crossOrigin,
  });
  const layer = new TileLayer({
    title,
    source,
    visible,
    type: base ? 'base' : 'normal',
  });
  return layer;
}

// Get a layer by name, recursing into layer groups.
export function getLayerByName(name, optlayers = null) {
  const layers = optlayers || this.map.getLayers().getArray();
  for (let i = 0; i < layers.length; i += 1) {
    if (layers[i].getLayers) {
      const childLayerName = getLayerByName(name, layers[i].getLayers().getArray());
      if (childLayerName) {
        return childLayerName;
      }
    }
    if (layers[i].get('title') === name) {
      return layers[i];
    }
  }
  return false;
}

// Add a layer to the map by its type.
export default function addLayer(type, opts = {}) {
  let layer;
  if (type.toLowerCase() === 'group') {
    if (!opts.title) {
      throw new Error('Missing a Layer Group title.');
    }
    layer = new LayerGroup(opts);
  }
  if (type.toLowerCase() === 'vector') {
    layer = addVectorLayer(opts);
  }
  if (type.toLowerCase() === 'cluster') {
    if (!opts.url) {
      throw new Error('Missing a Cluster GeoJSON url.');
    }
    layer = addClusterLayer(opts);
  }
  if (type.toLowerCase() === 'geojson') {
    if (!opts.url && !opts.geojson) {
      throw new Error('Missing a GeoJSON url or object.');
    }
    layer = addGeoJSONLayer(opts);
  }
  if (type.toLowerCase() === 'google') {
    if (!opts.key) {
      throw new Error('Missing a Google Map Tiles API key.');
    }
    layer = addGoogleMapTilesLayer(opts);
    if (!this.map.getControls().getArray()
      .some(control => control instanceof GoogleLogoAttribution)) {
      this.map.addControl(new GoogleLogoAttribution());
    }
  }
  if (type.toLowerCase() === 'arcgis-tile') {
    if (!opts.url) {
      throw new Error('Missing a ArcGIS MapServer url.');
    }
    layer = addTileArcGISMapServerLayer(opts);
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
      group = this.getLayerByName(opts.group);
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

    // Dispatch an event.
    this.map.dispatchEvent('farmOS-map.layer', layer);

    // Return the layer.
    return layer;
  }
  throw new Error('Invalid layer type.');
}
