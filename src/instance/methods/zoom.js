// Import Vector source.
import VectorSource from 'ol/source/Vector';

// Import extent functions.
import { createEmpty as extentCreateEmpty, extend as extendExtend } from 'ol/extent';

// Import forEachLayer helper function.
import forEachLayer from '../../utils/forEachLayer';

// Zoom to all vector sources in the map, recursing into layer groups.
export function zoomToVectors(optlayers = null) {
  const extent = extentCreateEmpty();
  const layers = optlayers || this.map.getLayerGroup();
  forEachLayer(layers, (layer) => {
    if (typeof layer.getSource === 'function') {
      const source = layer.getSource();
      if (source !== 'null' && source instanceof VectorSource) {
        if (source.getState() === 'ready' && source.getFeatures().length > 0) {
          extendExtend(extent, source.getExtent());
          const fitOptions = {
            size: this.map.getSize(),
            padding: [20, 20, 20, 20],
            maxZoom: 20,
          };
          this.map.getView().fit(extent, fitOptions);
        }
      }
    }
  });
}

// Zoom to the given layer source in the map.
export function zoomToLayer(layer) {
  const extent = extentCreateEmpty();
  const source = layer.getSource();
  if (source !== 'null' && source instanceof VectorSource) {
    if (source.getState() === 'ready' && source.getFeatures().length > 0) {
      extendExtend(extent, source.getExtent());
      const fitOptions = {
        size: this.map.getSize(),
        padding: [20, 20, 20, 20],
        maxZoom: 20,
      };
      this.map.getView().fit(extent, fitOptions);
    }
  }
}
