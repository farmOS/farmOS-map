// /* eslint-disable */
import Control from 'ol/control/Control';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';
import EventType from 'ol/events/EventType';
import Draw from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Translate from 'ol/interaction/Translate';
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

    // Add buttons.
    this.buttons = {};
    const buttons = [
      {
        name: 'polygon',
        label: '\u2B1F',
        tooltip: 'Draw a Polygon',
        draw: 'Polygon',
      },
      {
        name: 'line',
        label: '\u2500',
        tooltip: 'Draw a Line',
        draw: 'LineString',
      },
      {
        name: 'point',
        label: '\u2022',
        tooltip: 'Draw a Point',
        draw: 'Point',
      },
      {
        name: 'select',
        label: '\u270d',
        tooltip: 'Select/modify/move a feature',
      },
      {
        name: 'delete',
        label: '\u2716',
        tooltip: 'Delete selected feature',
        visible: false,
      },
    ];
    for (let i = 0; i < buttons.length; i += 1) {
      this.buttons[buttons[i].name] = this.addButton(element, buttons[i]);
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

    // When a select event fires, if there are features selected, show the
    // delete button. Otherwise, hide it.
    this.selectInteraction.on('select', (event) => {
      if (event.selected.length) {
        this.buttons.delete.style.display = 'unset';
      } else {
        this.buttons.delete.style.display = 'none';
      }
    });

    // A collection of event listeners that have been added to the Draw
    // interaction by the user, via addInteractionListener().
    this.drawListeners = {
      drawstart: [],
      drawend: [],
    };
    this.deleteListeners = [];
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

    // If one of the drawing buttons was clicked, disable the select
    // interactions, and enable the draw interaction, for either point, line,
    // or polygon.
    const drawingButtons = ['point', 'line', 'polygon'];
    if (drawingButtons.includes(event.target.name)) {
      this.disableSelect();
      this.enableDraw(event.target.draw);
    }

    // If the select button was clicked, disable all draw interactions, and
    // enable the select interactions.
    else if (event.target.name === 'select') {
      this.disableDraw();
      this.enableSelect();
    }

    // If the delete button was clicked, delete selected features, call event
    // listeners (WKT is hardcoded as the format for now), and remove button.
    else if (event.target.name === 'delete') {
      this.selectInteraction.getFeatures().forEach(f => this.layer.getSource().removeFeature(f));
      this.selectInteraction.getFeatures().clear();
      this.deleteListeners.forEach((cb) => {
        const features = this.layer.getSource().getFeatures();
        cb(new WKT().writeFeatures(features, projection));
      });
      this.buttons.delete.style.display = 'none';
    }

    // Toggle the active button styles (except delete).
    if (event.target.name !== 'delete') {
      this.toggleActiveButton(event.target.name);
    }
  }

  /**
   * Enable draw interaction.
   * @param {string} type The type of draw interaction (Point, Line, Polygon).
   * @private
   */
  enableDraw(type) {
    this.disableDraw();
    this.drawInteraction = new Draw({
      source: this.layer.getSource(),
      type,
    });
    this.getMap().addInteraction(this.drawInteraction);

    // Add event listeners back to the newly instantiated Draw interaction. WKT
    // is hardcoded for now, but we may need to accomodate GeoJSON in the future.
    Object.entries(this.drawListeners).forEach(([eventName, cbs]) => {
      cbs.forEach(cb => this.addInteractionListener(eventName, cb, new WKT()));
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
   * Enable select, modify, and translate interactions.
   * @private
   */
  enableSelect() {
    this.getMap().addInteraction(this.selectInteraction);
    this.getMap().addInteraction(this.modifyInteraction);
    this.getMap().addInteraction(this.translateInteraction);
  }

  /**
   * Disable select, modify, and translate interactions.
   * @private
   */
  disableSelect() {
    this.getMap().removeInteraction(this.selectInteraction);
    this.getMap().removeInteraction(this.modifyInteraction);
    this.getMap().removeInteraction(this.translateInteraction);
  }

  /**
   * Toggle the active button style.
   * @param {string} name The name of the button to make active.
   * @private
   */
  toggleActiveButton(name) {
    Object.keys(this.buttons).forEach((key) => {
      if (this.buttons[key].name === name) {
        this.buttons[key].classList.add('active');
      } else {
        this.buttons[key].classList.remove('active');
      }
    });
  }

  /**
   * Helper for attaching an event listener to interactions.
   * @param {string} type The type of event.
   * @param {function} cb The callback provided by the user.
   * @param {ol.format} format The format for the output (eg, WKT, GeoJSON, etc).
   * @private
   */
  addInteractionListener(type, cb, format) {
    if (['drawstart', 'drawend'].includes(type)) {
      this.drawInteraction.on(type, (e) => {
        const features = this.layer.getSource().getFeatures().concat(e.feature);
        const output = format.writeFeatures(features, projection);
        cb(output);
      });
      if (!this.drawListeners[type].includes(cb)) {
        this.drawListeners[type].push(cb);
      }
    } else if (['modifystart', 'modifyend'].includes(type)) {
      this.modifyInteraction.on(type, () => {
        const features = this.layer.getSource().getFeatures();
        const output = format.writeFeatures(features, projection);
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
        const features = this.layer.getSource().getFeatures();
        const output = format.writeFeatures(features, projection);
        cb(output);
      });
    } else if (['delete'].includes(type)) {
      if (!this.deleteListeners.includes(cb)) {
        this.deleteListeners.push(cb);
      }
    } else {
      throw new Error('Invalid event type. Valid options include: '
      + '"drawstart", "drawend", "modifystart", "modifyend", "select", '
      + '"translatestart", "translating", "translateend" or "delete"');
    }
  }

  /**
   * Getter that returns the geometry of all features in the drawing layer in
   * Well Known Text (WKT) format.
   * @api
   */
  getWKT() {
    const features = this.layer.getSource().getFeatures();
    return new WKT().writeFeatures(features, projection);
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
