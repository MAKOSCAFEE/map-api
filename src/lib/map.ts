import { EventEmitter } from 'events';
import { LngLatBoundsLike, LngLatLike, Map } from 'mapbox-gl';
import { Dhis2Layer } from './models/layer.model';

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
  private layers: Dhis2Layer[];
  private isReady: boolean;

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
    this.layers = [];
    this.isReady = false;
  }

  public setView(lnglat: LngLatLike, zoom: number): void {
    this.mapboxGlMap.setCenter(lnglat);
    this.mapboxGlMap.setZoom(zoom);
  }

  public getContainer(): HTMLElement {
    return this.mapboxGlMap.getContainer();
  }

  public fitBounds(bounds: LngLatBoundsLike): void {
    if (bounds) {
      this.mapboxGlMap.fitBounds(bounds);
    }
  }

  public getMapGl(): Map {
    return this.mapboxGlMap;
  }

  public addLayerOnReady(layer: Dhis2Layer): void {
    if (!layer.isOnMap()) {
      layer.addTo(this);
    }
    this.layers.push(layer);
    this.isReady = true;
    setTimeout(() => this.orderLayers(), 50);
  }

  public orderLayers(): void {
    const areLayersOutOfOrder = this.layers.some(
      (layer, index) => layer.getIndex() !== index
    );

    if (areLayersOutOfOrder) {
      this.layers.sort((a, b) => a.getIndex() - b.getIndex());
      for (const layer of this.layers) {
        layer.moveToTop();
      }
    }
  }
}
