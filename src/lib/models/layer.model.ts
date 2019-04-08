import { EventEmitter } from 'events';
import { Dhis2Map } from '../map';

export interface Dhis2Layer extends EventEmitter {
  addTo: (map: Dhis2Map) => void;
  isOnMap: () => boolean;
  isVisible: () => boolean;
  getIndex: () => number;
  moveToTop: () => void;
  removeFrom: (map: Dhis2Map) => void;
  isInteractive: () => boolean;
  getInteractiveIds: () => string[];
  hasLayerId: (id: string) => boolean;
}
