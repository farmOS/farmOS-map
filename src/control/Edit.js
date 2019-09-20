import Control from 'ol/control/Control';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';
import EventType from 'ol/events/EventType';
import Draw from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Translate from 'ol/interaction/Translate';

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
    const buttons = [
      {
        name: 'polygon',
        label: '\u2B1F',
        tooltip: 'Draw a Polygon',
      },
      {
        name: 'line',
        label: '\u2500',
        tooltip: 'Draw a Line',
      },
      {
        name: 'point',
        label: '\u2022',
        tooltip: 'Draw a Point',
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
      },
    ];
    for (let i = 0; i < buttons.length; i += 1) {
      this.addButton(element, buttons[i]);
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
    button.className = `ol-edit-${options.name}`;
    button.type = 'button';
    button.title = tooltip;
    button.innerHTML = label;
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
}

export default Edit;
