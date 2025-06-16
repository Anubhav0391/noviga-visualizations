import { CircularProgress } from "@mui/material";

const Spinner = () => {
  return (
    <CircularProgress
      size={30}
      sx={{
        translate: "-50% -50%",
        position: "fixed",
        left: "50%",
        top: "50%",
      }}
    />
  );
};

export default Spinner;
