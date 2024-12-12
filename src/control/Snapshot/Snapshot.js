import Control from 'ol/control/Control';
import { CLASS_CONTROL, CLASS_UNSELECTABLE } from 'ol/css';
import EventType from 'ol/events/EventType';
import MapEventType from 'ol/MapEventType';
import './Snapshot.css';
import printJS from 'print-js';

/**
 * @classdesc
 * OpenLayers Snapshot Control.
 *
 * @api
 */
class Snapshot extends Control {

  /**
   * @param {Options=} opts Snapshot options.
   */
  constructor(opts) {
    const options = opts || {};

    // Call the parent control constructor.
    super({
      element: document.createElement('div'),
      target: options.target,
    });

    // Create the snapshot button element.
    const className = options.className || 'ol-snapshot';
    const button = document.createElement('button');
    button.innerHTML = options.label || '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M4.8 15.2v-1.6a.8.8 0 0 0-1.6 0v1.6a.8.8 0 0 0 1.6 0M8 4a.8.8 0 0 0 .8.8h1.6a.8.8 0 0 0 0-1.6H8.8A.8.8 0 0 0 8 4m-4 7.2a.8.8 0 0 0 .8-.8V8.8a.8.8 0 0 0-1.6 0v1.6a.8.8 0 0 0 .8.8m14.4-6.4h.8v.8a.8.8 0 0 0 1.6 0v-.8a1.6 1.6 0 0 0-1.6-1.6h-.8a.8.8 0 0 0 0 1.6M12.8 4a.8.8 0 0 0 .8.8h1.6a.8.8 0 0 0 0-1.6h-1.6a.8.8 0 0 0-.8.8M5.6 19.2h-.8v-.8a.8.8 0 0 0-1.6 0v.8a1.6 1.6 0 0 0 1.6 1.6h.8a.8.8 0 0 0 0-1.6M4.8 5.6v-.8h.8a.8.8 0 0 0 0-1.6h-.8a1.6 1.6 0 0 0-1.6 1.6v.8a.8.8 0 0 0 1.6 0m14.4 3.2v1.601a.8.8 0 0 0 1.6 0V8.8a.8.8 0 0 0-1.6 0m.8 4h-1.411a1.6 1.6 0 0 1-1.431-.885l-.137-.274a.8.8 0 0 0-.715-.442h-3.811a.8.8 0 0 0-.715.442l-.137.274a1.6 1.6 0 0 1-1.432.885H8.8a.8.8 0 0 0-.8.8V20a.8.8 0 0 0 .8.8H20a.8.8 0 0 0 .8-.8v-6.4a.8.8 0 0 0-.8-.8M14.4 20a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4"/><path d="M16 16.8a1.6 1.6 0 0 1-1.6 1.6 1.6 1.6 0 0 1-1.6-1.6 1.6 1.6 0 0 1 3.2 0"/></svg>';
    button.title = options.tooltip || 'Snapshot';
    button.className = className;
    button.type = 'button';

    // Register a click event on the button.
    button.addEventListener(EventType.CLICK, this.captureImage.bind(this), false);

    // Add the button and CSS classes to the control element.
    const { element } = this;
    element.className = `${className} ${CLASS_UNSELECTABLE} ${CLASS_CONTROL}`;
    element.appendChild(button);

    // Create a download button with link.
    const link = document.createElement('a');
    link.setAttribute('download', document.title);
    link.innerHTML = '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M22,16 L22,20 C22,21.1045695 21.1045695,22 20,22 L4,22 C2.8954305,22 2,21.1045695 2,20 L2,16 L4,16 L4,20 L20,20 L20,16 L22,16 Z M13,12.5857864 L16.2928932,9.29289322 L17.7071068,10.7071068 L12,16.4142136 L6.29289322,10.7071068 L7.70710678,9.29289322 L11,12.5857864 L11,2 L13,2 L13,12.5857864 Z" fill-rule="evenodd"/></svg>';
    this.link = link;
    const download = document.createElement('button');
    download.title = 'Download snapshot';
    download.className = 'download';
    download.appendChild(link);
    element.appendChild(download);

    // Create a print button.
    const print = document.createElement('button');
    print.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M16.83 8.63H6.89a.7.7 0 0 1-.7-.7V2.94a.7.7 0 0 1 .7-.7h9.94a.7.7 0 0 1 .7.7v4.97a.7.7 0 0 1-.7.7M7.6 7.22h8.53V3.66H7.59Zm9.23 13.87H6.89a.7.7 0 0 1-.7-.7v-7.64a.7.7 0 0 1 .7-.7h9.94a.7.7 0 0 1 .7.7v7.64a.7.7 0 0 1-.7.7M7.6 19.7h8.53v-6.23H7.59Z"/><path d="M19.09 17.77h-2.26a.7.7 0 0 1 0-1.41h2.26a.89.89 0 0 0 .89-.89V9.52a.89.89 0 0 0-.89-.89H4.63a.89.89 0 0 0-.89.89v5.96a.89.89 0 0 0 .89.89h2.26a.7.7 0 0 1 0 1.4H4.63a2.3 2.3 0 0 1-2.3-2.29V9.51a2.3 2.3 0 0 1 2.3-2.3h14.46a2.3 2.3 0 0 1 2.3 2.3v5.96a2.3 2.3 0 0 1-2.3 2.3"/><path d="M6.14 11.06h-.07a1 1 0 0 1-.13-.03l-.07-.02-.06-.03-.06-.03-.06-.05a.7.7 0 0 1-.1-.1l-.03-.05-.04-.06a1 1 0 0 1-.05-.13l-.02-.06-.01-.07a1 1 0 0 1 0-.14 1 1 0 0 1 .03-.14l.02-.06.03-.06.04-.06.04-.06a1 1 0 0 1 .1-.1l.05-.04.06-.03.06-.03.07-.03.06-.01.07-.01a1 1 0 0 1 .14 0 .7.7 0 0 1 .14.02l.06.03.06.03.06.03.06.04.05.05.05.05.04.06.03.06.03.06.02.06.02.07.01.07a1 1 0 0 1 0 .14 1 1 0 0 1-.03.13l-.02.07-.03.06-.03.06a.8.8 0 0 1-.14.15l-.06.04-.06.04-.06.03-.07.02-.06.02-.07.01zm2.06 0h-.07l-.06-.01-.07-.02-.07-.02-.06-.03-.06-.03-.05-.05a1 1 0 0 1-.1-.1l-.04-.05-.04-.06-.03-.06-.02-.07-.02-.06v-.07a1 1 0 0 1 0-.14 1 1 0 0 1 .02-.14l.02-.06.03-.06.04-.06.04-.06a.7.7 0 0 1 .1-.1l.05-.04.06-.03A1 1 0 0 1 8 9.68l.07-.01.06-.01a1 1 0 0 1 .14 0 1 1 0 0 1 .14.02l.06.03q.04 0 .07.03l.06.03.05.04.05.05.05.05.04.06.04.06.03.06.02.06.02.07v.07a1 1 0 0 1 0 .14 1 1 0 0 1-.02.13l-.02.07-.03.06-.04.06a.8.8 0 0 1-.14.15l-.05.04-.06.04a1 1 0 0 1-.13.05l-.07.02a.5.5 0 0 1-.14.01m6.42 5.07H9.1a.7.7 0 0 1 0-1.41h5.53a.7.7 0 0 1 0 1.4m0 2.49H9.1a.7.7 0 0 1 0-1.4h5.53a.7.7 0 0 1 0 1.4"/></svg>>';
    print.title = 'Print snapshot';
    print.className = 'print';
    print.addEventListener('click', this.printSnapshot.bind(this));
    element.appendChild(print);
  }

  /**
   * Callback to deactivate the snapshot control.
   * @private
   */
  deactivate() {
    this.element.classList.remove('active');
  }

  /**
   * Callback for the snapshot button click event.
   * @param {MouseEvent} event The event to handle
   * @private
   */
  captureImage(event) {
    event.preventDefault();

    // Create a new canvas element to combine multiple map canvas data to.
    const outputCanvas = document.createElement('canvas');
    const [width, height] = this.getMap().getSize();
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputContext = outputCanvas.getContext('2d');

    // Draw each canvas from this map into the new canvas.
    // Logic for transforming and drawing canvases derived from ol export-pdf example.
    // https://github.com/openlayers/openlayers/blob/6f2ca3b9635f273f6fbddab834bd9126c7d48964/examples/export-pdf.js#L61-L85
    Array.from(this.getMap().getTargetElement().querySelectorAll('.ol-layer canvas'))
      .filter(canvas => canvas.width > 0)
      .forEach((canvas) => {
        const { opacity } = canvas.parentNode.style;
        outputContext.globalAlpha = opacity === '' ? 1 : Number(opacity);

        // Get the transform parameters from the style's transform matrix.
        // This is necessary so that vectors align with raster layers.
        const { transform } = canvas.style;
        const matrix = transform
          .match(/^matrix\(([^(]*)\)$/)[1]
          .split(',')
          .map(Number);

        // Apply the transform to the export map context.
        CanvasRenderingContext2D.prototype.setTransform.apply(
          outputContext,
          matrix,
        );
        outputContext.drawImage(canvas, 0, 0);
      });

    // Build a jpeg data url and update link.
    const url = outputCanvas.toDataURL('image/jpeg');
    this.link.href = url;

    // Remove the output canvas.
    outputCanvas.remove();

    // Enable the snapshot actions.
    this.element.classList.add('active');

    // Subscribe to events to deactivate snapshot actions.
    this.getMap().on(EventType.CLICK, this.deactivate.bind(this));
    this.getMap().on(EventType.CHANGE, this.deactivate.bind(this));
    this.getMap().on(MapEventType.MOVESTART, this.deactivate.bind(this));
  }

  /**
   * Callback for the snapshot button click event.
   * @private
   */
  printSnapshot() {
    if (this.link.href.length) {
      printJS(this.link.href, 'image');
    }
  }

}

export default Snapshot;
