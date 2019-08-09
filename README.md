# farmOS Map

[![Licence](https://img.shields.io/badge/Licence-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0/)
[![Release](https://img.shields.io/github/release/farmOS/farmOS-map.svg?style=flat)](https://github.com/farmOS/farmOS-map/releases)
[![Last commit](https://img.shields.io/github/last-commit/farmOS/farmOS-map.svg?style=flat)](https://github.com/farmOS/farmOS-map/commits)
[![Twitter](https://img.shields.io/twitter/follow/farmOSorg.svg?label=%40farmOSorg&style=flat)](https://twitter.com/farmOSorg)
[![Chat](https://img.shields.io/matrix/farmOS:matrix.org.svg)](https://riot.im/app/#/room/#farmOS:matrix.org)

farmOS Map is an [OpenLayers](https://openlayers.org/) map for farmOS.

For more information on farmOS, visit [farmOS.org](https://farmOS.org).

## Usage

1. Create an HTML element with an ID, eg: `<div id="farm-map"></div>`
2. Call the map creation method with the element ID: `farmOS.map.create('farm-map');`
3. (optional) Add behaviors - see below.

### Creating a Map

The simplest way to create a map is to call the `create` method with an HTML
element's ID. This will render a map with all the OpenLayers and farmOS defaults.
However, you can also call it with an options object, as its second parameter,
with a `controls` and/or `interactions` property. If a property is set to
`false`, none of its corresponding default controls or interactions will be
applied to the map. If the property is assigned to an array of OpenLayers
controls or interactions, the defaults will be discarded and those controls or
interactions will be used in their place. If the property is assigned to a
callback function, that function will be called and passed the default controls
or interactions. It must return a an array of OL controls/interactions, which
will be attached to the map in the place of the defaults.

For example:

```js
// Calling .create() with just an id renders a map with the farmOS defaults.
const id = 'myMap';
farmOS.map.create(id);

// Passing an options object with interactions set to false will cancel the
// interaction defaults.
const opts1 = { interactions: false };
farmOS.map.create(id, opts1);

// An options object with an array of controls to replace the defaults.
const opts2 = {
  controls: [
    new MyControl(),
  ],
};
farmOS.map.create(id, opts2);

// An options object with a function which alters the control defaults.
const opts3 = {
  controls: (defaults) => defaults.filter(def => (
    def.constructor.name === 'Attribution'
    )).concat([
      new MyControl1(),
      new MyControl2(),
    ]),
};
farmOS.map.create(id, opts3);
```

### Tearing down a map

It may be desirable to tear down a map instance when you no longer need it so
that it can be garbage collected. To do so, you need to provide the instance's
target id, and pass it to the `destroy` method:

```js
farmOS.map.destroy('my-map');
```

### Adding a Well Known Text (WKT) layer

It is possible to add geometries in the Well Known Text format on a map instance
by calling the `addWKTLayer` method on the instance.

```js
const wkt = "POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53547173738478 42.54316467447933, -75.53547173738478 42.54301053332517, -75.53564876317976 42.54289196294764, -75.53582578897475 42.54281291590414, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))";
const wktLayer = myMap.addWKTLayer("my-polygon", wkt, "orange", true);
```

The first argument is a title for the layer; the second is the WKT string you'd
like to render; the third is the stroke color of the geometry (default is 
`"yellow"`); and the fourth is a boolean to set whether the layer is visible or
not (default is `true`).

The method returns a reference to the newly created layer for later use.

### Controlling the zoom level

There are two methods for controlling the zoom level. The first, `zoomToVectors`,
automatically zooms to the bounding box of all vector source layers. It takes no
arguments. The second, `zoomToLayer will zoom to a particular vector layer,
provided you pass a reference to that layer.

For example:

```js
// Zoom to all vector layers
myMap.zoomToVectors();

// Create a layer then zoom to that layer
const wktLayer = myMap.addWKTLayer("my-polygon", wkt, "orange", true);
myMap.zoomToLayer(wktLayer);
```

### Adding behaviors

Behaviors allow you to make modifications to a map in a modular way, by defining
JavaScript functions that will run automatically when a map is created.

For example:

```js
(function () {
  farmOS.map.behaviors.myCustomizations = {
    attach: function (instance) {

      // Get the element ID.
      var element_id = instance.target;

      // Add a GeoJSON layer to the map with an ID of 'my-map';
      if (element_id == 'my-map') {
        instance.addGeoJSONLayer('my/custom/geo.json', 'yellow');
      }
    }
  };
}());
```

## Development

`npm install` - Install JavaScript dependencies in `./node_modules` and create
`package-lock.json`.

`npm run dev` - Start a Webpack development server at https://localhost:8080
which will live-update as code is changed during development.

`npm run build` - Generate the final `farmOS-map.js` file for distribution,
along with an `index.html` file that loads it, inside the `build` directory.

## Maintainers

 * Michael Stenta (m.stenta) - https://github.com/mstenta

This project has been sponsored by:

 * [Farmier](https://farmier.com)
