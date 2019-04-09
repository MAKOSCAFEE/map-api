import bbox from '@turf/bbox';
import { BBox } from '@turf/helpers';
import { EventEmitter } from 'events';
import { Feature, FeatureCollection } from 'geojson';
import { AnySourceData, Layer, Map } from 'mapbox-gl';
import uuid from 'uuid/v4';
import { Dhis2Map } from '../map';
import { LayerOptions } from '../models/layer-options.model';
import { Dhis2Layer } from '../models/layer.model';
import { addImages } from '../utils/images.util';

class MapLayer extends EventEmitter implements Dhis2Layer {
  public options: LayerOptions;
  private map: Dhis2Map;
  private id: string;
  private images: any;
  private isMapVisible: boolean;
  private sources: { [id: string]: any };
  private interactiveIds: string[];
  private layers: Layer[];
  private features: Feature[];

  constructor(options: LayerOptions = {}) {
    super();
    this.sources = {};
    this.id = options.id || uuid();
    this.layers = [];
    this.features = [];
    this.isMapVisible = true;
    this.interactiveIds = [];
    this.options = options;
  }

  public async addTo(map: Dhis2Map): Promise<void> {
    const { onClick, onRightClick } = this.options;
    this.map = map;
    const mapboxGl = map.getMapGl();
    const images = this.getImages();
    const sources = await this.getSource();
    const layers = this.getLayers();

    if (images) {
      await addImages(mapboxGl, images);
    }
    Object.keys(sources).forEach(id => mapboxGl.addSource(id, sources[id]));
    layers.forEach(layer => mapboxGl.addLayer(layer));

    if (onClick) {
      this.on('click', onClick);
    }
    if (onRightClick) {
      this.on('contextmenu', onRightClick);
    }
  }

  public removeFrom(map: Dhis2Map): void {
    const mapboxGl = map.getMapGl();
    const sources = this.getSource();
    const layers = this.getLayers();
    const { onClick, onRightClick } = this.options;

    layers.forEach(layer => mapboxGl.removeLayer(layer.id));
    Object.keys(sources).forEach(id => mapboxGl.removeSource(id));

    if (onClick) {
      this.off('click', onClick);
    }
    if (onRightClick) {
      this.off('contextmenu', onRightClick);
    }
  }

  public getImages(): any {
    return this.images;
  }

  public getId(): string {
    return this.id;
  }

  public getMap(): Dhis2Map {
    return this.map;
  }

  public getMapGl(): Map {
    return this.map && this.map.getMapGl();
  }

  public isOnMap(): boolean {
    const mapboxGl = this.getMapGl();
    return Boolean(mapboxGl && mapboxGl.getLayer(this.id));
  }

  public isVisible(): boolean {
    return this.isMapVisible;
  }

  public getSource(): { [id: string]: AnySourceData } {
    return this.sources;
  }
  public isInteractive(): boolean {
    return !!this.interactiveIds.length && this.isOnMap() && this.isVisible();
  }

  public getInteractiveIds(): string[] {
    return this.isInteractive() ? this.interactiveIds : [];
  }

  // Adds integer id for each feature (required by Feature State)
  public setFeatures(data = []): void {
    this.features = data.map((f, i) => ({ ...f, id: i }));
  }

  public addLayer(layer: Layer, isInteractive: boolean): void {
    this.layers.push(layer);
    if (isInteractive) {
      this.interactiveIds.push(layer.id);
    }
  }

  public setSource(id: string | number, source: any): void {
    this.sources[id] = source;
  }

  public getLayers(): Layer[] {
    return this.layers;
  }

  public hasLayerId(id: string): boolean {
    return this.getLayers().some(layer => layer.id === id);
  }

  public moveToTop(): void {
    const mapboxGl = this.getMapGl();
    this.getLayers().forEach(layer => mapboxGl.moveLayer(layer.id));
  }

  public getFeatures(): FeatureCollection {
    return {
      features: this.features,
      type: 'FeatureCollection'
    };
  }

  public setIndex(index: number): void {
    this.options.index = index;

    this.getMap().orderLayers();
  }

  public getIndex(): number {
    return this.options.index || 0;
  }

  public getBound(): BBox {
    const data = this.getFeatures();
    return data && data.features.length ? bbox(data) : null;
  }

  // TODO: implement setOpacity;
}

export default MapLayer;
