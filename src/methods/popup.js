// Import OpenLayers Popup.
import 'ol-popup/src/ol-popup.css';
import Popup from 'ol-popup';

// Add a popup to the map.
export default function addPopup(callback) {
  const popup = new Popup();
  this.map.addOverlay(popup);
  this.map.on('singleclick', (event) => {
    const content = callback(event);
    if (content) {
      popup.show(event.coordinate, content);
      popup.dispatchEvent('farmOS-map.popup');
    }
  });
  return popup;
}
