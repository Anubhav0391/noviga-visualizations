import React, { useEffect, useState } from "react";
import "@xyflow/react/dist/style.css";
import {
  ReactFlow,
  Background,
  type Node,
  useNodesState,
  useEdgesState,
  type Edge,
  Position,
  type NodeMouseHandler,
  Controls,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { Box, Stack, Switch } from "@mui/material";
import type { TreeData } from "../../types/treeViewTypes";
import CustomNode from "./CustomNode";
import { nodeHeight, nodeWidth } from "../../utils";
import SelfConnectingEdge from "./SelfConnectingEdge";

const layoutConnectedNodes = (
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeWidth / 20,
    ranksep: 50,
  });

  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  // find max value on both axis to make consistent layout of disconnected nodes
  let maxX = 0,
    maxY = 0;
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    maxX = Math.max(maxX, nodeWithPosition.x + nodeWidth);
    maxY = Math.max(maxY, nodeWithPosition.y + nodeHeight);
    node.sourcePosition = direction === "TB" ? Position.Bottom : Position.Right;
    node.targetPosition = direction === "TB" ? Position.Top : Position.Left;
  });

  return { nodes, edges, maxX, maxY };
};

const layoutDisconnectedNodes = (
  nodes: Node[],
  maxX: number,
  maxY: number
): Node[] => {
  let currentX = 0;
  let currentY = maxY + 100;

  return nodes.map((node) => {
    // Wrap to new row if node would overflow maxX
    if (currentX + nodeWidth > maxX) {
      currentX = 0;
      currentY += nodeHeight + 10;
    }

    const positionedNode = {
      ...node,
      position: {
        x: currentX,
        y: currentY,
      },
    };

    currentX += nodeWidth + 10;

    return positionedNode;
  });
};

const TreeGraph: React.FC<{ treeData: TreeData }> = ({ treeData }) => {
  const [direction, setDirection] = useState<"TB" | "LR">("TB");
  const [edgeType, setEdgeType] = useState<"step" | "bezier">("step");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const {  fitView } = useReactFlow();

  const bringToFront = (nodeId: string) => {
    setNodes((nds) => {
      const targetNode = nds.find((n) => n.id === nodeId);
      if (!targetNode) return nds;
      return [...nds.filter((n) => n.id !== nodeId), targetNode];
    });
  };

  function formatRawDataAndSetLayout() {
    const nodeData = treeData?.prod_machine_map;
    if (!nodeData?.length) return;

    const rawNodes: Node[] = nodeData.map((machine) => {
      const isBypass = treeData.bypass_list.includes(machine.machine_id);
      const isNotAllowed = treeData.not_allowed_list.includes(
        machine.machine_id
      );
      return {
        id: String(machine.machine_id),
        data: {
          isBypass,
          isNotAllowed,
          name: machine.name,
          stationNumber: machine.station_number,
          inputStations: machine.input_stations,
          bringToFront,
        },
        position: { x: 0, y: 0 },
        draggable: true,
        type: "custom",
      };
    });

    const rawEdges: Edge[] = nodeData.flatMap((machine) =>
      machine.input_stations
        .filter(
          (inputId) =>
            !!nodeData.find((machine) => machine.machine_id === inputId)
        )
        .map((inputId) => ({
          id: `${inputId}-${machine.machine_id}`,
          source: String(inputId),
          target: String(machine.machine_id),
          style: { strokeWidth: 1 },
          type: inputId === machine.machine_id ? "selfconnecting" : edgeType,
          data: { direction },
        }))
    );

    const connectedNodeIds = new Set(
      rawEdges.flatMap((e) => [e.source, e.target])
    );
    const disconnectedNodes = rawNodes.filter(
      (n) => !connectedNodeIds.has(n.id)
    );
    const connectedNodes = rawNodes.filter((n) => connectedNodeIds.has(n.id));
    const layoutedConnectedNodes = layoutConnectedNodes(
      connectedNodes,
      rawEdges,
      direction
    );
    const layoutedDisconnectedNodes = layoutDisconnectedNodes(
      disconnectedNodes,
      layoutedConnectedNodes.maxX,
      layoutedConnectedNodes.maxY
    );

    setNodes([...layoutedDisconnectedNodes, ...layoutedConnectedNodes.nodes]);
    setEdges(layoutedConnectedNodes.edges);
  }

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    setNodes((nds) => {
      const targetNode = nds.find((n) => n.id === node.id);
      if (!targetNode) return nds;
      const updatedNode = {
        ...targetNode,
        selected: targetNode.id === node.id,
      };
      return [...nds.filter((n) => n.id !== node.id), updatedNode];
    });

    // focus and zoom clicked node
    fitView({ nodes: [node], duration: 300, maxZoom: 2 });
  };

  useEffect(() => {
    formatRawDataAndSetLayout();
    setTimeout(() => fitView({ duration: 300 }), 10);
  }, [direction, edgeType]);

  useEffect(() => {
    const focus = () => fitView({ duration: 300 });
    window.addEventListener("resize", focus);
    return () => window.removeEventListener("resize", focus);
  }, []);

  return (
    treeData && (
      <Box flexGrow={1} mt={2} border={"1px solid gainsboro"} borderRadius={5}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={{ selfconnecting: SelfConnectingEdge }}
          nodeTypes={{ custom: CustomNode }}
          onNodeClick={onNodeClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          minZoom={0.1}
        >
          <Panel position="top-left">
            <Stack
              alignItems={"center"}
              direction={{ sm: "row", xs: "column" }}
              bgcolor={"white"}
              borderRadius={3}
              p={0.5}
              border={"1px solid gainsboro"}
            >
              <Stack direction={"row"} alignItems={"center"} px={1.5}>
                Left-Right
                <Switch
                  checked={direction === "TB"}
                  onChange={(e) => setDirection(e.target.checked ? "TB" : "LR")}
                />
                Top-Bottom
              </Stack>
              <Stack
                direction={"row"}
                alignItems={"center"}
                px={1.5}
                borderLeft={{ sm: "1px solid gainsboro" }}
              >
                Bezier
                <Switch
                  checked={edgeType === "step"}
                  onChange={(e) =>
                    setEdgeType(e.target.checked ? "step" : "bezier")
                  }
                />
                Step
              </Stack>
            </Stack>
          </Panel>
          <Controls />
          <Background />
        </ReactFlow>
      </Box>
    )
  );
};

export default TreeGraph;
