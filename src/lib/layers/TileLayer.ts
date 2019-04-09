import { LayerOptions } from '../models/layer-options.model';
import Layer from './index';

class TileLayer extends Layer {
  constructor(options: LayerOptions) {
    super(options);
    const { url, attribution } = options;
    this.createSource(url, attribution);
    this.createLayer();
  }

  public createSource(url: string, attribution: string): void {
    const tiles = url.includes('{s}')
      ? ['a', 'b', 'c'].map(letter => url.replace('{s}', letter))
      : [url];

    this.setSource(this.getId(), {
      attribution,
      tileSize: 256,
      tiles,
      type: 'raster'
    });
  }

  public createLayer(): void {
    this.addLayer(
      { id: this.getId(), type: 'raster', source: this.getId() },
      false
    );
  }

  public setOpacity(opacity): void {
    if (this.isOnMap) {
      const mapboxGl = this.getMapGl();
      mapboxGl.setPaintProperty(this.getId(), 'raster-opacity', opacity);
    }
  }
}

export default TileLayer;
