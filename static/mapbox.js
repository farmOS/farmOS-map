/* eslint-disable */
(function () {
  farmOS.map.behaviors.mapbox = {
    attach: function (instance) {

      // Test MapBox API key (only works with farmos.github.io).
      var key = 'pk.eyJ1IjoiZmFybWllciIsImEiOiJjazB6ajZjODkwMWIzM2ptcDBvNjl4eGViIn0.oYDl6csdVuVzlB0hf2ju2Q';

      // Add MapBox base layer: Outdoors.
      var opts = {
        title: 'MapBox Outdoors',
        url: 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + key,
        group: 'Base layers',
        base: true,
        visible: false,
      };
      instance.addLayer('xyz', opts);

      // Add MapBox base layer: Satellite.
      var opts = {
        title: 'MapBox Satellite',
        url: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + key,
        group: 'Base layers',
        base: true,
        visible: false,
      };
      instance.addLayer('xyz', opts);

    },
  };
}());
