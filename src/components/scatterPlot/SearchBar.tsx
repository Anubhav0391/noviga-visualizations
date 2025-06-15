import React, { useRef } from "react";
import {
  MenuItem,
  Button,
  FormControl,
  styled,
  type TextFieldProps,
  TextField,
  Grid,
} from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { PickerValue } from "@mui/x-date-pickers/internals";
import {
  fetchChangeLogData,
  fetchPredictionData,
  setFilters,
  setSelectedTool,
  toggleComparision,
} from "../../redux/slices/scatterPlotSlice";
import { useDispatch, useSelector } from "react-redux";
import type { Dispatch, RootState } from "../../redux/store";
import type { Filters } from "../../types/scatterPlotTypes";
import { formatTime } from "../../utils";

const CustomFilledInput = styled((props: TextFieldProps) => (
  <TextField
    variant="filled"
    slotProps={{
      input: { disableUnderline: true },
      inputLabel: { color: "black" },
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiFilledInput-root": {
    overflow: "hidden",
    borderRadius: 10,
    border: "1px solid",
    background: theme.palette.background.paper,
    borderColor: theme.palette.secondary.light,
    transition: theme.transitions.create(["border-color", "background-color"]),
  },
}));

const CustomButton = styled(Button)(() => ({
  height: 56,
  padding: "0 24px",
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 500,
  fontSize: "1rem",
  width: "100%",
}));

const commonSlotProps: TextFieldProps = {
  variant: "filled",
  InputProps: { disableUnderline: true },
  InputLabelProps: { sx: { "&.Mui-focused": { color: "gray" } } },
  sx: {
    border: "1px solid",
    borderColor: "secondary.light",
    borderRadius: 2.5,
    overflow: "hidden",
    width: "100%",
    "& .MuiPickersFilledInput-root": {
      border: "none",
      backgroundColor: "background.paper",
      "&.Mui-focused": { backgroundColor: "background.paper" },
    },
  },
};

export default function SearchBar() {
  const dispatch = useDispatch<Dispatch>();
  const { filters, changeLogData,showComparison } = useSelector(
    (store: RootState) => store.scatterPlot
  );
  const toolSequences =
    changeLogData?.Result[0].config_parameters.tool_sequence_map;
  const prevFilters = useRef({
    machine: filters.machine,
    startDate: filters.startDate,
    endDate: filters.endDate,
    startTime: filters.startTime,
    endTime: filters.endTime,
  });

  const handleChange = (field: keyof Filters, value: string | PickerValue) => {
    dispatch(setFilters({ field, value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const coreFields: (keyof typeof prevFilters.current)[] = [
      "machine",
      "startDate",
      "endDate",
      "startTime",
      "endTime",
    ];

    const shouldFetch = coreFields.some(
      (key) => filters[key] !== prevFilters.current[key]
    );

    if (shouldFetch) {
      const machine_id = filters.machine;
      const from_time = formatTime(filters.startDate, filters.startTime);
      const to_time = formatTime(filters.endDate, filters.endTime);

      dispatch(fetchPredictionData({ from_time, to_time, machine_id }));
      dispatch(fetchChangeLogData({ from_time, to_time, machine_id }));

      prevFilters.current = coreFields.reduce((currFilters, key) => {
        currFilters[key] = filters[key];
        return currFilters;
      }, {} as typeof prevFilters.current);
    } else {
      dispatch(setSelectedTool(filters.tool));
    }
  };

  const handleComparison = () => {
    dispatch(toggleComparision());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid
        container
        component="form"
        spacing={1}
        alignItems="center"
        onSubmit={handleSearch}
        position={"fixed"}
        zIndex={2}
        p={2}
        pl={"76px"}
        top={0}
        left={0}
        bgcolor={'background.paper'}
      >
        <Grid size={{ xs: 6, md: 3, lg: "grow" }}>
          <FormControl variant="standard" sx={{ width: "100%" }}>
            <CustomFilledInput
              select
              label="Machine"
              value={filters.machine}
              onChange={(e) => handleChange("machine", e.target.value)}
            >
              {/* we can use machine_ids as value in case of actual api calls */}
              <MenuItem value="Machine1-SSP0173">SSP0173</MenuItem>
              <MenuItem value="Machine2-SSP0167">SSP0167</MenuItem>
            </CustomFilledInput>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, md: 3, lg: "grow" }}>
          <DatePicker
            label="Start date"
            value={new Date(filters.startDate)}
            onChange={(date) => handleChange("startDate", date)}
            slotProps={{ textField: commonSlotProps }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3, lg: "grow" }}>
          <TimePicker
            label="Start time"
            value={new Date(filters.startTime)}
            onChange={(time) => handleChange("startTime", time)}
            slotProps={{ textField: commonSlotProps }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3, lg: "grow" }}>
          <DatePicker
            label="End date"
            value={new Date(filters.endDate)}
            onChange={(date) => handleChange("endDate", date)}
            slotProps={{ textField: commonSlotProps }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3, lg: "grow" }}>
          <TimePicker
            label="End time"
            value={new Date(filters.endTime)}
            onChange={(time) => handleChange("endTime", time)}
            slotProps={{ textField: commonSlotProps }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3, lg: "grow" }}>
          <FormControl variant="standard" sx={{ width: "100%" }}>
            <CustomFilledInput
              select
              label="Select Tool"
              value={filters.tool}
              onChange={(e) => handleChange("tool", e.target.value)}
            >
              {Object.entries(toolSequences!).map(([value, key]) => (
                <MenuItem key={key} value={value}>
                  {key}
                </MenuItem>
              ))}
            </CustomFilledInput>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, md: 3, lg: "grow" }}>
          <CustomButton type="submit" variant="contained">
            Search
          </CustomButton>
        </Grid>
        <Grid size={{ xs: 6, md: 3, lg: "grow" }}>
          <CustomButton
            variant="outlined"
            onClick={handleComparison}
            sx={{ lineHeight: 1.3 }}
          >
            {showComparison?'Hide':'Show'} Comparison
          </CustomButton>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
