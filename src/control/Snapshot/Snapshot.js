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
    print.innerHTML = '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><title/><g><path d="M359,184H147a15,15,0,0,1-15-15V63a15,15,0,0,1,15-15H359a15,15,0,0,1,15,15V169A15,15,0,0,1,359,184ZM162,154H344V78H162Z"/><path d="M359,450H147a15,15,0,0,1-15-15V272.09a15,15,0,0,1,15-15H359a15,15,0,0,1,15,15V435A15,15,0,0,1,359,450ZM162,420H344V287.09H162Z"/><path d="M407.25,379H359a15,15,0,0,1,0-30h48.25a18.9,18.9,0,0,0,18.88-18.88V202.89A18.9,18.9,0,0,0,407.25,184H98.75a18.9,18.9,0,0,0-18.88,18.89V330.12A18.9,18.9,0,0,0,98.75,349H147a15,15,0,0,1,0,30H98.75a48.94,48.94,0,0,1-48.88-48.88V202.89A48.94,48.94,0,0,1,98.75,154h308.5a48.94,48.94,0,0,1,48.88,48.89V330.12A48.94,48.94,0,0,1,407.25,379Z"/><path d="M131,236a14.66,14.66,0,0,1-1.48-.07c-.48-.05-1-.13-1.45-.22s-1-.22-1.43-.36-.93-.31-1.38-.5-.89-.4-1.32-.63a12.45,12.45,0,0,1-1.27-.75c-.4-.27-.8-.56-1.18-.87s-.75-.65-1.1-1-.68-.72-1-1.1a14.34,14.34,0,0,1-.87-1.18q-.41-.62-.75-1.26c-.23-.43-.44-.88-.63-1.33s-.35-.92-.5-1.38-.26-1-.36-1.43-.17-1-.22-1.45a15.68,15.68,0,0,1,0-3c.05-.48.13-1,.22-1.45s.22-1,.36-1.43.31-.93.5-1.38.4-.9.63-1.33.48-.85.75-1.26a14.34,14.34,0,0,1,.87-1.18c.31-.38.65-.75,1-1.1s.72-.68,1.1-1,.78-.6,1.18-.87a12.45,12.45,0,0,1,1.27-.75q.65-.34,1.32-.63c.45-.19.92-.35,1.38-.5s1-.26,1.43-.36,1-.17,1.45-.22a16.15,16.15,0,0,1,2.95,0c.49.05,1,.13,1.46.22s1,.22,1.42.36.94.31,1.39.5.89.4,1.32.63a13.63,13.63,0,0,1,1.27.75c.4.27.8.56,1.18.87s.75.65,1.1,1,.67.72,1,1.1.6.78.87,1.18.52.83.75,1.26.44.88.63,1.33.35.92.5,1.38.26,1,.36,1.43.17,1,.22,1.45a15.68,15.68,0,0,1,0,3c-.05.48-.13,1-.22,1.45s-.22,1-.36,1.43-.31.93-.5,1.38-.4.9-.63,1.33-.48.85-.75,1.26-.57.8-.87,1.18-.65.75-1,1.1-.72.68-1.1,1-.78.6-1.18.87a13.63,13.63,0,0,1-1.27.75q-.65.34-1.32.63c-.45.19-.92.35-1.39.5s-.94.26-1.42.36-1,.17-1.46.22A14.46,14.46,0,0,1,131,236Z"/><path d="M175,236c-.49,0-1,0-1.48-.07s-1-.13-1.45-.22-1-.22-1.43-.36-.93-.31-1.38-.5-.9-.4-1.33-.63-.85-.48-1.26-.75a14.34,14.34,0,0,1-1.18-.87c-.38-.31-.75-.65-1.1-1s-.68-.72-1-1.1-.6-.78-.87-1.18a14.69,14.69,0,0,1-.76-1.27c-.22-.43-.43-.87-.62-1.32s-.35-.92-.5-1.38-.26-1-.36-1.43-.17-1-.22-1.45a15.68,15.68,0,0,1,0-3c.05-.48.13-1,.22-1.45s.22-1,.36-1.43.31-.93.5-1.38.4-.89.62-1.32a14.69,14.69,0,0,1,.76-1.27c.27-.4.56-.8.87-1.18s.65-.75,1-1.1.72-.68,1.1-1a14.34,14.34,0,0,1,1.18-.87q.62-.41,1.26-.75c.43-.23.88-.44,1.33-.63s.92-.35,1.38-.5,1-.26,1.43-.36,1-.17,1.45-.22a16.26,16.26,0,0,1,3,0c.48.05,1,.13,1.45.22s1,.22,1.43.36.93.31,1.38.5.89.4,1.32.63.86.48,1.27.75.8.56,1.18.87.75.65,1.1,1,.67.72,1,1.1.6.78.87,1.18a14.6,14.6,0,0,1,.75,1.27q.34.65.63,1.32c.19.45.35.92.5,1.38s.26,1,.36,1.43.17,1,.22,1.45a15.68,15.68,0,0,1,0,3c-.05.48-.13,1-.22,1.45s-.22,1-.36,1.43-.31.93-.5,1.38-.4.89-.63,1.32a14.6,14.6,0,0,1-.75,1.27c-.27.4-.57.8-.87,1.18s-.65.75-1,1.1-.72.68-1.1,1-.78.6-1.18.87-.84.52-1.27.75-.87.44-1.32.63-.92.35-1.38.5-1,.26-1.43.36-1,.17-1.45.22S175.49,236,175,236Z"/><path d="M312,344H194a15,15,0,0,1,0-30H312a15,15,0,0,1,0,30Z"/><path d="M312,397H194a15,15,0,0,1,0-30H312a15,15,0,0,1,0,30Z"/></g></svg>';
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
