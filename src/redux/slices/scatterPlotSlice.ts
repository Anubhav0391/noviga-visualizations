import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  ChangeLogData,
  FetchChangeLogDataParams,
  FetchPredictionDataParams,
  FetchTimeSeriesDataParams,
  Filters,
  PredictionData,
  ScatterState,
  TimeSeriesData,
} from "../../types/scatterPlotTypes";
import axios from "axios";
import type { PickerValue } from "@mui/x-date-pickers/internals";
import { toast } from "react-toastify";

export const fetchPredictionData = createAsyncThunk<
  PredictionData,
  FetchPredictionDataParams
>("scatterPlot/predictionData", async ({ from_time, to_time, machine_id }) => {
  console.log({ from_time, to_time });
  const res = await axios.get(`/data/${machine_id}/prediction_data.json`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return res.data;
});

export const fetchChangeLogData = createAsyncThunk<
  ChangeLogData,
  FetchChangeLogDataParams
>("scatterPlot/changeLogData", async ({ from_time, to_time, machine_id }) => {
  console.log({ from_time, to_time });
  const res = await axios.get(`/data/${machine_id}/changelog.json`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return res.data;
});

export const fetchTimeSeriesData = createAsyncThunk<
  TimeSeriesData,
  FetchTimeSeriesDataParams
>(
  "scatterPlot/timeSeriesData",
  async ({ machine_id, cycle_log_id, signal, anomaly }) => {
    console.log({ signal, cycle_log_id, anomaly });
    const res = await axios.get(
      `/data/${machine_id}/timeseries_cycledata_${
        anomaly === true ? "red" : anomaly === false ? "green" : "black"
      }.json`
    );
    const data = res.data as TimeSeriesData;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (data.Result.data[cycle_log_id]) return res.data;
    else {
      toast.info(
        "Please select highlighted (orange border) points (available in sample data) to explore Time Series chart"
      );
      return null;
    }
  }
);

const initialState: ScatterState = {
  selectedTool: "101",
  showComparison: false,
  filters: {
    machine: "Machine1-SSP0173", // we can use machine_id in case of fetching data from actual apis
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    tool: "101",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
  },
  predictionData: null,
  changeLogData: null,
  timeSeriesData: null,
  loadings: {
    prediction: false,
    changeLog: false,
    timeSeries: false,
  },
  errors: {
    prediction: undefined,
    changeLog: undefined,
    timeSeries: undefined,
  },
};

const scatterPlotSlice = createSlice({
  name: "scatterPlot",
  initialState,
  reducers: {
    setFilters: (
      state,
      {
        payload,
      }: PayloadAction<{ field: keyof Filters; value: string | PickerValue }>
    ) => {
      const value =
        typeof payload.value === "object"
          ? payload.value?.toISOString()
          : payload.value;
      if (payload.field && value) state.filters[payload.field] = value;
    },
    setSelectedTool: (state, { payload }: PayloadAction<string>) => {
      state.selectedTool = payload;
    },
    toggleComparision: (state) => {
      state.showComparison = !state.showComparison;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPredictionData.pending, (state) => {
        state.loadings.prediction = true;
        state.errors.prediction = undefined;
      })
      .addCase(fetchPredictionData.fulfilled, (state, action) => {
        state.loadings.prediction = false;
        state.predictionData = action.payload;
      })
      .addCase(fetchPredictionData.rejected, (state, action) => {
        state.loadings.prediction = false;
        state.errors.prediction = action.error.message;
      })
      .addCase(fetchChangeLogData.pending, (state) => {
        state.loadings.changeLog = true;
        state.errors.changeLog = undefined;
      })
      .addCase(fetchChangeLogData.fulfilled, (state, action) => {
        state.loadings.changeLog = false;
        state.changeLogData = action.payload;
        const sequences = Object.keys(
          action.payload.Result[0].config_parameters.tool_sequence_map
        );
        const isSequenceExists = sequences.includes(state.selectedTool);
        if (!isSequenceExists) {
          state.selectedTool = sequences[0];
          state.filters.tool = sequences[0];
        }
      })
      .addCase(fetchChangeLogData.rejected, (state, action) => {
        state.loadings.changeLog = false;
        state.errors.changeLog = action.error.message;
      })
      .addCase(fetchTimeSeriesData.pending, (state) => {
        state.loadings.timeSeries = true;
        state.errors.timeSeries = undefined;
      })
      .addCase(fetchTimeSeriesData.fulfilled, (state, action) => {
        state.loadings.timeSeries = false;
        state.timeSeriesData = action.payload;
      })
      .addCase(fetchTimeSeriesData.rejected, (state, action) => {
        state.loadings.timeSeries = false;
        state.errors.timeSeries = action.error.message;
      });
  },
});

export default scatterPlotSlice.reducer;
export const { setFilters, setSelectedTool,toggleComparision } = scatterPlotSlice.actions;
