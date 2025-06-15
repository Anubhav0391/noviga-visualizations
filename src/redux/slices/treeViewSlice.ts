import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  FetchTreeDataParams,
  TreeData,
  TreeState,
} from "../../types/treeViewTypes";
import axios from "axios";

export const fetchTreeData = createAsyncThunk<TreeData, FetchTreeDataParams>(
  "treeView/treeData",
  async ({ id }) => {
    console.log({ id });
    const res = await axios.get(`/data/graphViz.json`);
    console.log({ res });
    return res.data;
  }
);

const initialState: TreeState = {
  treeData: null,
  loadings: {
    getTreeData: false,
  },
  errors: {
    getTreeData: undefined,
  },
};

const treeViewSlice = createSlice({
  name: "treeView",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreeData.pending, (state) => {
        state.loadings.getTreeData = true;
        state.errors.getTreeData = undefined;
      })
      .addCase(fetchTreeData.fulfilled, (state, action) => {
        state.loadings.getTreeData = false;
        state.treeData = action.payload;
      })
      .addCase(fetchTreeData.rejected, (state, action) => {
        state.loadings.getTreeData = false;
        state.errors.getTreeData = action.error.message;
      });
  },
});

export default treeViewSlice.reducer;
// export const {} = treeViewSlice.actions;
