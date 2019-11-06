// /* eslint-disable */
import Control from 'ol/control/Control';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';
import EventType from 'ol/events/EventType';
import Draw, { createRegularPolygon } from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Translate from 'ol/interaction/Translate';
import Snap from 'ol/interaction/Snap';
import WKT from 'ol/format/WKT';

import projection from '../projection';
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
        label: '\u2B1F',
        tooltip: 'Draw a Polygon',
        draw: 'Polygon',
        element: drawButtonsDiv,
      },
      {
        name: 'line',
        label: '\u2500',
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
        label: '\u25EF',
        tooltip: 'Draw a Circle',
        draw: 'Circle',
        element: drawButtonsDiv,
      },
      {
        name: 'modify',
        label: '\u270d',
        tooltip: 'Modify features',
        element: actionButtonsDiv,
      },
      {
        name: 'move',
        label: '\u21c4',
        tooltip: 'Move features',
        element: actionButtonsDiv,
      },
      {
        name: 'delete',
        label: '\u2716',
        tooltip: 'Delete selected feature',
        visible: false,
        element: actionButtonsDiv,
      },
    ];
    for (let i = 0; i < buttons.length; i += 1) {
      this.buttons[buttons[i].name] = this.addButton(buttons[i].element, buttons[i]);
    }

    // Get the vector source from the layer.
    this.layer = options.layer;

    // Initialize interactions.
    this.selectInteraction = new Select({
      layers: [this.layer],
    });
    this.modifyInteraction = new Modify({
      features: this.selectInteraction.getFeatures(),
    });
    this.translateInteraction = new Translate({
      features: this.selectInteraction.getFeatures(),
    });
    this.drawInteraction = new Draw({
      source: this.layer.getSource(),
      type: 'Polygon',
    });
    this.snapInteraction = new Snap({
      source: this.layer.getSource(),
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

    // Collections of interaction event listeners that have been added by the
    // user via addInteractionListener(). Each event type will be an array of
    // objects, each with a callback and a format.
    this.eventListeners = {
      drawstart: [],
      drawend: [],
      delete: [],
    };
  }

  /**
   * Helper for creating a button element.
   * @param {DOMElement} element The main control element.
   * @param {object} options Options for the button.
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

      // Delete selected features.
      this.selectInteraction.getFeatures().forEach(f => this.layer.getSource().removeFeature(f));
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
        listeners.forEach(({ cb, format }) => this.addInteractionListener(eventName, cb, format));
      }
    });
  }

  /**
   * Disable draw interaction.
   * @private
   */
  disableDraw() {
    this.getMap().removeInteraction(this.drawInteraction);
  }

  /**
   * Enable select interaction.
   */
  enableSelect() {
    this.getMap().addInteraction(this.selectInteraction);
  }

  /**
   * Disable select interaction.
   */
  disableSelect() {
    this.getMap().removeInteraction(this.selectInteraction);
  }

  /**
   * Enable modify interaction.
   * @private
   */
  enableModify() {
    this.getMap().addInteraction(this.modifyInteraction);
  }

  /**
   * Disable modify interaction.
   * @private
   */
  disableModify() {
    this.getMap().removeInteraction(this.modifyInteraction);
  }

  /**
   * Enable select and translate interactions.
   * @private
   */
  enableMove() {
    this.getMap().addInteraction(this.translateInteraction);
  }

  /**
   * Disable select and translate interactions.
   * @private
   */
  disableMove() {
    this.getMap().removeInteraction(this.translateInteraction);
  }

  /**
   * Enable snap interaction.
   * @private
   */
  enableSnap() {
    this.getMap().addInteraction(this.snapInteraction);
  }

  /**
   * Disable snap interaction.
   * @private
   */
  disableSnap() {
    this.getMap().removeInteraction(this.snapInteraction);
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
   * Disable all edit interactions, deselect features, deactivate all buttons.
   * @private
   */
  disableAll() {
    this.disableDraw();
    this.disableSelect();
    this.disableModify();
    this.disableMove();
    this.disableSnap();
    this.deselectFeatures();
    this.toggleActiveButton(false, false);
    this.toggleDeleteButton(false);
  }

  /**
   * Deselect all features in the select interaction.
   * @private
   */
  deselectFeatures() {
    this.selectInteraction.getFeatures().clear();
    this.toggleDeleteButton(false);
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
  addInteractionListener(type, cb, format) {
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
    ];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid event type. Valid options include: ${validTypes.join(', ')}`);
    }
    if (['drawstart', 'drawend'].includes(type)) {
      this.drawInteraction.on(type, (e) => {
        const output = format.writeFeatures(this.getFeatures().concat(e.feature), projection);
        cb(output);
      });
      if (!this.eventListeners[type].includes({ cb, format })) {
        this.eventListeners[type].push({ cb, format });
      }
    } else if (['modifystart', 'modifyend'].includes(type)) {
      this.modifyInteraction.on(type, () => {
        const output = format.writeFeatures(this.getFeatures(), projection);
        cb(output);
      });
    } else if (['select'].includes(type)) {
      this.selectInteraction.on(type, (e) => {
        const features = e.selected;
        const output = format.writeFeatures(features, projection);
        cb(output);
      });
    } else if (['translatestart', 'translating', 'translateend'].includes(type)) {
      this.translateInteraction.on(type, () => {
        const output = format.writeFeatures(this.getFeatures(), projection);
        cb(output);
      });
    } else if (['delete'].includes(type)) {
      if (!this.eventListeners.delete.includes({ cb, format })) {
        this.eventListeners.delete.push({ cb, format });
      }
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
   * Setter which accepts features in Well Known Text (WKT) format and sets them
   * as the drawing layer's source features. This will clear all current
   * features first.
   * @param {string} wktString A string of WKT.
   * @api
   */
  setWKT(wktString) {
    const source = this.layer.getSource();
    source.clear();
    const isMultipart = wktString.includes('MULTIPOINT')
      || wktString.includes('MULTILINESTRING')
      || wktString.includes('MULTIPOLYGON')
      || wktString.includes('GEOMETRYCOLLECTION');
    const features = isMultipart
      ? new WKT({ splitCollection: true }).readFeatures(wktString, projection)
      : [new WKT().readFeature(wktString, projection)];
    source.addFeatures(features);
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

    // If event is "featurechange", add listeners for all event types.
    if (event === 'featurechange') {
      [
        'drawend',
        'modifyend',
        'translating',
        'translateend',
        'delete',
      ].forEach((type) => {
        this.addInteractionListener(type, cb, new WKT());
      });
      return;
    }

    // Otherwise, add the individual event listener.
    this.addInteractionListener(event, cb, new WKT());
  }
}

export default Edit;
