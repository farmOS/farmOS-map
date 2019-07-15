// Import OpenLayers CSS and base Map and View definitions.
import 'ol/ol.css';
import { Map, View } from 'ol';

// Import OL controls.
import { defaults as defaultControls, FullScreen, ScaleLine } from 'ol/control';

// Import OL interactions.
import { defaults as defaultInteractions } from 'ol/interaction';

// Import OL layer types.
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';

// Import OL source types.
import OSM from 'ol/source/OSM';

// Import ol-layerswitcher.
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';

// Import ol-geocoder.
import 'ol-geocoder/dist/ol-geocoder.css';
import Geocoder from 'ol-geocoder';

// Define an object that represents a single farmOS map instance.
const createInstance = ({ target }) => ({

  // The target element ID for the map.
  target,

  // The OpenLayers map object.
  map: new Map({
    target,
    layers: [
      new LayerGroup({
        title: 'Base layers',
        layers: [
          new TileLayer({
            title: 'OpenStreetMap',
            type: 'base',
            source: new OSM(),
          }),
        ],
      }),
    ],
    controls: defaultControls().extend([
      new LayerSwitcher(),
      new FullScreen(),
      new ScaleLine(),
      new Geocoder('nominatim', {
        provider: 'osm',
        placeholder: 'Search for address...',
        limit: 5,
        autoComplete: true,
      }),
    ]),
    interactions: defaultInteractions(),
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  }),
});
export default createInstance;
