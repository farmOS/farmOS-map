import Control from 'ol/control/Control';
import Google from 'ol/source/Google';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';

import './GoogleLogoAttribution.css';

/**
 * @classdesc
 * OpenLayers GoogleLogoAttribution Control.
 *
 * @api
 */
class GoogleLogoAttribution extends Control {

  /**
   * @param {Options=} opts GoogleLogoAttribution options.
   */
  constructor(opts) {
    const options = opts || {};

    // Call the parent control constructor.
    super({
      element: document.createElement('div'),
      target: options.target,
    });

    // Define the class name.
    const className = 'ol-google-logo-attrib';

    // Add the CSS classes to the control element.
    const { element } = this;
    element.className = `${className} ${CLASS_UNSELECTABLE} ${CLASS_CONTROL}`;

    const logoImg = document.createElement('img');
    logoImg.style.pointerEvents = 'none';
    logoImg.src = 'https://developers.google.com/static/maps/documentation/images/google_on_white.png';

    element.appendChild(logoImg);
  }

  /**
   * @inheritDoc
   * @api
   */
  setMap(map) {
    const oldMap = this.getMap();
    if (map === oldMap) {
      return;
    }
    if (oldMap) {

      // Cleanup the old event listener
      if (this.onMapChangeLayerGroups) {
        oldMap.getLayerGroup().un('change', this.onMapChangeLayerGroups.listener);
        this.onMapChangeLayerGroups = null;
      }
    }
    super.setMap(map);

    if (map) {

      // Toggle the control visibility upon any top-level layer group change
      const updateState = () => {
        const anyVisibleGoogleLayers = map.getAllLayers().some(layer => layer.isVisible() && typeof layer.getSource === 'function' && layer.getSource() instanceof Google);

        this.element.style.display = anyVisibleGoogleLayers ? 'block' : 'none';
      };

      this.onMapChangeLayerGroups = map.getLayerGroup().on('change', updateState);
      updateState();
    }
  }

}

export default GoogleLogoAttribution;
