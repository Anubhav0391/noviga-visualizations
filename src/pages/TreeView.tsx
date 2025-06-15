import { CircularProgress, Stack, Typography } from "@mui/material";
import TreeGraph from "../components/treeView/TreeGraph";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchTreeData } from "../redux/slices/treeViewSlice";
import type { Dispatch } from "../redux/store";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { ReactFlowProvider } from "@xyflow/react";
import { toast } from "react-toastify";

const TreeView = () => {
  const { treeData, loadings, errors } = useSelector(
    (store: RootState) => store.treeView
  );
  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    dispatch(fetchTreeData({ id: 2 }));
  }, []);

  if (loadings.getTreeData)
    return (
      <CircularProgress
        size={40}
        sx={{
          translate: "-50% -50%",
          position: "absolute",
          top: "50%",
          left: "50%",
        }}
      />
    );

  if (errors.getTreeData) {
    console.log({ errors });
    toast.error(
      "Something went wrong. Please check browser console for error details."
    );
  }

  return (
    treeData && (
      <Stack p={2} height={"100vh"}>
        <Typography fontSize={30} fontWeight={"medium"}>
          Tree Visualization
        </Typography>
        <Typography>An interactive tree view of process flow.</Typography>
        <ReactFlowProvider>
          <TreeGraph treeData={treeData} />
        </ReactFlowProvider>
      </Stack>
    )
  );
};

export default TreeView;
