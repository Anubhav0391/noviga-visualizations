import { Route, Routes } from "react-router";
import SideNav from "./components/SideNav";
import { Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { lazy, Suspense } from "react";
import Spinner from "./components/Spinner";

const ScatterPlot = lazy(() => import("./pages/ScatterPlot"));
const TreeView = lazy(() => import("./pages/TreeView"));

function App() {
  return (
    <Box pl={"60px"}>
      <SideNav />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<ScatterPlot />} />
          <Route path="/tree-view" element={<TreeView />} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </Box>
  );
}

export default App;
