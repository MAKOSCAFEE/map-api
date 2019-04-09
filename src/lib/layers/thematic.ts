import { LayerOptions } from '../models/layer-options.model';
import { getLabelsLayer, getLablesSource } from '../utils/labels.util';
import Layer from './index';

const borderColor = '#333';
const borderWeight = 1;
const hoverBorderWeight = 3;

class Thematic extends Layer {
  constructor(options: LayerOptions) {
    super(options);

    const { data } = options;
    this.setFeatures(data);
    this.createSource();
    this.createLayers();
  }

  public createSource(): void {
    const id = this.getId();
    const features = this.getFeatures();
    const { label } = this.options;

    this.setSource(id, { type: 'geojson', data: features });

    if (label) {
      this.setSource(`${id}-labels`, getLablesSource(features));
    }
  }

  public createLayers(): void {
    const id = this.getId();
    const { label, labelStyle } = this.options;

    // Polygon layer
    this.addLayer(
      {
        filter: ['==', '$type', 'Polygon'],
        id: `${id}`,
        paint: {
          'fill-color': ['get', 'color'],
          'fill-outline-color': borderColor
        },
        source: id,
        type: 'fill'
      },
      true
    );

    // Point layer
    this.addLayer(
      {
        filter: ['==', '$type', 'Point'],
        id: `${id}-point`,
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['get', 'radius'],
          'circle-stroke-color': borderColor,
          'circle-stroke-width': borderWeight
        },
        source: id,
        type: 'circle'
      },
      true
    );

    // Polygon hover state
    this.addLayer(
      {
        filter: ['==', '$type', 'Polygon'],
        id: `${id}-hover`,
        paint: {
          'line-color': borderColor,
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            hoverBorderWeight,
            borderWeight
          ]
        },
        source: id,
        type: 'line'
      },
      false
    );

    // Point hover state
    this.addLayer(
      {
        filter: ['==', '$type', 'Point'],
        id: `${id}-point-hover`,
        paint: {
          'circle-opacity': 0,
          'circle-radius': ['get', 'radius'],
          'circle-stroke-color': borderColor,
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            hoverBorderWeight,
            borderWeight
          ]
        },
        source: id,
        type: 'circle'
      },
      false
    );

    if (label) {
      this.addLayer(getLabelsLayer(id, label, labelStyle), false);
    }
  }

  public setOpacity(opacity: number): void {
    if (this.isOnMap()) {
      const mapgl = this.getMapGl();
      const id = this.getId();
      const { label } = this.options;

      mapgl.setPaintProperty(id, 'fill-opacity', opacity);

      if (label) {
        mapgl.setPaintProperty(`${id}-labels`, 'text-opacity', opacity);
      }
    }
  }
}

export default Thematic;
