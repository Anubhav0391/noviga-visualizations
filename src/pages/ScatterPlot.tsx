import { Box, Stack, Typography } from "@mui/material";
import LineChart from "../components/scatterPlot/LineChart";
import type { CycleData, SequenceType } from "../types/scatterPlotTypes";
import { useEffect, useState } from "react";
import ScatterChart from "../components/scatterPlot/ScatterChart";
import SearchBar from "../components/scatterPlot/SearchBar";
import { useDispatch, useSelector } from "react-redux";
import type { Dispatch, RootState } from "../redux/store";
import {
  fetchChangeLogData,
  fetchPredictionData,
} from "../redux/slices/scatterPlotSlice";
import { formatTime } from "../utils";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

function ScatterPlot() {
  const [selectedCycle, setSelectedCycle] = useState<CycleData>();
  const {
    filters,
    predictionData,
    changeLogData,
    loadings,
    errors,
    timeSeriesData,
    selectedTool,
    showComparison,
  } = useSelector((store: RootState) => store.scatterPlot);
  const dispatch = useDispatch<Dispatch>();
  const toolSequences =
    changeLogData?.Result[0].config_parameters.tool_sequence_map;
  const configuration =
    changeLogData?.Result[0].config_parameters.sequence[selectedTool];
  const timeSeriesCycles =
    selectedCycle && timeSeriesData
      ? timeSeriesData?.Result.data[selectedCycle.cycle_log_id]?.cycle_data[
          "spindle_1_load"
        ]
      : {};
  const counts = {
    unprocessed: Object.keys(timeSeriesCycles || {})?.length,
    min: configuration?.min_points,
    max: configuration?.max_points,
  };

  useEffect(() => {
    const machine_id = filters.machine;
    const from_time = formatTime(filters.startDate, filters.startTime);
    const to_time = formatTime(filters.endDate, filters.endTime);
    dispatch(fetchChangeLogData({ from_time, to_time, machine_id }));
    dispatch(fetchPredictionData({ from_time, to_time, machine_id }));
  }, []);

  if (loadings.prediction || loadings.changeLog) return <Spinner />;
  if (errors.prediction || errors.changeLog || errors.timeSeries) {
    console.log({ errors });
    toast.error(
      "Something went wrong. Please check browser console for error details."
    );
  }

  return (
    predictionData &&
    changeLogData && (
      <Stack
        p={2}
        pt={{ lg: 11.5, xs: 36, md: 20 }}
        gap={2}
        sx={{ opacity: loadings.timeSeries ? 0.8 : 1 }}
      >
        <SearchBar />
        {toolSequences && (
          <Stack gap={1} border={"1px solid gainsboro"} bgcolor={"background.default"} borderRadius={5} p={2}>
            <Typography color="primary">Unprocessed Tool</Typography>
            <Stack direction={"row"} gap={2} flexWrap={"wrap"}>
              {Object.entries(predictionData.Result.unprocessed_sequences).map(
                ([seq, count]) => (
                  <Box
                    key={seq}
                    border={"1.5px solid gainsboro"}
                    borderRadius={5}
                    p={2}
                    px={3}
                  >
                    {toolSequences[seq]}:{" "}
                    <Box component={"span"} fontWeight={"medium"}>
                      {count}
                    </Box>
                  </Box>
                )
              )}
            </Stack>
          </Stack>
        )}
        {selectedTool && (
          <Stack direction={{ md: "row" }} gap={1}>
            <ScatterChart setSelectedCycle={setSelectedCycle} />
            {showComparison && (
              <ScatterChart setSelectedCycle={setSelectedCycle} />
            )}
          </Stack>
        )}
        {selectedCycle &&
          (timeSeriesData ? (
            <LineChart selectedCycle={selectedCycle} />
          ) : loadings.timeSeries ? (
            <Spinner />
          ) : (
            <Typography
              textAlign={"center"}
              p={4}
              border={"1px solid gainsboro"}
              borderRadius={5}
            >
              This is sample data. Please select highlighted points (orange
              border) to check Time Series chart
            </Typography>
          ))}
        {!!(
          timeSeriesData &&
          changeLogData &&
          selectedCycle?.data[selectedTool as SequenceType].anomaly === null
        ) && (
          <Stack
            gap={2}
            direction={"row"}
            border={"1px solid gainsboro"}
            borderRadius={5}
            flexWrap={"wrap-reverse"}
            alignItems={"center"}
            justifyContent={"center"}
            p={2}
          >
            <Typography>
              Unprocessed Reason:{" "}
              <Typography component={"span"} color="primary">
                {!configuration
                  ? "Configuration not found for this sequence"
                  : counts.unprocessed! > counts.max!
                  ? "More data points from the machine"
                  : counts.unprocessed! < counts.min!
                  ? "Less data points from the machine"
                  : ""}
              </Typography>
            </Typography>
            <Stack direction={"row"} gap={2} flexWrap={"wrap"}>
              {Object.entries(counts).map(([key, count]) => (
                <Box
                  key={key}
                  border={"1.5px solid gainsboro"}
                  borderRadius={3}
                  textTransform={"capitalize"}
                  p={1}
                >
                  {key} Count:{" "}
                  <Box
                    color={
                      key === "unprocessed" ? "error.dark" : "success.light"
                    }
                    component={"span"}
                    fontWeight={"medium"}
                  >
                    {count}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    )
  );
}

export default ScatterPlot;
