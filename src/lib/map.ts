import EventEmitter from 'events';
import { Map } from 'mapbox-gl';

/**
 * Multiplies a value by 2. (Also a full example of Typedoc's functionality.)
 *
 * ### Example (es module)
 * ```js
 * import { double } from 'typescript-starter'
 * console.log(double(4))
 * // => 8
 * ```
 *
 *
 * @param element   Comment describing the `value` parameter.
 * @returns       Comment describing the return type.
 * @anotherNote   Some other value.
 */

export class Dhis2Map extends EventEmitter {
  private mapboxGlMap: Map;

  constructor(el) {
    super();
    this.mapboxGlMap = new Map({
      container: el,
      maxZoom: 18,
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 13
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
