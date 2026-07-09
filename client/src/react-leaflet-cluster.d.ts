declare module "react-leaflet-cluster" {
  import { Component } from "react";
  import { MarkerClusterGroupOptions } from "leaflet";
  
  interface MarkerClusterGroupProps extends MarkerClusterGroupOptions {
    children: React.ReactNode;
    chunkedLoading?: boolean;
    iconCreateFunction?: (cluster: any) => any;
  }
  
  export default class MarkerClusterGroup extends Component<MarkerClusterGroupProps> {}
}
