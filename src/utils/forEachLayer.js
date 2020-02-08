/**
 * Call the supplied function for each layer in the passed layer group recursing
 * nested groups. Copied/modified from LayerSwitcher.forEachRecursive().
 * We replicate it here so that we can use it even when the LayerSwitcher
 * control has not been added to the map.
 * @param {ol/layer/Group~LayerGroup} layer The layer group to start iterating from.
 * @param {Function} fn Callback which will be called for each `ol/layer/Base~BaseLayer`
 * found under `lyr`. The signature for `fn` is the same as `ol/Collection~Collection#forEach`
 */
export default function forEachLayer(layer, fn) {
  layer.getLayers().forEach((lyr, idx, a) => {
    fn(lyr, idx, a);
    if (lyr.getLayers) {
      forEachLayer(lyr, fn);
    }
  });
}
