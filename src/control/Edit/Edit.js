import Control from 'ol/control/Control';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';
import EventType from 'ol/events/EventType';
import Draw, { createRegularPolygon } from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Translate from 'ol/interaction/Translate';
import Snap from 'ol/interaction/Snap';
import VectorSource from 'ol/source/Vector';
import Collection from 'ol/Collection';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

import projection from '../../projection';
import forEachLayer from '../../utils/forEachLayer';

import './Edit.css';


/**
 * @typedef {Object} Options
 * @property {string} [className='ol-edit'] CSS class name for the container.
 * @property {HTMLElement|string} [target] Specify a target if you want the
 * control to be rendered outside of the map's viewport.
 */


/**
 * @classdesc
 * OpenLayers Edit Controls.
 *
 * @api
 */
class Edit extends Control {
  /**
   * @param {Options=} opts Edit options.
   */
  constructor(opts) {
    const options = opts || {};

    // Call the parent control constructor.
    super({
      element: document.createElement('div'),
      target: options.target,
    });

    // Get the control element.
    const { element } = this;

    // Define the class name and add it to the element.
    const className = options.className || 'ol-edit';
    element.className = `${className} ${CLASS_UNSELECTABLE} ${CLASS_CONTROL}`;

    // Create elements to contain buttons for drawing and actions.
    const drawButtonsDiv = document.createElement('div');
    drawButtonsDiv.className = 'ol-edit-buttons draw';
    element.appendChild(drawButtonsDiv);
    const actionButtonsDiv = document.createElement('div');
    actionButtonsDiv.className = 'ol-edit-buttons actions';
    element.appendChild(actionButtonsDiv);

    // Add buttons for drawing and actions.
    this.buttons = {};
    const buttons = [
      {
        name: 'polygon',
        label: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>',
        tooltip: 'Draw a Polygon',
        draw: 'Polygon',
        element: drawButtonsDiv,
      },
      {
        name: 'line',
        label: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M23,8c0,1.1-0.9,2-2,2c-0.18,0-0.35-0.02-0.51-0.07l-3.56,3.55C16.98,13.64,17,13.82,17,14c0,1.1-0.9,2-2,2s-2-0.9-2-2 c0-0.18,0.02-0.36,0.07-0.52l-2.55-2.55C10.36,10.98,10.18,11,10,11s-0.36-0.02-0.52-0.07l-4.55,4.56C4.98,15.65,5,15.82,5,16 c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2c0.18,0,0.35,0.02,0.51,0.07l4.56-4.55C8.02,9.36,8,9.18,8,9c0-1.1,0.9-2,2-2s2,0.9,2,2 c0,0.18-0.02,0.36-0.07,0.52l2.55,2.55C14.64,12.02,14.82,12,15,12s0.36,0.02,0.52,0.07l3.55-3.56C19.02,8.35,19,8.18,19,8 c0-1.1,0.9-2,2-2S23,6.9,23,8z"/></g></g></g></svg>',
        tooltip: 'Draw a Line',
        draw: 'LineString',
        element: drawButtonsDiv,
      },
      {
        name: 'point',
        label: '\u2022',
        tooltip: 'Draw a Point',
        draw: 'Point',
        element: drawButtonsDiv,
      },
      {
        name: 'circle',
        label: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
        tooltip: 'Draw a Circle',
        draw: 'Circle',
        element: drawButtonsDiv,
      },
      {
        name: 'modify',
        label: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M 23,7 V 1 H 17 V 3 H 7 V 1 H 1 V 7 H 3 V 17 H 1 v 6 h 6 v -2 h 10 v 2 h 6 V 17 H 21 V 7 Z M 3,3 H 5 V 5 H 3 Z M 5,21 H 3 V 19 H 5 Z M 17,19 H 7 V 17 H 5 V 7 H 7 V 5 h 10 v 2 h 2 v 10 h -2 z m 4,2 h -2 v -2 h 2 z M 19,5 V 3 h 2 v 2 z"/></g></g></g></svg>',
        tooltip: 'Modify features',
        element: actionButtonsDiv,
      },
      {
        name: 'move',
        label: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>',
        tooltip: 'Move features',
        element: actionButtonsDiv,
      },
      {
        name: 'delete',
        label: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>',
        tooltip: 'Delete selected feature',
        visible: false,
        element: actionButtonsDiv,
      },
    ];
    for (let i = 0; i < buttons.length; i += 1) {
      this.buttons[buttons[i].name] = this.addButton(buttons[i].element, buttons[i]);
    }

    // Get the drawing layer from the options.
    this.layer = options.layer;

    // Collections of interaction event listeners that have been added by the
    // user via addInteractionListener(). Each event type will be an array of
    // objects, each with a callback and a format.
    this.eventListeners = {
      drawstart: [],
      drawend: [],
      modifystart: [],
      modifyend: [],
      translatestart: [],
      translating: [],
      translateend: [],
      select: [],
      delete: [],
      disable: [],
    };
  }

  /**
   * Helper for creating a button element.
   * @param {DOMElement} element The main control element.
   * @param {object} options Options for the button.
   * @return {DOMElement} The new button element.
   * @private
   */
  addButton(element, options) {
    const { label, tooltip } = options;
    const button = document.createElement('button');
    button.name = options.name;
    button.className = `ol-edit-${options.name}`;
    button.type = 'button';
    button.title = tooltip;
    button.innerHTML = label;
    if (options.visible === false) {
      button.style.display = 'none';
    }
    if (options.draw) {
      button.draw = options.draw;
    }
    button.addEventListener(EventType.CLICK, this.handleClick.bind(this), false);
    element.appendChild(button);
    return button;
  }

  /**
   * Callback for button click events.
   * @param {MouseEvent} event The event to handle
   * @private
   */
  handleClick(event) {
    event.preventDefault();

    // If event.target.name isn't set, bail.
    if (!event.target.name) {
      return;
    }

    // If the button is already active, disable all edit features.
    if (this.buttons[event.target.name].classList.contains('active')) {
      this.disableAll();
      return;
    }

    // First, check to see if the delete button was clicked, because it is an
    // exception to the general button behaviors that follow. If so, handle the
    // delete logic and then stop further execution of this function.
    if (event.target.name === 'delete') {

      // Delete selected features from the drawing layer and the snap
      // interaction's feature collection.
      this.selectInteraction.getFeatures().forEach((f) => {
        this.layer.getSource().removeFeature(f);
        if (this.snapInteraction) {
          this.snapInteraction.removeFeature(f);
        }
      });
      this.selectInteraction.getFeatures().clear();

      // Call event listeners.
      this.eventListeners.delete.forEach(({ cb, format }) => {
        cb(format.writeFeatures(this.getFeatures(), projection));
      });

      // Remove the delete button.
      this.toggleDeleteButton(false);

      // Prevent further execution of this function.
      return;
    }

    // Disable all edit features.
    this.disableAll();

    // Toggle the active button styles.
    this.toggleActiveButton(event.target.name);

    // Enable escape key detection.
    this.enableEscape();

    // If one of the drawing buttons was clicked, enable the draw and snap
    // interactions.
    const drawingButtons = ['point', 'line', 'polygon', 'circle'];
    if (drawingButtons.includes(event.target.name)) {
      this.enableDraw(event.target.draw);
      this.enableSnap();
    }

    // If the modify button was clicked, enable the select, modify, and snap
    // interactions.
    else if (event.target.name === 'modify') {
      this.enableSelect();
      this.enableModify();
      this.enableSnap();
    }

    // If the move button was clicked, enable the select and move interactions.
    else if (event.target.name === 'move') {
      this.enableSelect();
      this.enableMove();
    }
  }

  /**
   * Callback for escape key press. Deactivate all edit features.
   * @param {KeyboardEvent} event The event to handle
   * @private
   */
  handleEscape(event) {
    if (event.key === 'Escape') {
      this.disableAll();
      document.removeEventListener(EventType.KEYDOWN, this.handleEscape, false);
    }
  }

  /**
   * Enable draw interaction.
   * @param {string} type The type of draw interaction (Point, Line, Polygon).
   * @private
   */
  enableDraw(type) {

    // In the case of circles, we convert to a polygon with 100 sides.
    let geometryFunction;
    if (type === 'Circle') {
      geometryFunction = createRegularPolygon(100);
    }

    // Create the draw interaction and add it to the map.
    this.drawInteraction = new Draw({
      source: this.layer.getSource(),
      type,
      geometryFunction,
    });
    this.getMap().addInteraction(this.drawInteraction);

    // Add event listeners back to the newly instantiated Draw interaction.
    Object.entries(this.eventListeners).forEach(([eventName, listeners]) => {
      if (['drawstart', 'drawend'].includes(eventName)) {
        listeners.forEach(({ cb, format }) => {
          this.drawInteraction.on(eventName, (e) => {
            const output = format.writeFeatures(this.getFeatures().concat(e.feature), projection);
            cb(output, e);
          });
        });
      }
    });

    // Add an event listener that adds newly drawn features to the snap
    // interaction's feature collection (so that they can be snapped to).
    this.drawInteraction.on('drawend', (event) => {
      if (event.feature && this.snapInteraction) {
        this.snapInteraction.addFeature(event.feature);
      }
    });
  }

  /**
   * Enable select interaction.
   */
  enableSelect() {
    if (!this.selectInteraction) {
      this.selectInteraction = new Select({
        layers: [this.layer],
      });

      // Add event listeners to the newly instantiated Select interaction.
      Object.entries(this.eventListeners).forEach(([eventName, listeners]) => {
        if (['select'].includes(eventName)) {
          listeners.forEach(({ cb, format }) => {
            this.selectInteraction.on(eventName, (e) => {
              const output = format.writeFeatures(e.selected, projection);
              cb(output, e);
            });
          });
        }
      });

      // When a select event fires, if there are features selected, show the
      // delete button. Otherwise, hide it.
      this.selectInteraction.on('select', (event) => {
        if (event.selected.length) {
          this.toggleDeleteButton(true);
        } else {
          this.toggleDeleteButton(false);
        }
      });
    }
    this.getMap().addInteraction(this.selectInteraction);
  }

  /**
   * Enable modify interaction.
   * @private
   */
  enableModify() {
    if (!this.modifyInteraction) {
      this.modifyInteraction = new Modify({
        features: this.selectInteraction.getFeatures(),
      });

      // Add event listeners to the newly instantiated Modify interaction.
      Object.entries(this.eventListeners).forEach(([eventName, listeners]) => {
        if (['modifystart', 'modifyend'].includes(eventName)) {
          listeners.forEach(({ cb, format }) => {
            this.modifyInteraction.on(eventName, (e) => {
              const output = format.writeFeatures(this.getFeatures(), projection);
              cb(output, e);
            });
          });
        }
      });
    }
    this.getMap().addInteraction(this.modifyInteraction);
  }

  /**
   * Enable translate interaction.
   * @private
   */
  enableMove() {
    if (!this.translateInteraction) {
      this.translateInteraction = new Translate({
        features: this.selectInteraction.getFeatures(),
      });

      // Add event listeners to the newly instantiated Translate interaction.
      Object.entries(this.eventListeners).forEach(([eventName, listeners]) => {
        if (['translatestart', 'translating', 'translateend'].includes(eventName)) {
          listeners.forEach(({ cb, format }) => {
            this.translateInteraction.on(eventName, (e) => {
              const output = format.writeFeatures(this.getFeatures(), projection);
              cb(output, e);
            });
          });
        }
      });
    }
    this.getMap().addInteraction(this.translateInteraction);
  }

  /**
   * Enable snap interaction.
   * @private
   */
  enableSnap() {
    if (!this.snapInteraction) {
      this.snapInteraction = new Snap({
        features: this.layer.getSource().getFeaturesCollection() || new Collection(),
      });

      // Load all vector layer features in the map and add them to the snap
      // interaction's feature collection (so they can be snapped to).
      forEachLayer(this.getMap().getLayerGroup(), (layer) => {
        if (typeof layer.getSource === 'function') {
          const source = layer.getSource();
          if (source !== 'null' && source instanceof VectorSource) {
            const features = source.getFeatures();
            if (source.getState() === 'ready' && features.length > 0) {
              features.forEach((feature) => {
                this.snapInteraction.addFeature(feature);
              });
            }
          }
        }
      });
    }
    this.getMap().addInteraction(this.snapInteraction);
  }

  /**
   * Enable escape key listener.
   * @private
   */
  enableEscape() {
    this.handleEscape = this.handleEscape.bind(this);
    document.addEventListener(EventType.KEYDOWN, this.handleEscape, false);
  }

  /**
   * Disable all edit interactions, deselect features, deactivate all buttons,
   * and call 'disable' event listeners.
   * @private
   */
  disableAll() {
    const interactions = [
      'drawInteraction',
      'modifyInteraction',
      'selectInteraction',
      'snapInteraction',
      'translateInteraction',
    ];
    interactions.forEach((interaction) => {
      if (this[interaction]) {
        if (interaction === 'selectInteraction') {
          this[interaction].getFeatures().clear();
        }
        this.getMap().removeInteraction(this[interaction]);
      }
    });
    this.toggleActiveButton(false, false);
    this.toggleDeleteButton(false);
    this.eventListeners.disable.forEach(({ cb, format }) => {
      cb(format.writeFeatures(this.getFeatures(), projection));
    });
  }

  /**
   * Toggle the active button style.
   * @param {string} name The name of the button.
   * @param {bool} activate Whether or not the make the button active. If true
   *   (default), the button will receive the "active" class, and all other
   *   buttons will lose it. If false, all buttons will lose the "active" class.
   * @private
   */
  toggleActiveButton(name, activate = true) {
    Object.keys(this.buttons).forEach((key) => {
      if (this.buttons[key].name === name && activate) {
        this.buttons[key].classList.add('active');
      } else {
        this.buttons[key].classList.remove('active');
      }
    });
  }

  /**
   * Toggle delete button visibility.
   * @param {bool} visible Whether or not to make the delete button visible.
   * @private
   */
  toggleDeleteButton(visible) {
    if (visible) {
      this.buttons.delete.style.display = 'block';
    }
    else {
      this.buttons.delete.style.display = 'none';
    }
  }

  /**
   * Helper for attaching an event listener to interactions.
   * @param {string} type The type of event.
   * @param {function} cb The callback provided by the user.
   * @param {ol.format} format The format for the output (eg, WKT, GeoJSON, etc).
   * @private
   */
  addInteractionListener(type, cb, format = new GeoJSON()) {
    const validTypes = [
      'drawstart',
      'drawend',
      'modifystart',
      'modifyend',
      'translatestart',
      'translating',
      'translateend',
      'select',
      'delete',
      'disable',
    ];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid event type. Valid options include: ${validTypes.join(', ')}`);
    }
    if (!this.eventListeners[type].includes({ cb, format })) {
      this.eventListeners[type].push({ cb, format });
    }
  }

  /**
   * Getter that returns the features in the drawing layer.
   * @api
   */
  getFeatures() {
    return this.layer.getSource().getFeatures();
  }

  /**
   * Getter that returns the geometry of all features in the drawing layer in
   * Well Known Text (WKT) format.
   * @api
   */
  getWKT() {
    return new WKT().writeFeatures(this.getFeatures(), projection);
  }

  /**
   * Getter that returns the geometry of all features in the drawing layer in
   * GeoJSON format.
   * @api
   */
  getGeoJSON() {
    const features = this.layer.getSource().getFeatures();
    return new GeoJSON().writeFeatures(features, projection);
  }

  /**
   * Sets a listener on drawing interactions to retrieve the drawing layer in
   * Well Known Text (WKT) format.
   * @param {string} event The type of event.
   * @param {function} cb A callback function provided by the user to be
   * executed when the event fires.
   * @api
   */
  wktOn(event, cb) {
    this.formatOn(event, cb, new WKT());
  }

  /**
   * Sets a listener on drawing interactions to retrieve the drawing layer in
   * GeoJSON format.
   * @param {string} event The type of event.
   * @param {function} cb A callback function provided by the user to be
   * executed when the event fires.
   * @api
   */
  geoJSONOn(event, cb) {
    this.formatOn(event, cb, new GeoJSON());
  }

  /**
   * Internal helper function used by wktOn() and geoJSONOn(). Adds a special
   * "featurechange" event type which encompasses all events that change
   * feature geometry on the drawing layer.
   * @param {string} event The type of event.
   * @param {function} cb A callback function provided by the user to be
   * executed when the event fires.
   * @param {ol.format} format The OpenLayers format (eg: WKT, GeoJSON, etc).
   * @private
   */
  formatOn(event, cb, format) {

    // If event is "featurechange", add listeners for all event types.
    if (event === 'featurechange') {
      [
        'drawend',
        'modifyend',
        'translating',
        'translateend',
        'delete',
      ].forEach((type) => {
        this.addInteractionListener(type, cb, format);
      });
      return;
    }

    // Otherwise, add the individual event listener.
    this.addInteractionListener(event, cb, format);
  }
}

export default Edit;
