import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import 'ol-geocoder/dist/ol-geocoder.css';

import { Map, View } from 'ol';
import { defaults as defaultControls, FullScreen, ScaleLine } from 'ol/control';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

import LayerSwitcher from 'ol-layerswitcher';
import Geocoder from 'ol-geocoder';

// Define window.farmOS if it isn't already.
if (typeof window.farmOS === 'undefined') {
  window.farmOS = {};
}

// Add a farmOS.map object that is available globaly.
window.farmOS.map = {

  // Array of farmOS map instances.
  instances: [],

  // Create a new farmOS map attached to a target element ID.
  create(target) {
    const map = new Map({
      target,
      layers: [
        new LayerGroup({
          title: 'Base layers',
          layers: [
            new TileLayer({
              title: 'Open Street Map',
              type: 'base',
              source: new XYZ({
                url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              }),
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
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // Add the map to the global instances array.
    const instance = {
      target,
      map,
    };
    this.instances.push(instance);
  },
};
