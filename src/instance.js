// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import source types, layer types, and formats.
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

import { createEmpty as extentCreateEmpty, extend as extendExtend } from 'ol/extent';

// Import OpenLayers Popup.
import 'ol-popup/src/ol-popup.css';
import Popup from 'ol-popup';

// Import defaults.
import defaults from './defaults';

// Import styles.
import styles from './styles';

// Import addDrawingControls function.
import addDrawingControls from './drawing';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target, options = {} }) => {

  // Add a GeoJSON feature layer to the map.
  function addGeoJSONLayer({
    title = 'geojson', url, color, visible = true,
  }) {
    const style = styles(color);
    const format = new GeoJSON();
    const source = new VectorSource({
      format,
      // Supply a loader function so we can be sure xhr.withCredentials === true.
      loader(extent, resolution, featureProjection) {
        const xhr = new XMLHttpRequest();
        const onError = () => source.removeLoadedExtent(extent);
        xhr.open('GET', url);
        xhr.withCredentials = true;
        xhr.onerror = onError;
        xhr.onload = () => {
          if (xhr.status === 200) {
            const features = format.readFeatures(xhr.responseText, {
              extent,
              featureProjection,
            });
            source.addFeatures(features);
          } else {
            onError();
          }
        };
        xhr.send();
      },
    });
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
    const opts = {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    };
    const features = isMultipart
      ? new WKT().readFeatures(wkt, opts)
      : [new WKT().readFeature(wkt, opts)];
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

  const instance = {

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

    // Add a layer to the map by its type.
    addLayer(type, opts) {
      let layer;
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
      // If a layer group is specified, search for it in the map, create it if
      // it doesn't exist, and add the layer to it.
      if (layer) {
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
          group.getLayers().push(layer);
        } else {
          this.map.addLayer(layer);
        }
        return layer;
      }
      throw new Error('Invalid layer type.');
    },

    // Add a popup to the map.
    addPopup(callback) {
      const popup = new Popup();
      instance.map.addOverlay(popup);
      instance.map.on('singleclick', (event) => {
        const content = callback(event);
        if (content) {
          popup.show(event.coordinate, content);
          popup.dispatchEvent('farmOS-map.popup');
        }
      });
      return popup;
    },

    // Zoom to all vector sources in the map, recursing into layer groups.
    zoomToVectors(optlayers = null) {
      const extent = extentCreateEmpty();
      const layers = optlayers || this.map.getLayers();
      layers.forEach((layer) => {
        if (layer.getLayers) {
          const lyrs = layer.getLayers();
          this.zoomToVectors(lyrs);
        } else if (typeof layer.getSource === 'function') {
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

    // Zoom to the given layer source in the map.
    zoomToLayer(layer) {
      const extent = extentCreateEmpty();
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
    },
  };

  // Add drawing controls, if drawing is true.
  if (options.drawing) {
    addDrawingControls(instance.map);
  }

  return instance;
};
export default createInstance;
