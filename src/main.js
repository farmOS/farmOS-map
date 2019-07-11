import 'ol/ol.css';

import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

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
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          }),
        }),
      ],
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
