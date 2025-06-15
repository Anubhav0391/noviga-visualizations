import { BaseEdge, BezierEdge, type EdgeProps } from "@xyflow/react";
import { memo } from "react";
import { nodeHeight, nodeWidth } from "../../utils";

function SelfConnectingEdge(props: EdgeProps) {
  if (props.source !== props.target) return <BezierEdge {...props} />;

  const { sourceX, sourceY, targetX, targetY, markerEnd } = props;
  const { direction } = props.data as { direction: "TB" | "LR" };

  const edgePathLeftRight = `M ${sourceX - 5} ${sourceY} A ${
    (sourceX - targetX) * 0.6
  } ${nodeHeight / 2} 0 1 0 ${targetX + 2} ${targetY}`;

  const edgePathTopBottom = `M ${sourceX} ${sourceY}
  A ${(65 * nodeWidth) / 200} ${(nodeHeight * 5) / 6} 0 1 0 ${
    targetX + 1
  } ${targetY}`;

  return (
    <BaseEdge
      path={direction === "TB" ? edgePathTopBottom : edgePathLeftRight}
      markerEnd={markerEnd}
    />
  );
}

export default memo(SelfConnectingEdge);
