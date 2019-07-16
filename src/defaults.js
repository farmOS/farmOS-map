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

// Import OL controls.
import { defaults as defaultControls, FullScreen, ScaleLine } from 'ol/control';

// Import OL interactions.
import { defaults as defaultInteractions } from 'ol/interaction';

// Define an object that contains the default layers, controls, and interactions
// that will be added to all farmOS maps.
const defaults = {

  // Layers.
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

  // Controls.
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

  // Interactions.
  interactions: defaultInteractions(),
};
export default defaults;
