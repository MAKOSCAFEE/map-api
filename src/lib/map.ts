import { EventEmitter } from 'events';
import { Geometry } from 'geojson';
import {
  EventData,
  Layer,
  LngLatBoundsLike,
  LngLatLike,
  Map,
  MapboxGeoJSONFeature
} from 'mapbox-gl';
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

const layerMapping: { [name: string]: Dhis2Layer } = {};
export class Dhis2Map extends EventEmitter {
  private mapboxGlMap: Map;
  private layers: Dhis2Layer[];
  private isReady: boolean;
  private hoverid: string;
  private hoverState: { source: string; id: string | number };

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

    this.mapboxGlMap.on('click', evt => this.onClick(evt));
    this.mapboxGlMap.on('contextmenu', evt => this.onContextMenu(evt));

    this.mapboxGlMap.on('mousemove', evt => this.onMouseMove(evt));
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

  public addLayer(layer: Dhis2Layer): void {
    if (!layer.isOnMap()) {
      if (this.isMapReady()) {
        this.addLayerOnReady(layer);
      } else {
        this.mapboxGlMap.once('styledata', () => this.addLayerOnReady(layer));
      }
    }
  }

  public removeLayer(layer: Dhis2Layer): void {
    layer.removeFrom(this);
    this.layers.filter(l => l !== layer);
  }

  public isMapReady(): boolean {
    return this.isReady || this.mapboxGlMap.isStyleLoaded();
  }

  public hasLayer(layer: Dhis2Layer): boolean {
    return layer && layer.isOnMap();
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

  public resize(): void {
    this.mapboxGlMap.resize();
  }

  public getLayers(): Dhis2Layer[] {
    return this.layers;
  }

  public onClick(
    evt: mapboxgl.MapMouseEvent & {
      features?: mapboxgl.MapboxGeoJSONFeature[];
    } & EventData
  ): void {
    const eventObj = this.createClickEvent(evt);

    if (eventObj.feature) {
      const layer = this.getLayerFromId(eventObj.feature.layer.id);
      layer.emit('click', eventObj);
    }
  }

  public onContextMenu(
    evt: mapboxgl.MapMouseEvent & {
      features?: mapboxgl.MapboxGeoJSONFeature[];
    } & EventData
  ): void {
    const eventObj = this.createClickEvent(evt);

    if (eventObj.feature) {
      const layer = this.getLayerFromId(eventObj.feature.layer.id);
      layer.emit('contextmenu', eventObj);
    } else {
      this.emit('contextmenu', eventObj);
    }
  }

  public onMouseMove(evt: mapboxgl.MapMouseEvent & EventData): void {
    const feature = this.getEventFeature(evt);

    const featureSourceId = feature ? `${feature.id}-${feature.source}` : null;

    if (featureSourceId !== this.hoverid) {
      const mapboxGl = this.getMapGl();
      mapboxGl.getCanvas().style.cursor = feature ? 'pointer' : '';

      if (this.hoverState) {
        if (mapboxGl.getSource(this.hoverState.source)) {
          mapboxGl.setFeatureState(this.hoverState, { hover: false });
        }
        this.hoverState = null;
      }
      if (feature) {
        this.hoverState = { source: feature.source, id: feature.id };
        mapboxGl.setFeatureState(this.hoverState, { hover: true });
      }
    }

    this.hoverid = featureSourceId;
  }

  public getLayerFromId(id: string): Dhis2Layer {
    return this.layers.find(layer => layer.hasLayerId(id));
  }

  private getEventFeature(evt): MapboxGeoJSONFeature {
    const layers = this.getLayers()
      .filter(l => l.isInteractive())
      .map(l => l.getInteractiveIds())
      .reduce((out, ids) => [...out, ...ids], []);
    return layers.length
      ? this.mapboxGlMap.queryRenderedFeatures(evt.point, { layers })[0]
      : undefined;
  }

  private createClickEvent(
    evt: mapboxgl.MapMouseEvent & {
      features?: mapboxgl.MapboxGeoJSONFeature[];
    } & EventData
  ): {
    coordinates: number[];
    position: number[];
    feature?: {
      geometry: Geometry;
      layer: Layer;
      properties: { [name: string]: any };
    };
  } {
    const { lngLat, originalEvent } = evt;
    const coordinates = [lngLat.lng, lngLat.lat];
    const position = [originalEvent.x, originalEvent.pageY || originalEvent.y];
    const eventObj = { coordinates, position };
    const eventFeature = this.getEventFeature(evt);

    const { properties, geometry, layer } = eventFeature;

    const feature = {
      geometry,
      layer,
      properties,
      type: 'Feature'
    };

    return eventFeature ? { ...eventObj, feature } : eventObj;
  }
}
