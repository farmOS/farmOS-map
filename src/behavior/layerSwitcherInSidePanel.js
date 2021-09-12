import LayerSwitcher from 'ol-layerswitcher';

import layersHalfIcon from 'bootstrap-icons/icons/layers-half.svg';

import './layerSwitcherInSidePanel.css';

// layer switcher in side panel behavior.
export default {
  attach(instance) {

    const tryMovingLayerSwitcherIntoSidePanel = () => {

      const existingLayerSwitcherControl = instance.map.getControls().getArray()
        .find(control => typeof control.renderPanel === 'function');

      if (!instance.sidePanel) {
        return;
      }

      const existingLayersPane = instance.sidePanel.getPaneById('layers');

      // Only add the layers pane once
      if (existingLayersPane) {
        return;
      }

      const layersPane = instance.sidePanel.definePane({
        paneId: 'layers',
        name: 'Layers',
        icon: layersHalfIcon,
      });

      const layersDiv = document.createElement('div');
      layersDiv.classList = 'layer-switcher';

      layersPane.addWidgetElement(layersDiv);

      const renderLayerSwitcher = () => LayerSwitcher.renderPanel(
        instance.map,
        layersDiv,
        { reverse: true },
      );

      renderLayerSwitcher();

      // When new layers are added, refresh the layer layer switcher
      instance.map.on('farmOS-map.layer', () => {
        renderLayerSwitcher();
      });

      if (existingLayerSwitcherControl) {
        instance.map.removeControl(existingLayerSwitcherControl);
      }

    };

    // Try moving the layer switcher into the side panel either right away or once
    // the side panel control is added to the map.
    tryMovingLayerSwitcherIntoSidePanel();
    instance.map.getControls().on('add', tryMovingLayerSwitcherIntoSidePanel);
  },

};
