import { EventEmitter } from 'events';
import { Map } from 'mapbox-gl';

/**
 * Create mapbox-gl map instance. (Also a full example of Typedoc's functionality.)
 *
 * ### Example (es module)
 * ```js
 * import { Dhis2Map } from '@hisptz/map-api'
 *
 * const mapContainer = document.createElement('div')
 *
 * mapContainer.style.width = '100%'
 * mapContainer.style.height = '100%'
 *
 * const map = new Dhis2Map(mapContainer)
 * // => 8
 * ```
 *
 *
 * @param el   Html element that will act as map container.
 * @returns       `Map` instance.
 * @anotherNote   Some other value.
 */

export class Dhis2Map extends EventEmitter {
  private mapboxGlMap: Map;

  constructor(el) {
    super();
    this.mapboxGlMap = new Map({
      container: el,
      maxZoom: 18,
      style: {
        glyphs: 'http://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
        layers: [],
        sources: {},
        version: 8
      }
    });
  }

  public setView(lnglat, zoom): void {
    this.mapboxGlMap.setCenter(lnglat);
    this.mapboxGlMap.setZoom(zoom);
  }

  public getContainer(): HTMLElement {
    return this.mapboxGlMap.getContainer();
  }
}
