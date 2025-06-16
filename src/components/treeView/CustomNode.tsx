import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Button,
  Tooltip,
  useTheme,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import type { CustomNodeData } from "../../types/treeViewTypes";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { memo, useEffect, useState } from "react";
import { nodeHeight, nodeWidth } from "../../utils";
import { toast } from "react-toastify";

const CustomNode = (props: NodeProps) => {
  const { background, primary, warning, error } = useTheme().palette;
  const data = props.data as CustomNodeData;
  const initialNodeDetails = {
    isBypass: data.isBypass,
    isNotAllowed: data.isNotAllowed,
    name: data.name,
    stationNumber: data.stationNumber,
  };
  const { setNodes, getNode } = useReactFlow();
  const [nodeDetails, setNodeDetails] = useState(initialNodeDetails);
  const [hovered, setHovered] = useState(false);

  let bgColor = background.paper;
  let textColor = warning.contrastText;
  if (data.isBypass) {
    bgColor = primary.main;
    textColor = primary.contrastText;
  } else if (data.isNotAllowed) {
    bgColor = error.dark;
    textColor = primary.contrastText;
  }

  const sharedInputStyles = {
    height: (nodeHeight - 2) / 2,
    width: nodeWidth - 2,
    "& .MuiInputBase-root": {
      fontSize: 12,
      height: "100%",
      boxSizing: "border-box",
    },
  };

  function handleChange(
    field: keyof typeof nodeDetails,
    value: string | boolean
  ) {
    if (
      (field === "isBypass" && value === true && nodeDetails.isNotAllowed) ||
      (field === "isNotAllowed" && value === true && nodeDetails.isBypass)
    )
      return toast.error(
        'Only one can be enabled, either "Bypass" or "Not Allowed".'
      );
    setNodeDetails((nd) => ({ ...nd, [field]: value }));
  }

  useEffect(() => {
    if (!props.selected) setNodeDetails(initialNodeDetails);
  }, [props.selected]);

  const previewDetailsPopup = (
    <Paper
      elevation={0}
      sx={{
        position: "absolute",
        bottom: nodeHeight,
        left: "50%",
        transform: "translateX(-50%)",
        p: 1,
        borderRadius: 3,
        whiteSpace: "nowrap",
        width: "fit",
        zIndex: 999,
        fontSize: 12,
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        gap: 1,
        bgcolor: "background.paper",
        border: "0.5px solid",
        borderColor: "secondary.light",
      }}
    >
      <Typography fontSize={12}>
        <strong>Name:</strong> {data.name}
      </Typography>
      <Typography fontSize={12}>
        <strong>Station:</strong> {data.stationNumber}
      </Typography>
      {!!data?.inputStations?.length && (
        <Typography fontSize={12}>
          <strong>Input Stations: </strong>
          {data.inputStations.join(", ")}
        </Typography>
      )}
    </Paper>
  );

  const editDetailsPopup = (
    <Stack gap={2}>
      <Stack
        position={"absolute"}
        top={0}
        left={0}
        width={nodeWidth}
        height={nodeHeight}
        bgcolor={"background.paper"}
      >
        <TextField
          onChange={(e) => handleChange("name", e.target.value)}
          sx={sharedInputStyles}
          value={nodeDetails.name || ""}
        />
        <TextField
          onChange={(e) => handleChange("stationNumber", e.target.value)}
          sx={sharedInputStyles}
          value={nodeDetails.stationNumber || ""}
        />
      </Stack>
      <Stack
        direction="row"
        width={"100%"}
        gap={0.5}
        position={"absolute"}
        bottom={"-20px"}
        left={0}
        color={"secondary.main"}
        bgcolor={"background.paper"}
      >
        {/* if not_allowed and bypass_lists both represents different state of same value (bypass_allowed) then we can modify these toogle buttons and their functional logic */}
        {["Toggle not allowed", "Toggle bypass allowed", "Cancel", "Save"].map(
          (btn) => {
            function getVariant() {
              if (
                btn === "Save" ||
                (btn.includes("not") && nodeDetails.isNotAllowed) ||
                (btn.includes("bypass") && nodeDetails.isBypass)
              )
                return "contained";
              else return "outlined";
            }

            function getColor() {
              if (btn === "Save") return "success";
              if (btn === "Cancel") return "inherit";
              if (btn.includes("not")) return "error";
              if (btn.includes("bypass")) return "primary";
            }

            function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
              // this is for preventing node focus while an action in edit popup
              e.stopPropagation();
              if (btn === "Save") {
                // in this block, we can call put/patch API for updating node details in database
                const newId = String(
                  +nodeDetails.stationNumber.replace("M", "")
                );
                const isExists = getNode(newId);
                if (isExists && newId !== props.id)
                  return toast.error(
                    "A node with this station number already exists."
                  );

                setNodes((nds) =>
                  nds.map((nd) =>
                    nd.id === props.id
                      ? {
                          ...nd,
                          id: newId, // also update id (machine_id) if station_number and machine_id are related like (34 => M034)
                          data: {
                            ...nd.data,
                            isBypass: nodeDetails.isBypass,
                            isNotAllowed: nodeDetails.isNotAllowed,
                            name: nodeDetails.name || data.name,
                            stationNumber:
                              nodeDetails.stationNumber || data.stationNumber,
                          } as CustomNodeData,
                          selected: false,
                        }
                      : nd
                  )
                );
              }
              if (btn === "Cancel") {
                setNodes((nds) =>
                  nds.map((nd) => ({ ...nd, selected: false }))
                );
              }
              if (btn.includes("not"))
                handleChange("isNotAllowed", !nodeDetails.isNotAllowed);
              if (btn.includes("bypass"))
                handleChange("isBypass", !nodeDetails.isBypass);
            }

            return (
              <Tooltip key={btn} title={btn}>
                <Button
                  variant={getVariant()}
                  color={getColor()}
                  sx={{
                    minWidth: 20,
                    width: 30,
                    height: 20,
                    borderRadius: 4,
                    flexGrow: 1,
                  }}
                  aria-label={btn}
                  onClick={handleClick}
                >
                  {btn.includes("not") && <BlockIcon sx={{ width: 13 }} />}
                  {btn.includes("bypass") && (
                    <ShortcutIcon sx={{ width: 13 }} />
                  )}
                  {btn.includes("Cancel") && <CloseIcon sx={{ width: 13 }} />}
                  {btn.includes("Save") && <CheckIcon sx={{ width: 13 }} />}
                </Button>
              </Tooltip>
            );
          }
        )}
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        onMouseEnter={() => {
          data.bringToFront(props.id);
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        sx={{
          borderRadius: 2,
          bgcolor: bgColor,
          color: textColor,
          boxShadow: 30,
          p: 1.5,
          textAlign: "center",
          border: "1px solid",
          borderColor: "secondary.light",
          fontSize: 14,
          width: nodeWidth,
          height: nodeHeight,
          cursor: "pointer",
        }}
      >
        <Typography
          fontWeight={600}
          fontSize={12}
          width={nodeWidth - 20}
          noWrap
          textOverflow={"ellipsis"}
        >
          {data.name}
        </Typography>
        <Typography fontSize={12}>{data.stationNumber}</Typography>

        <Handle type="source" position={props.sourcePosition as Position} />
        <Handle type="target" position={props.targetPosition as Position} />
      </Box>
      {props.selected && editDetailsPopup}
      {hovered && !props.selected && previewDetailsPopup}
    </Box>
  );
};

export default memo(CustomNode);
