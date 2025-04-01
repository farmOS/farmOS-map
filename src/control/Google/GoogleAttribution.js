import Control from 'ol/control/Control';
import Google from 'ol/source/Google';
import forEachLayer from '../../utils/forEachLayer';

/**
 * @classdesc
 * OpenLayers GoogleAttribution Control.
 *
 * @api
 */
class GoogleAttribution extends Control {
  constructor() {
    const element = document.createElement('img');
    element.style.pointerEvents = 'none';
    element.style.position = 'absolute';
    element.style.bottom = '5px';
    element.style.left = '5px';
    element.src = 'https://developers.google.com/static/maps/documentation/images/google_on_white.png';
    super({
      element,
    });
  }

  /**
   * @inheritDoc
   * @api
   */
  setMap(map) {
    super.setMap(map);

    // Subscribe to the change:visible event on all base layers.
    map.on('farmOS-map.layer', () => {
      forEachLayer(this.getMap().getLayerGroup(), (layer) => {
        if (layer.get('type') === 'base' && typeof layer.getSource === 'function') {
          layer.on('change:visible', this.toggle.bind(this));
        }
      });
    });
  }

  /**
   * Callback to toggle the Google attribution.
   * @private
   */
  toggle(event) {

    // Only react to layers becoming visible.
    if (event.target.get('visible') === true) {

      // If it is a Google layer, display attribution.
      const source = event.target.getSource();
      if (source !== null && source instanceof Google) {
        this.element.style.display = 'block';
      }

      // Else, hide the Google attribution.
      else {
        this.element.style.display = 'none';
      }
    }
  }
}

export default GoogleAttribution;
