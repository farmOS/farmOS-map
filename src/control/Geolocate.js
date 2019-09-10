import Control from 'ol/control/Control';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';
import EventType from 'ol/events/EventType';
import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import './Geolocate.css';


/**
 * @typedef {Object} Options
 * @property {string} [className='ol-geolocate'] CSS class name.
 * @property {string} [label='Geolocate'] Text label to use for the button.
 * @property {string} [tooltip='Zoom out'] Text to use for the button tooltip.
 * @property {HTMLElement|string} [target] Specify a target if you want the
 * control to be rendered outside of the map's viewport.
 */


/**
 * @classdesc
 * OpenLayers Geolocate Control.
 *
 * @api
 */
class Geolocate extends Control {
  /**
   * @param {Options=} opt_options Rotate options.
   */
  constructor(opts) {
    const options = opts || {};

    // Call the parent control constructor.
    super({
      element: document.createElement('div'),
      target: options.target,
    });

    // Define the class name.
    const className = options.className || 'ol-geolocate';

    // Define default button label and tooltip.
    const label = options.label || '◎';
    const tooltip = options.tooltip || 'Geolocate';

    // Create the geolocate button element.
    const button = document.createElement('button');
    button.innerHTML = label;
    button.title = tooltip;
    button.className = className;
    button.type = 'button';

    // Register a click event on the button.
    button.addEventListener(EventType.CLICK, this.handleClick.bind(this), false);

    // Add the button and CSS classes to the control element.
    const { element } = this;
    element.className = `${className} ${CLASS_UNSELECTABLE} ${CLASS_CONTROL}`;
    element.appendChild(button);
  }

  /**
   * Callback for the geolocate button click event.
   * @param {MouseEvent} event The event to handle
   * @private
   */
  handleClick(event) {
    event.preventDefault();
    const map = this.getMap();

    // Create a geolocation object.
    this.geolocation = this.geolocation || new Geolocation({
      projection: map.getView().getProjection(),
    });

    // Create position and accuracy features.
    this.positionFeature = this.positionFeature || new Feature();
    this.accuracyFeature = this.accuracyFeature || new Feature();

    // Draw the position and accuracy features on the map.
    this.geolocateLayer = this.geolocateLayer || new VectorLayer({
      map,
      source: new VectorSource({
        features: [this.positionFeature, this.accuracyFeature],
      }),
    });

    // Turn on geo tracking.
    this.geolocation.setTracking(true);

    // When the position changes...
    this.geolocation.on('change:position', () => {
      // Get the geolocated coordinates.
      const coordinates = this.geolocation.getPosition();

      // Center on the position.
      map.getView().setCenter(coordinates);

      // Set the zoom to 18.
      map.getView().setZoom(18);

      // Set the geometry of the position feature.
      this.positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);

      // Turn off geo tracking.
      this.geolocation.setTracking(false);
    });

    // When the accuracy changes...
    this.geolocation.on('change:accuracyGeometry', () => {
      this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
    });
  }
}

export default Geolocate;
