// Import forEachLayer helper function.
import forEachLayer from '../utils/forEachLayer';

// Load saved layer visibility state from localStorage.
function loadLayerVisibility(layer) {
  const title = layer.get('title');
  if (title) {
    const itemName = `farmOS.map.layers.${title}.visible`;
    if (localStorage.getItem(itemName) !== null) {
      const visible = (JSON.parse(localStorage.getItem(itemName)) === true);
      layer.setVisible(visible);
    }
  }
}

// Save layer visibility state to localStorage.
function saveLayerVisibility(layer) {
  const title = layer.get('title');
  if (title) {
    const itemName = `farmOS.map.layers.${title}.visible`;
    const visible = JSON.stringify(layer.get('visible'));
    localStorage.setItem(itemName, visible);
  }
}

// Remember layer behavior.
export default {
  attach(instance) {

    // Update layer visibility.
    this.update(instance);

    // When new layers are added, update layer visibility.
    instance.map.on('farmOS-map.layer', () => {
      this.update(instance);
    });
  },

  // Remember visibility state of a specific layer.
  remember(layer) {
    loadLayerVisibility(layer);
    layer.on('change:visible', (e) => {
      saveLayerVisibility(e.target);
    });
  },

  // Update all layer visibility states.
  update(instance) {

    // Remember visibility state of base layers.
    forEachLayer(instance.map.getLayerGroup(), (layer) => {
      if (layer.get('type') === 'base') {
        this.remember(layer);
      }
    });
  },
};
