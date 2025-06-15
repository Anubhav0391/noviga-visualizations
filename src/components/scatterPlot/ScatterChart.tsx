import React, { useMemo } from "react";
import Highcharts, {
  type Options,
  type PointMarkerOptionsObject,
  type PointOptionsObject,
  type SeriesLineOptions,
  type SeriesScatterOptions,
} from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import type { CycleData, SequenceType } from "../../types/scatterPlotTypes";
import { Box, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { Dispatch, RootState } from "../../redux/store";
import "highcharts/modules/exporting";
import { fetchTimeSeriesData } from "../../redux/slices/scatterPlotSlice";

declare module "highcharts" {
  interface Point {
    custom?: CycleData;
  }
}

// cycle data is available only for these cycle_log_ids. this is for highlighting available points and not part of requirements
const availableTimeSeriesData: Record<string, number[]> = {
  "Machine1-SSP0173": [89152, 88362, 89280],
  "Machine2-SSP0167": [91472, 80753, 89418],
};

const ScatterChart: React.FC<{
  setSelectedCycle: (v: CycleData) => void;
}> = ({ setSelectedCycle }) => {
  const dispatch = useDispatch<Dispatch>();
  const theme = useTheme();
  const {
    predictionData,
    changeLogData,
    selectedTool,
    filters,
    showComparison,
  } = useSelector((store: RootState) => store.scatterPlot);
  const cycles = predictionData?.Result.cycles;
  const logs = changeLogData?.Result;

  const chartOptions: Options | undefined = useMemo(() => {
    if (!cycles || !logs) return;
    try {
      const unprocessed: PointOptionsObject[] = [];
      const anomalies: PointOptionsObject[] = [];
      const normals: PointOptionsObject[] = [];
      const unknown: PointOptionsObject[] = [];
      const threshold: PointOptionsObject[] = [];

      // ------------ this is only for exploring time-series chart with sample data ------------
      const shouldHighlight =
        (filters.machine.includes("Machine1") && selectedTool === "101") ||
        (filters.machine.includes("Machine2") && selectedTool === "901")
          ? (cycleLogId: number) =>
              availableTimeSeriesData[filters.machine]?.includes(cycleLogId)
          : false;

      const addPoint = (
        series: PointOptionsObject[],
        x: number,
        y: number,
        custom: CycleData | { id: string },
        marker: PointMarkerOptionsObject
      ) => series.push({ x, y, custom, marker });

      for (const [epoch, cycle] of Object.entries(cycles)) {
        const timestamp = Number(epoch) * 1000;
        const toolData = cycle.data[selectedTool as SequenceType];
        if (!toolData) continue;
        const { distance, anomaly } = toolData;

        const targetSeries = !cycle.anamoly_processed
          ? unprocessed
          : anomaly === true
          ? anomalies
          : anomaly === false
          ? normals
          : unknown;

        // ------------ highlighted those points(markers) that are available in sample data ------------
        const marker = {
          lineColor:
            shouldHighlight && shouldHighlight(cycle.cycle_log_id)
              ? "orange"
              : "transparent",
          lineWidth: 2,
        };

        addPoint(targetSeries, timestamp, distance, cycle, marker);
      }

      const timestamps = Object.keys(cycles).map(Number).sort();
      const minX = timestamps[0] * 1000;
      const maxX = timestamps[timestamps.length - 1] * 1000;

      const rawThresholdData: PointOptionsObject[] = logs.map((log) => ({
        x: new Date(log.start_time).getTime(),
        y: log.learned_parameters[selectedTool].threshold,
        marker: { enabled: false },
        custom: { id: log.id },
      }));

      const sortedThresholdData = rawThresholdData.sort(
        (a, b) => (a.x! as number) - (b.x as number)
      );

      sortedThresholdData.forEach((th, i) => {
        const custom = th.custom as { id: string };
        const beforeLast = sortedThresholdData[sortedThresholdData.length - 2];

        if (i === 0) addPoint(threshold, minX, th.y || 0, custom, th.marker!);
        else if (i + 1 === sortedThresholdData.length) {
          if ((th.x as number) < maxX) {
            threshold.push(th);
            addPoint(threshold, maxX, th.y || 0, custom, th.marker!);
          } else
            addPoint(threshold, maxX, beforeLast.y || 0, custom, th.marker!);
        } else threshold.push(th);
      });

      const options: Options = {
        chart: {
          type: "scatter",
          zooming: { type: "xy" },
          height: 550
        },
        title: { text: filters.machine },
        legend: {
          verticalAlign: "top",
          align: "right",
          borderWidth: 1,
          events: {
            itemClick() {
              return false;
            },
          },
        },
        caption: {
          text: "Scatter Plot",
          verticalAlign: "top",
          y: 60,
          style: { fontSize: "20px" },
        },
        credits: { enabled: false },
        xAxis: {
          type: "datetime",
          title: { text: "Time" },
          // -- use this
          dateTimeLabelFormats: { week: "%e %b" },
          // -- or this
          // labels: {
          //   formatter: function () {
          //     return `${moment(this.value).format("D MMM")}`;
          //   },
          // },
          startOnTick: true,
          endOnTick: true,
        },
        yAxis: { title: { text: "Values" } },
        tooltip: {
          useHTML: true,
          formatter() {
            return `
            <b>ID:</b> ${this.custom?.id}
            <br/>
            <b>Start:</b> ${moment(this.x).format("DD MMM HH:mm")}
            <br/>
            <b>End:</b> ${moment(this.x).format("DD MMM HH:mm")}
            <br/>
            <b>Value:</b> ${this.y}
          `;
          },
        },
        plotOptions: {
          series: {
            cursor: "pointer",
            point: {
              events: {
                click: function () {
                  if (this.custom) {
                    setSelectedCycle(this.custom);
                    const { cycle_log_id, data } = this.custom;
                    dispatch(
                      fetchTimeSeriesData({
                        machine_id: filters.machine,
                        cycle_log_id,
                        anomaly: data[selectedTool as SequenceType].anomaly,
                        signal: "spindle_1_load",
                      })
                    );
                  }
                },
              },
            },
            marker: { enabled: true, radius: 5 },
          },
        },
        series: [
          {
            name: `Cycle Anomaly: True`,
            data: anomalies,
            color: theme.palette.error.dark,
            marker: { symbol: "diamond" },
            zIndex: 2,
          },
          {
            name: `Cycle Anomaly: False`,
            data: normals,
            color: theme.palette.success.light,
            marker: { symbol: "circle" },
          },
          {
            name: `Cycle Anomaly: Null`,
            data: unprocessed,
            color: theme.palette.secondary.main,
            marker: { symbol: "square" },
            zIndex: 2,
          },
          {
            name: `Sequence Anomaly: Null`,
            data: unknown,
            color: theme.palette.secondary.main,
            marker: { symbol: "triangle" },
            zIndex: 2,
          },
          {
            name: `Threshold`,
            data: threshold,
            type: "line",
            step: "left",
            marker: { enabled: true, symbol: "triangle-down", radius: 5 },
            color: theme.palette.warning.light,
            zIndex: 2,
          },
        ] as (SeriesScatterOptions | SeriesLineOptions)[],
      };

      return options;
    } catch (error) {
      console.log(error, "error from scatter chart");
    }
  }, [cycles, logs, selectedTool]);

  return (
    <Box
      width={{ md: showComparison ? "50%" : "100%" }}
      border={"1px solid gainsboro"}
      borderRadius={5}
      p={2}
      overflow={"hidden"}
      sx={{ transition: "all 0.3s" }}
    >
      <HighchartsReact
        key={selectedTool}
        highcharts={Highcharts}
        options={chartOptions}
      />
    </Box>
  );
};

export default ScatterChart;
