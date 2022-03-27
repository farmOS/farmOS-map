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
        label: '<svg width="17mm" height="17mm" version="1.1" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-103.12 -91.164)"><g stroke-linecap="round" stroke-linejoin="round"><path d="m105.47 104.55 1.9288-4.7729 2.639 0.0209 1.7829-4.412h5.9829l-3.6988 9.1529z" color="#000000" fill="#dcdcdc" style="-inkscape-stroke:none"/><path d="m111.82 94.883a0.50005 0.50005 0 0 0-0.46289 0.3125l-1.6562 4.0957-2.2988-0.01758a0.50005 0.50005 0 0 0-0.46679 0.3125l-1.9297 4.7734a0.50005 0.50005 0 0 0 0.46484 0.6875l8.6348-0.0117a0.50005 0.50005 0 0 0 0.46289-0.3125l3.6992-9.1523a0.50005 0.50005 0 0 0-0.46485-0.6875zm0.33789 1h4.9043l-3.2949 8.1523-7.5566 0.01 1.5234-3.7695 2.2988 0.0195a0.50005 0.50005 0 0 0 0.46875-0.3125z" color="#000000" fill="#808080" style="-inkscape-stroke:none"/></g><g fill="#808080" stroke-width=".31736"><ellipse cx="117.8" cy="95.382" rx="1.082" ry="1.0816"/><circle cx="111.82" cy="95.382" r="1.0816"/><ellipse cx="110.04" cy="99.794" rx="1.0816" ry="1.0816"/><ellipse cx="107.4" cy="99.773" rx="1.0816" ry="1.0816"/><ellipse cx="105.47" cy="104.55" rx="1.0816" ry="1.0816"/><ellipse cx="114.1" cy="104.54" rx="1.0816" ry="1.0816"/></g></g></svg>',
        tooltip: 'Draw a Polygon',
        draw: 'Polygon',
        element: drawButtonsDiv,
      },
      {
        name: 'line',
        label: '<svg width="17mm" height="17mm" version="1.1" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-103.12 -91.164)"><path transform="matrix(.26458 0 0 .26458 103.12 91.164)" d="m50.824 20.885a4.0879 4.0879 0 0 0-4.0879 4.0879 4.0879 4.0879 0 0 0 0.18945 1.2285l-7.3379 7.3379a4.0879 4.0879 0 0 0-1.2266-0.19141 4.0879 4.0879 0 0 0-1.2305 0.19141l-5.1719-5.1758a4.0879 4.0879 0 0 0 0.18945-1.2266 4.0879 4.0879 0 0 0-4.0879-4.0879 4.0879 4.0879 0 0 0-4.0879 4.0879 4.0879 4.0879 0 0 0 0.18945 1.2266l-8.582 8.5801a4.0879 4.0879 0 0 0-1.2266-0.18945 4.0879 4.0879 0 0 0-4.0879 4.0879 4.0879 4.0879 0 0 0 4.0879 4.0879 4.0879 4.0879 0 0 0 4.0879-4.0879 4.0879 4.0879 0 0 0-0.1875-1.2266l8.5801-8.5801a4.0879 4.0879 0 0 0 1.2266 0.18945 4.0879 4.0879 0 0 0 1.2285-0.18945l5.1719 5.1758a4.0879 4.0879 0 0 0-0.1875 1.2246 4.0879 4.0879 0 0 0 4.0879 4.0879 4.0879 4.0879 0 0 0 4.0879-4.0879 4.0879 4.0879 0 0 0-0.18945-1.2246l7.3398-7.3379a4.0879 4.0879 0 0 0 1.2246 0.1875 4.0879 4.0879 0 0 0 4.0879-4.0879 4.0879 4.0879 0 0 0-4.0879-4.0879z" color="#000000" fill="#808080" stroke-linecap="round" stroke-width="3.7795" style="-inkscape-stroke:none"/></g></svg>',
        tooltip: 'Draw a Line',
        draw: 'LineString',
        element: drawButtonsDiv,
      },
      {
        name: 'point',
        label: '<svg width="17mm" height="17mm" version="1.1" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-103.12 -91.164)"><ellipse cx="111.69" cy="99.486" rx="1.0816" ry="1.0816" fill="#808080" stroke-width=".31736"/></g></svg>',
        tooltip: 'Draw a Point',
        draw: 'Point',
        element: drawButtonsDiv,
      },
      {
        name: 'circle',
        label: '<svg width="17mm" height="17mm" version="1.1" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-103.12 -91.164)"><g transform="translate(411.65 275)"><g stroke-linecap="round" stroke-linejoin="round"><path d="m-295.14-175.51a4.8232 4.8232 0 0 1-4.8232 4.8232 4.8232 4.8232 0 0 1-4.8232-4.8232 4.8232 4.8232 0 0 1 4.8232-4.8232 4.8232 4.8232 0 0 1 4.8232 4.8232z" color="#000000" fill="#dcdcdc" stroke-width="1.0196" style="-inkscape-stroke:none"/><path d="m-299.96-180.85c-2.9393 0-5.332 2.3947-5.332 5.334 0 2.9393 2.3928 5.332 5.332 5.332s5.334-2.3928 5.334-5.332c1e-5 -2.9393-2.3947-5.334-5.334-5.334zm0 1.0195c2.3882-1e-5 4.3125 1.9262 4.3125 4.3144s-1.9242 4.3125-4.3125 4.3125-4.3125-1.9242-4.3125-4.3125 1.9242-4.3145 4.3125-4.3144z" color="#000000" fill="#808080" style="-inkscape-stroke:none"/></g></g></g></svg>',
        tooltip: 'Draw a Circle',
        draw: 'Circle',
        element: drawButtonsDiv,
      },
      {
        name: 'modify',
        label: '<svg width="17mm" height="17mm" version="1.1" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-103.12 -91.164)"><path d="m106.91 104.63 1.5698-8.5449 8.48-1.3938v9.9386z" fill="#dcdcdc"/><g fill="#808080"><path d="m116.46 94.695v9.4395h-9.5488v1h10.549v-10.439z" color="#000000" style="-inkscape-stroke:none"/><path d="m116.6 94.248-1.9727 0.32422 0.16211 0.98633 1.9727-0.32422zm-2.959 0.48633-1.9746 0.32422 0.16211 0.98633 1.9746-0.32422zm-2.9609 0.48633-1.9726 0.32422 0.16211 0.98633 1.9726-0.32422zm-2.8164 1.4551-0.36133 1.9668 0.98438 0.17969 0.36132-1.9668zm-0.54102 2.9492-0.36328 1.9688 0.98438 0.17969 0.36132-1.9668zm-0.54297 2.9512-0.36132 1.9668 0.98437 0.18164 0.36133-1.9668z" color="#000000" stroke-dasharray="2, 1" style="-inkscape-stroke:none"/><path d="m117.75 94.695a0.78847 0.78847 0 0 1-0.78847 0.78847 0.78847 0.78847 0 0 1-0.78847-0.78847 0.78847 0.78847 0 0 1 0.78847-0.78847 0.78847 0.78847 0 0 1 0.78847 0.78847z" color="#000000" stroke-width=".59049" style="-inkscape-stroke:none"/><path d="m116.96 93.611c-0.59502 0-1.084 0.48896-1.084 1.084 0 0.59502 0.48896 1.084 1.084 1.084s1.084-0.48896 1.084-1.084c0-0.59502-0.48897-1.084-1.084-1.084zm0 0.58984c0.2759 0 0.49414 0.21824 0.49414 0.49414 0 0.2759-0.21824 0.49219-0.49414 0.49219s-0.49219-0.21629-0.49219-0.49219c0-0.2759 0.21629-0.49414 0.49219-0.49414z" color="#000000" style="-inkscape-stroke:none"/><path d="m109.2 96.089a0.72375 0.72375 0 0 1-0.72375 0.72375 0.72375 0.72375 0 0 1-0.72374-0.72375 0.72375 0.72375 0 0 1 0.72374-0.72375 0.72375 0.72375 0 0 1 0.72375 0.72375z" color="#000000" stroke-width=".74351" style="-inkscape-stroke:none"/><path d="m108.48 94.994c-0.60062 0-1.0938 0.49508-1.0938 1.0957s0.49313 1.0938 1.0938 1.0938c0.60063 0 1.0957-0.49313 1.0957-1.0938s-0.49508-1.0957-1.0957-1.0957zm0 0.74219c0.19881 0 0.35352 0.15471 0.35352 0.35352s-0.15471 0.35156-0.35352 0.35156c-0.1988 0-0.35156-0.15276-0.35156-0.35156s0.15276-0.35352 0.35156-0.35352z" color="#000000" style="-inkscape-stroke:none"/><path d="m117.75 104.63a0.78847 0.78847 0 0 1-0.78847 0.78847 0.78847 0.78847 0 0 1-0.78847-0.78847 0.78847 0.78847 0 0 1 0.78847-0.78848 0.78847 0.78847 0 0 1 0.78847 0.78848z" color="#000000" stroke-width=".59049" style="-inkscape-stroke:none"/><path d="m116.96 103.55c-0.59502 0-1.084 0.48896-1.084 1.084 0 0.59502 0.48896 1.082 1.084 1.082s1.084-0.48701 1.084-1.082c0-0.59503-0.48897-1.084-1.084-1.084zm0 0.58985c0.2759 0 0.49414 0.21824 0.49414 0.49414 0 0.27589-0.21824 0.49218-0.49414 0.49218s-0.49219-0.21629-0.49219-0.49218c0-0.2759 0.21629-0.49414 0.49219-0.49414z" color="#000000" style="-inkscape-stroke:none"/><path d="m107.7 104.63a0.78847 0.78847 0 0 1-0.78847 0.78847 0.78847 0.78847 0 0 1-0.78847-0.78847 0.78847 0.78847 0 0 1 0.78847-0.78848 0.78847 0.78847 0 0 1 0.78847 0.78848z" color="#000000" stroke-width=".59049" style="-inkscape-stroke:none"/><path d="m106.91 103.55c-0.59502 0-1.084 0.48896-1.084 1.084 0 0.59502 0.48896 1.082 1.084 1.082 0.59503 0 1.084-0.48701 1.084-1.082 0-0.59503-0.48896-1.084-1.084-1.084zm0 0.58985c0.2759 0 0.49219 0.21824 0.49219 0.49414 0 0.27589-0.21629 0.49218-0.49219 0.49218s-0.49414-0.21629-0.49414-0.49218c0-0.2759 0.21824-0.49414 0.49414-0.49414z" color="#000000" style="-inkscape-stroke:none"/><path d="m111.62 103.61c-0.0157-0.0264-0.72954-1.3031-0.77367-1.3836-0.0229-0.0411-0.0239-0.0398-0.7232 0.64377-0.38536 0.3767-0.7053 0.68155-0.71098 0.67746-0.01-6e-3 -0.62525-6.8882-0.62099-6.9314 1e-3 -0.01328 5.5838 4.1403 5.6002 4.1661 2e-3 6e-3 -0.42628 0.1189-0.95446 0.25285-0.52819 0.13395-0.96116 0.24494-0.96215 0.24673-1e-3 2e-3 0.66116 1.1918 0.77038 1.382l0.0453 0.0789-0.81667 0.4455c-0.44917 0.24502-0.82144 0.44622-0.82726 0.44708-6e-3 9.7e-4 -0.0179-0.01-0.0266-0.0253zm0.53763-0.96766c0.14274-0.0786 0.26128-0.14551 0.26353-0.14865 2e-3 -4e-3 -0.19789-0.36675-0.44485-0.80804-0.24693-0.4413-0.4458-0.80673-0.44192-0.8121 4e-3 -6e-3 0.31464-0.088 0.69058-0.18338 0.37595-0.0955 0.69598-0.17786 0.71124-0.18293 0.0191-6e-3 -0.50518-0.40697-1.6791-1.2828-0.93874-0.70032-1.7088-1.2706-1.7112-1.2672-6e-3 0.0097 0.36624 4.2082 0.37464 4.2143 4e-3 2e-3 0.24128-0.22328 0.52692-0.50291 0.28562-0.27961 0.52242-0.50614 0.52623-0.50337 4e-3 2e-3 0.19895 0.34987 0.4335 0.77138 0.49199 0.88386 0.4736 0.85157 0.48346 0.84999 5e-3 -7.7e-4 0.12425-0.0655 0.26699-0.14414z" stroke-width=".016652"/></g><path d="m111.88 102.75c-7e-3 -9e-3 -0.20786-0.36334-0.445-0.78782-0.23713-0.42449-0.44068-0.77872-0.45233-0.78716-0.0123-9e-3 -0.2099 0.16689-0.47429 0.42225-0.2492 0.24069-0.47615 0.45973-0.50435 0.48677-0.028 0.0271-0.0574 0.0448-0.0647 0.0396-0.0146-0.011-0.0363-0.25332-0.23843-2.4956-0.0727-0.81181-0.13084-1.5125-0.12919-1.5571l2e-3 -0.08113 1.0785 0.80377c1.1525 0.85892 2.0355 1.5243 2.1775 1.6408l0.0872 0.0716-0.69087 0.17834c-0.38002 0.0981-0.69368 0.18219-0.69711 0.18691-9e-3 0.011 0.15281 0.3109 0.54666 1.0194 0.17387 0.31281 0.31379 0.57978 0.31094 0.59328-5e-3 0.0208-0.43856 0.27456-0.47957 0.28022-9e-3 1e-3 -0.0207-5e-3 -0.0281-0.014z" fill="#fff" stroke-width=".42677"/></g></svg>',
        tooltip: 'Modify features',
        element: actionButtonsDiv,
      },
      {
        name: 'move',
        label: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>',
        tooltip: 'Move features',
        element: actionButtonsDiv,
      },
      {
        name: 'delete',
        label: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>',
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
