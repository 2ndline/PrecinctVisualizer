import * as L from "leaflet";
export interface Precinct {
  id: string;
  feature?: any;
  layer?: L.Layer;
  data?: any;
}
