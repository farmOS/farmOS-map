import KML from 'ol/format/KML';
import VectorSource from 'ol/source/Vector';
import HeatmapLayer from 'ol/layer/Heatmap';


(function () {
  farmOS.map.behaviors.exampleHeatmapBehavior = {
    attach: async function(instance) {

      const vector = new HeatmapLayer({
        source: new VectorSource({
          url: '2012_Earthquakes_Mag5.kml',
          format: new KML({
            extractStyles: false,
          }),
        }),
        blur: 15,
        radius: 5,
        weight: function (feature) {
          // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
          // standards-violating <magnitude> tag in each Placemark.  We extract it from
          // the Placemark's name instead.
          const name = feature.get('name');
          const magnitude = parseFloat(name.substr(2));
          return magnitude - 5;
        },
      });

      instance.map.addLayer(vector);

    },
  };
}());
