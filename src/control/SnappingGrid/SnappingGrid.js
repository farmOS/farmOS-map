import Collection from 'ol/Collection';
import Control from 'ol/control/Control';
import Draw from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';
import EventType from 'ol/events/EventType';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
} from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

/*
 * Use the Common JS version of ol-grid artifacts for size
 * and build efficiency reasons.
 */
import Grid from 'ol-grid/dist/ol-grid.cjs';

import forEachLayer from '../../utils/forEachLayer';

import './SnappingGrid.css';


/**
 * @typedef {Object} Options
 * @property {string} [units] The system of measurement - either 'us' or 'metric'.
 * @property {HTMLElement|string} [target] Specify a target if you want the
 * control to be rendered outside of the map's viewport.
 */


/**
 * @classdesc
 * OpenLayers SnappingGrid Control.
 *
 * @api
 */
class SnappingGrid extends Control {

  /**
   * @param {Options=} opts SnappingGrid options.
   */
  constructor(opts) {
    const options = opts || {};

    // Call the parent control constructor.
    super({
      element: document.createElement('div'),
      target: options.target,
    });

    const self = this;

    // Define the class name.
    const className = 'ol-snapgrid';

    // Add the button and CSS classes to the control element.
    const { element } = this;
    element.className = `${className} collapsed ${CLASS_UNSELECTABLE} ${CLASS_CONTROL}`;

    this.innerControlElements = {};

    function createControlElement(elementTag, name, builderFn) {
      const controlElem = document.createElement(elementTag);
      controlElem.className = `${className} ${name}`;
      builderFn.call(self, controlElem);
      self.innerControlElements[name] = controlElem;
      element.appendChild(controlElem);
    }

    // Disable param-reassignment linting here since this pattern for building
    // the element buttons is very compelling.

    /* eslint-disable no-param-reassign */

    createControlElement('button', 'activateButton', (button) => {
      button.innerHTML = '#';
      button.title = 'Enable the Snapping Grid';
      button.type = 'button';

      button.addEventListener(EventType.CLICK, this.handleActivateButtonClick.bind(this), false);
    });

    createControlElement('input', 'xInput', (input) => {
      input.value = 5;
      input.type = 'number';
      input.step = 'any';
      input.classList.add('collabsible');

      input.addEventListener('input', self.handleXInputChanged.bind(this), false);
    });

    createControlElement('span', 'timesSymbol', (span) => {
      span.innerHTML = 'x';
      span.classList.add('collabsible');
    });

    createControlElement('input', 'yInput', (input) => {
      input.value = 5;
      input.type = 'number';
      input.step = 'any';
      input.classList.add('collabsible');

      input.addEventListener('input', self.handleYInputChanged.bind(this), false);
    });

    createControlElement('select', 'unitSelector', (unitSelector) => {
      function addUnit(value, selected) {
        const unitOption = document.createElement('option');
        unitOption.innerHTML = value;
        unitOption.value = value;
        unitOption.selected = selected;
        unitSelector.appendChild(unitOption);
      }

      addUnit('m');
      addUnit('ft');
      addUnit('in');

      unitSelector.value = (options.units === 'us' ? 'ft' : 'm');
      unitSelector.classList.add('collabsible');

      unitSelector.addEventListener('change', self.handleUnitsChanged.bind(this), false);
    });

    /* eslint-enable no-param-reassign */

    this.gridPointStyle = new Style({
      image: new CircleStyle({
        radius: 1,
        fill: new Fill({ color: 'white' }),
        stroke: new Stroke({ color: 'green', width: 1 }),
      }),
    });

    // Internal vector layer used for drawing the control points (origin/rotation-anchor)
    this.gridControlPointsVectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
        wrapX: false,
      }),
    });

    this.gridControlPointsVectorLayer.getSource().on('addfeature', this.handleAddGridControlFeature.bind(this));
    document.addEventListener(EventType.KEYDOWN, this.handleEscape.bind(this), false);

    this.grid = new Grid({
      xGridSize: this.getXDim(),
      yGridSize: this.getYDim(),
      style: this.gridPointStyle,
    });

    // Create and add a Snap interaction for the snapping grid feature
    this.gridSnapInteraction = new Snap({
      features: new Collection(),
      pixelTolerance: 15,
    });
    this.gridSnapInteraction.addFeature(this.grid.getGridFeature());

    // The grid is inactive until control points have been drawn
    this.grid.setActive(false);

    // Maintain the expand/collapse state for the control
    this.mouseIsOver = false;

    element.addEventListener('mouseenter', self.handleMouseEnter.bind(this), false);
    element.addEventListener('mouseleave', self.handleMouseLeave.bind(this), false);

    this.innerControlElements.xInput.addEventListener('blur', this.handleControlElementBlur.bind(this), false);
    this.innerControlElements.yInput.addEventListener('blur', this.handleControlElementBlur.bind(this), false);
    this.innerControlElements.unitSelector.addEventListener('blur', this.handleControlElementBlur.bind(this), false);
  }

  /**
   * Handle the mouse entering the control - expand the control when the  mouse is over it.
   * @private
   */
  handleMouseEnter() {
    this.mouseIsOver = true;
    this.element.classList.remove('collapsed');
  }

  /**
   * Handle the mouse leaving the control - used to collapse the control when the mouse is not
   * over it and none of the controls has focus.
   * @private
   */
  handleMouseLeave() {
    this.mouseIsOver = false;

    if (document.activeElement === this.innerControlElements.xInput
        || document.activeElement === this.innerControlElements.yInput
        || document.activeElement === this.innerControlElements.unitSelector) {
      return;
    }

    this.element.classList.add('collapsed');
  }

  /**
   * Handle blur events on any of our control elements - used to collapse the control when the
   * mouse is not over it and none of the controls has focus.
   * @private
   */
  handleControlElementBlur() {
    if (this.mouseIsOver) {
      return;
    }

    this.element.classList.add('collapsed');
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
    let wasActive = false;
    if (oldMap) {
      oldMap.removeLayer(this.gridControlPointsVectorLayer);

      // If control points were in the process of being drawn just reset the
      // draw interaction discarding that state.
      if (this.drawSnappingOriginsInteraction) {
        this.resetDrawInteraction();
      }

      // Remove our grid snap interaction
      this.getMap().removeInteraction(this.gridSnapInteraction);

      wasActive = this.grid.getActive();

      // If the grid is active remove it from the current map and (later)
      // add it to the new one.
      if (wasActive) {
        oldMap.removeInteraction(this.grid);
      }

      // Cleanup the old event listeners
      if (this.onMapAddInteraction) {
        oldMap.getInteractions().un('add', this.onMapAddInteraction.listener);
        this.onMapAddInteraction = null;
      }
      if (this.onMapRemoveInteraction) {
        oldMap.getInteractions().un('remove', this.onMapRemoveInteraction.listener);
        this.onMapRemoveInteraction = null;
      }
    }
    super.setMap(map);

    if (map) {
      map.addLayer(this.gridControlPointsVectorLayer);

      // When interactions are added or removed update our internal state
      // to ensure the grid state remains consistent even if the Open Layers
      // map interactions are directly manipulated.
      const updateState = () => {
        const mapHasOtherDrawInteractions = this.mapHasOtherDrawInteractions();

        const mapInteractions = this.getMap().getInteractions().getArray();

        const mapHasOurDrawInteraction = mapInteractions.some(
          interaction => interaction === this.drawSnappingOriginsInteraction,
        );

        const mapHasOurGridInteraction = mapInteractions.some(
          interaction => interaction === this.grid,
        );

        if (mapHasOtherDrawInteractions && mapHasOurDrawInteraction) {
          this.resetDrawInteraction();
        }

        if (mapHasOurDrawInteraction || mapHasOurGridInteraction) {
          this.element.classList.add('active');
          this.innerControlElements.activateButton.title = 'Disable the Snapping Grid';
        } else {
          this.element.classList.remove('active');
          this.innerControlElements.activateButton.title = 'Enable the Snapping Grid';
        }

        this.innerControlElements.activateButton.disabled = mapHasOtherDrawInteractions
          && !mapHasOurGridInteraction;

        this.grid.setActive(mapHasOurGridInteraction);

        this.updateGridSnapInteraction();
      };

      this.onMapAddInteraction = map.getInteractions().on('add', updateState);
      this.onMapRemoveInteraction = map.getInteractions().on('remove', updateState);

      if (wasActive) {
        map.addInteraction(this.grid);

        this.updateGridSnapInteraction();
      }

    }
  }

  /**
   * Responsible for updating the presence/position of the grid snap interaction within the map's
   * interactions.
   * @private
   */
  updateGridSnapInteraction() {
    const isActive = this.grid.getActive();

    if (!isActive) {
      this.getMap().removeInteraction(this.gridSnapInteraction);
      return;
    }

    const mapInteractions = this.getMap().getInteractions();

    const mapInteractionsArr = mapInteractions.getArray();

    function findLastIndex(arr, predicate) {
      for (let i = arr.length - 1; i >= 0; i += -1) {
        if (predicate(arr[i])) {
          return i;
        }
      }
      return -1;
    }

    const otherDrawInteractionLastIdx = findLastIndex(mapInteractionsArr,
      interaction => typeof interaction.finishDrawing === 'function'
        && interaction !== this.drawSnappingOriginsInteraction);

    const otherSnapInteractionLastIdx = findLastIndex(mapInteractionsArr,
      interaction => typeof interaction.snapTo === 'function'
        && interaction !== this.gridSnapInteraction);

    const ourSnapInteractionLastIdx = findLastIndex(mapInteractionsArr,
      interaction => interaction === this.gridSnapInteraction);

    if (Math.max(otherDrawInteractionLastIdx, otherSnapInteractionLastIdx)
        > ourSnapInteractionLastIdx) {
      // Make sure our snap interaction is always on top of other draw/snap interactions
      this.getMap().addInteraction(this.gridSnapInteraction);
      if (ourSnapInteractionLastIdx !== -1) {
        mapInteractions.removeAt(ourSnapInteractionLastIdx);
      }
    } else if (otherDrawInteractionLastIdx === -1 && otherSnapInteractionLastIdx === -1) {
      // Remove our snap interaction if there are no other draw/snap interactions
      this.getMap().removeInteraction(this.gridSnapInteraction);
    }
  }

  /**
   * Handles clicks to the activate button - either activating a new grid or toggling it back off.
   * @private
   */
  handleActivateButtonClick(event) {
    event.preventDefault();

    // If the grid is active, toggle it back off
    if (this.grid.getActive()) {
      this.getMap().removeInteraction(this.grid);
      return;
    }

    // If we're in the middle of drawing control points, discard them
    if (this.drawSnappingOriginsInteraction) {
      this.resetDrawInteraction();
      return;
    }

    // This shouldn't happen since the activate button gets disabled if there are other
    // draw interactions, but the behavior is poor enough that it is worth defending against
    if (this.mapHasOtherDrawInteractions()) {
      return;
    }

    // Create the draw interaction and add it to the map.
    this.drawSnappingOriginsInteraction = new Draw({
      source: this.gridControlPointsVectorLayer.getSource(),
      type: 'Point',
    });

    this.getMap().addInteraction(this.drawSnappingOriginsInteraction);
    this.enableSnap();
  }

  /**
   * Enable snap interaction for drawing the control points.
   * @private
   */
  enableSnap() {
    this.clearSnap();

    this.snapInteraction = new Snap({
      features: new Collection(),
    });

    // Load all vector layer features in the map and add them to the snap
    // interaction's feature collection (so they can be snapped to).
    forEachLayer(this.getMap().getLayerGroup(), (layer) => {
      if (typeof layer.getSource === 'function') {
        const source = layer.getSource();
        if (source && typeof source.getFeatures === 'function') {
          const features = source.getFeatures();
          if (source.getState() === 'ready' && features.length > 0) {
            features.forEach((feature) => {
              this.snapInteraction.addFeature(feature);
            });
          }
        }
      }
    });

    this.getMap().addInteraction(this.snapInteraction);
  }

  clearSnap() {
    if (this.snapInteraction) {
      this.getMap().removeInteraction(this.snapInteraction);
      this.snapInteraction = null;
    }
  }

  /**
   * Checks whether the map has active draw interactions other than the one used
   * internally to create the grid control points.
   * @private
   */
  mapHasOtherDrawInteractions() {
    const otherDrawInteractions = this.getMap().getInteractions().getArray()
      .filter(interaction => typeof interaction.finishDrawing === 'function')
      .filter(interaction => interaction !== this.drawSnappingOriginsInteraction);

    return !!otherDrawInteractions.length;
  }

  /**
   * Callback for when the value of the x grid size input changes. Updates the grid size.
   * @private
   */
  handleXInputChanged() {
    this.grid.setXGridSize(this.getXDim());
  }

  /**
   * Callback for when the value of the y grid size input changes. Updates the grid size.
   * @private
   */
  handleYInputChanged() {
    this.grid.setYGridSize(this.getYDim());
  }

  /**
   * Callback for escape key press. Deactivate grid control point draw interaction - if active.
   * @param {KeyboardEvent} event The event to handle
   * @private
   */
  handleEscape(event) {
    if (event.key === 'Escape' && this.drawSnappingOriginsInteraction) {
      this.resetDrawInteraction();
    }
  }

  /**
   * Callback for when the value of the unit select input changes. Updates the grid x/y sizes.
   * @private
   */
  handleUnitsChanged() {
    this.grid.setXGridSize(this.getXDim());
    this.grid.setYGridSize(this.getYDim());
  }

  /**
   * Helper function to clear the grid control points draw interaction - if active.
   * @private
   */
  resetDrawInteraction() {
    if (this.drawSnappingOriginsInteraction) {
      this.getMap().removeInteraction(this.drawSnappingOriginsInteraction);
      this.drawSnappingOriginsInteraction = null;
    }
    this.clearSnap();

    this.gridControlPointsVectorLayer.getSource().clear();
  }

  /**
   * Get the current grid x dimension in map units.
   * @private
   */
  getXDim() {
    return parseFloat(this.innerControlElements.xInput.value)
      * this.getSelectedUnitConversionFactor();
  }

  /**
   * Get the current grid x dimension in map units.
   * @private
   */
  getYDim() {
    return parseFloat(this.innerControlElements.yInput.value)
      * this.getSelectedUnitConversionFactor();
  }

  /**
   * Get the current grid unit conversion factor - a real number used to convert from the x/y input
   * values to map units.
   * @private
   */
  getSelectedUnitConversionFactor() {
    const unit = this.innerControlElements.unitSelector.value;

    if (unit === 'm') {
      return 1;
    }

    if (unit === 'ft') {
      return 1 / 3.28084;
    }

    if (unit === 'in') {
      return 0.0254;
    }

    throw new Error(`Unsupported unit selected: ${unit}`);
  }

  /**
   * Handle features added to the grid control points layer - activates the grid once two points
   * are added.
   * @private
   */
  handleAddGridControlFeature() {
    const map = this.getMap();

    const features = this.gridControlPointsVectorLayer.getSource().getFeatures();

    if (features.length !== 2) {
      return;
    }

    this.resetDrawInteraction();

    this.grid.setOriginPoint(features[0].getGeometry().getCoordinates());
    this.grid.setRotationControlPoint(features[1].getGeometry().getCoordinates());

    map.addInteraction(this.grid);
    this.grid.setActive(true);
  }

}

export default SnappingGrid;
