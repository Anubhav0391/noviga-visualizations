import { configureStore } from "@reduxjs/toolkit";
import scatterPlot from "./slices/scatterPlotSlice";
import treeView from "./slices/treeViewSlice";

export const store = configureStore({
  reducer: { scatterPlot, treeView },
});
export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
