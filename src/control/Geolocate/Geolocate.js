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
   * @param {Options=} opts Geolocate options.
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
    const label = options.label || '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>';
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

    // Determine if the control is active. Defaults to false on the first click.
    this.active = this.active || false;

    // Activate or deactivate the class.
    if (!this.active) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  /**
   * Activate the geolocate control.
   * @private
   */
  activate() {
    this.active = true;

    // Add the "active" class.
    this.element.classList.add('active');

    // Get the map.
    const map = this.getMap();

    // Create a geolocation object.
    this.geolocation = this.geolocation || new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
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

    // When the position or accuracy changes, update the features.
    this.geolocation.on('change:position', () => {
      this.updateFeatures();
    });
    this.geolocation.on('change:accuracyGeometry', () => {
      this.updateFeatures();
    });

    // When the position changes the first time, update the map view.
    this.geolocation.once('change:position', () => {
      this.updateView();
    });
  }

  /**
   * Deactivate the geolocate control.
   * @private
   */
  deactivate() {
    this.active = false;

    // Remove the "active" class.
    this.element.classList.remove('active');

    // Turn off geo tracking.
    this.geolocation.setTracking(false);

    // Hide the features.
    this.positionFeature.setGeometry();
    this.accuracyFeature.setGeometry();
  }

  /**
   * Update position and accuracy features.
   * @private
   */
  updateFeatures() {

    // Get the geolocated coordinates.
    this.coordinates = this.geolocation.getPosition();

    // Set the position geometry.
    this.positionFeature.setGeometry(new Point(this.coordinates));

    // Set the accuracy geometry.
    this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
  }

  /**
   * Update the map view's center and zoom based on the geolocation.
   * @private
   */
  updateView() {
    const map = this.getMap();
    map.getView().setCenter(this.coordinates);
    map.getView().setZoom(18);
  }
}

export default Geolocate;
