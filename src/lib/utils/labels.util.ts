import area from '@turf/area';
import { Layer } from 'mapbox-gl';
import polylabel from 'polylabel';

// TODO: Sould we host the fonts ourselves?
// https://github.com/openmaptiles/fonts
// https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
const fonts = {
  'italic-bold': 'Open Sans Bold Italic',
  'italic-normal': 'Open Sans Italic',
  'normal-bold': 'Open Sans Bold',
  'normal-normal': 'Open Sans Regular'
};

export const getLablesSource = data => ({
  data: {
    features: data.features.map(({ geometry, properties }) => ({
      geometry: {
        coordinates: getLabelPosition(geometry),
        type: 'Point'
      },
      properties: {
        name: properties.name
      },
      type: 'Feature'
    })),
    type: 'FeatureCollection'
  },
  type: 'geojson'
});

// Add label properties to layer config - TODO: Make immutable?
export const addTextProperties = (config, label, style) => {
  const { fontSize, fontStyle, fontWeight, color } = style;
  const font = `${fontStyle || 'normal'}-${fontWeight || 'normal'}`;
  const size = fontSize ? parseInt(fontSize, 10) : 12;

  config.layout['text-field'] = label || '{name}';
  config.layout['text-font'] = [fonts[font]];
  config.layout['text-size'] = size;
  config.layout['text-optional'] = true;

  config.paint = {
    'text-color': '#333' || color,
    'text-translate': [0, 20]
  };
};

export const getLabelsLayer = (id, label, style): Layer => {
  const { fontSize, fontStyle, fontWeight, color } = style;
  const font = `${fontStyle || 'normal'}-${fontWeight || 'normal'}`;
  const size = fontSize ? parseInt(fontSize, 10) : 12;

  return {
    id: `${id}-labels`,
    layout: {
      'text-field': label || '{name}',
      'text-font': [fonts[font]],
      'text-size': size
    },
    paint: {
      'text-color': color || '#333'
    },
    source: `${id}-labels`,
    type: 'symbol'
  };
};

export const getLabelPosition = ({ type, coordinates }) => {
  // tslint:disable-next-line:no-let
  let polygon = coordinates;

  if (type === 'MultiPolygon') {
    const areas = coordinates.map(coords =>
      area({
        coordinates: coords,
        type: 'Polygon'
      })
    );
    const maxIndex = areas.indexOf(Math.max.apply(null, areas));
    polygon = coordinates[maxIndex];
  }

  return polylabel(polygon, 0.1);
};
