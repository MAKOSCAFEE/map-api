import { Dhis2Map } from '../map';

export interface Dhis2Layer {
  addTo: (Map: Dhis2Map) => void;
  isOnMap: () => boolean;
  isVisible: () => boolean;
  getIndex: () => number;
  moveToTop: () => void;
}
