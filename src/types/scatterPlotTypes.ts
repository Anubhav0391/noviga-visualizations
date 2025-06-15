export interface SignalData {
  anomaly: boolean | null;
  distance: number;
}

export type SequenceType =
  | "101"
  | "201"
  | "301"
  | "401"
  | "501"
  | "601"
  | "701"
  | "801"
  | "901"; // we can include all possible sequences

export interface CycleData {
  processed_time: string;
  id: string;
  anamoly_processed: boolean;
  start_time: string;
  anomaly: boolean;
  data: Record<SequenceType, SignalData>;
  end_time: string;
  machine_id: string;
  custom_attributes: unknown;
  cycle_log_id: number;
}

export interface PredictionData {
  Status: boolean;
  Result: {
    machine_id: string;
    last_synced_time: string;
    unprocessed_sequences: Record<SequenceType, number>;
    from_time: string;
    to_time: string;
    cycles: Record<string, CycleData>;
  };
}

export interface Filters {
  machine: string;
  tool: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface ScatterState {
  selectedTool: string;
  showComparison: boolean;
  filters: Filters;
  predictionData: PredictionData | null;
  changeLogData: ChangeLogData | null;
  timeSeriesData: TimeSeriesData | null;
  loadings: { prediction: boolean; changeLog: boolean; timeSeries: boolean };
  errors: { prediction: unknown; changeLog: unknown; timeSeries: unknown };
}

export interface FetchPredictionDataParams {
  from_time: string;
  to_time: string;
  machine_id: string;
}

//changelog

export interface FetchChangeLogDataParams {
  from_time: string;
  to_time: string;
  machine_id: string;
}

export interface ChangeLogData {
  Status: boolean;
  Result: Logs[];
}

export interface Logs {
  id: string;
  machine_id: string;
  start_time: string;
  config_parameters: ConfigParameters;
  learned_parameters: Record<string, LearnedParameter>;
}

export interface ConfigParameters {
  tool_sequence_map: Record<string, number>;
  sequence: Record<string, SequenceConfig>;
}

export interface SequenceConfig {
  window: number;
  max_points: number;
  min_points: number;
}

export interface LearnedParameter {
  threshold: number;
  average_list: number[];
}

//timeSeries
export interface FetchTimeSeriesDataParams {
  cycle_log_id: number;
  signal: string;
  machine_id: string;
  anomaly: boolean | null;
}

export interface TimeSeriesCycleData {
  cycle_data: {
    [signal: string]: {
      [timestamp: string]: number;
    };
  };
}

export interface TimeSeriesData {
  Status: boolean;
  Result: {
    data: {
      [change_log_id: string]: TimeSeriesCycleData;
    };
  };
}
