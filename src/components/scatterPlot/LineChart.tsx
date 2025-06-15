import React, { memo, useEffect, useMemo, useRef } from "react";
import Highcharts, {
  type Options,
  type PointOptionsObject,
  type SeriesLineOptions,
} from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { CycleData } from "../../types/scatterPlotTypes";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Box, useTheme } from "@mui/material";
import moment from "moment";

const LineChart: React.FC<{ selectedCycle: CycleData }> = ({
  selectedCycle,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const { timeSeriesData, changeLogData, selectedTool } = useSelector(
    (store: RootState) => store.scatterPlot
  );
  const currentLog = changeLogData?.Result?.find((log, i, logs) => {
    const selectedTime = moment(selectedCycle.start_time);
    const currentLogTime = moment(log.start_time);
    const nextLogTime = logs[i + 1] ? moment(logs[i + 1].start_time) : null;
    return (
      currentLogTime.isSameOrBefore(selectedTime) &&
      (!nextLogTime || selectedTime.isBefore(nextLogTime))
    );
  });
  const idealData =
    currentLog?.learned_parameters?.[selectedTool]?.average_list;
  const actualData =
    timeSeriesData?.Result?.data?.[selectedCycle?.cycle_log_id]?.cycle_data?.[
      "spindle_1_load"
    ];

  const chartOptions: Options | undefined = useMemo(() => {
    if (!idealData || !actualData) return;
    try {
      const idealSignals: PointOptionsObject[] = [];
      const actualSignals: PointOptionsObject[] = [];

      Object.entries(actualData)?.forEach(([time, value], i) => {
        actualSignals.push([+time, value]);
        idealSignals.push([
          +time,
          idealData[i] || idealData[idealData.length - 1],
        ]);
      });

      const options: Options = {
        chart: {
          type: "line",
          zooming: { type: "xy" },
          panning: { type: "xy", enabled: true },
          panKey: "shift",
          height: 550,
        },
        title: {
          text: "Spindle 1 Load",
          align: "center",
          verticalAlign: "top",
          style: { fontSize: "20px" },
        },
        legend: {
          events: {
            itemClick() {
              return false;
            },
          },
        },
        xAxis: { title: { text: "Seconds" } },
        yAxis: { title: { text: "Values" } },
        plotOptions: { series: { cursor: "pointer" } },
        credits: { enabled: false },
        series: [
          {
            name: selectedCycle.processed_time,
            data: actualSignals,
            type: "line",
            marker: { enabled: true, symbol: "diamond", radius: 5 },
            color: theme.palette.primary.main,
            zIndex: 2,
          },
          {
            name: "Ideal",
            data: idealSignals,
            type: "line",
            marker: { enabled: true, symbol: "circle", radius: 5 },
            color: theme.palette.primary.light,
            zIndex: 1,
          },
        ] as SeriesLineOptions[],
      };

      return options;
    } catch (error) {
      console.log(error, "error from line chart");
    }
  }, [actualData, idealData]);

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [timeSeriesData]);

  return (
    <Box
      border={"1px solid gainsboro"}
      borderRadius={5}
      p={2}
      overflow={"hidden"}
      ref={ref}
    >
      <HighchartsReact
        key={selectedCycle.cycle_log_id}
        highcharts={Highcharts}
        options={chartOptions}
      />
    </Box>
  );
};

export default memo(
  LineChart,
  (prevProps, nextProps) =>
    prevProps.selectedCycle?.cycle_log_id ===
    nextProps.selectedCycle?.cycle_log_id
);
