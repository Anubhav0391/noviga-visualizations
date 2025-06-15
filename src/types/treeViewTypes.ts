export interface TreeState {
  treeData: TreeData | null;
  loadings: { getTreeData: boolean };
  errors: { getTreeData: unknown };
}

export interface TreeData {
  bypass_list: number[];
  not_allowed_list: number[];
  prod_machine_map: Machine[];
}

export interface Machine {
  id: number;
  machine_id: number;
  name: string;
  station_number: string;
  input_stations: number[];
  ideal_cycle_time: number;
}

export interface FetchTreeDataParams {
  id: number;
}

export type CustomNodeData = {
  isBypass: boolean;
  isNotAllowed: boolean;
  name: string;
  stationNumber: string;
  inputStations: number[];
  bringToFront: (nodeId: string) => void;
};