import { useCallback, useEffect, useState } from "react";

// Third party imports
import { Results } from "delib-npm";

// React Flow imports
import ReactFlow, {
    Controls,
    useNodesState,
    useEdgesState,
    Panel,
    Position,
    Node,
    useReactFlow,
    ReactFlowInstance,
} from "reactflow";
import "./reactFlow.scss";
import "reactflow/dist/style.css";

// Helper functions
import {
    createInitialNodesAndEdges,
    getLayoutedElements,
} from "./customNodeCont";

// Custom components
import CustomNode from "./CustomNode";
import { useMapContext } from "../../../../../../functions/hooks/useMap";
import { getStatementFromDB } from "../../../../../../functions/db/statements/getStatement";
import { updateStatementParents } from "../../../../../../functions/db/statements/setStatments";

const nodeTypes = {
    custom: CustomNode,
};

interface Props {
    topResult: Results | undefined;
    getSubStatements: () => Promise<void>;
}

let counter = 1;

export default function StatementMap({
    topResult,
    getSubStatements,
}: Readonly<Props>) {
    // if (!topResult) return null;

    const { getIntersectingNodes } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [tempEdges, setTempEdges] = useState(edges);
    const [rfInstance, setRfInstance] = useState<null | ReactFlowInstance<
        any,
        any
    >>(null);

    const { mapContext, setMapContext } = useMapContext();

    useEffect(() => {
        console.log("test", counter);

        counter++;

        const { nodes: createdNodes, edges: createdEdges } =
            createInitialNodesAndEdges(topResult);

        console.log(createdNodes, createdEdges);

        const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(
                createdNodes,
                createdEdges,
                mapContext.nodeHeight,
                mapContext.nodeWidth,
                mapContext.direction,
            );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setTempEdges(layoutedEdges);
    }, [topResult]);

    const onRestore = useCallback(() => {
        const restoreFlow = async () => {
            const getFlow = localStorage.getItem("flowKey");
            if (!getFlow) return;

            const flow = JSON.parse(getFlow);

            if (flow) {
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);
            }
        };

        restoreFlow();
    }, [setNodes]);

    const onLayout = useCallback(
        (direction: "TB" | "LR") => {
            const width = direction === "TB" ? 50 : 90;
            const height = direction === "TB" ? 50 : 30;

            setMapContext((prev) => ({
                ...prev,
                targetPosition:
                    direction === "TB" ? Position.Top : Position.Left,
                sourcePosition:
                    direction === "TB" ? Position.Bottom : Position.Right,
                nodeWidth: width,
                nodeHeight: height,
                direction,
            }));

            const { nodes: layoutedNodes, edges: layoutedEdges } =
                getLayoutedElements(nodes, edges, height, width, direction);

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        },
        [nodes, edges],
    );

    const onNodeDragStop = async (
        _: React.MouseEvent<Element, MouseEvent>,
        node: Node,
    ) => {
        console.log(node.id);

        const intersections = getIntersectingNodes(node).map((n) => n.id);

        if (intersections.length === 0) return setEdges(tempEdges);

        // Pop up to ask user if he is sure he wants to move the statement here
        // setMapContext((prev) => ({
        //     ...prev,
        //     moveStatementModal: true,
        // }));

        // Get both statements from DB, and update the dragged statement parents
        const [draggedStatement, newDraggedStatementParent] = await Promise.all(
            [getStatementFromDB(node.id), getStatementFromDB(intersections[0])],
        );

        if (!draggedStatement || !newDraggedStatementParent) return;

        await updateStatementParents(
            draggedStatement,
            newDraggedStatementParent,
        );

        // window.document.location.reload();

        await getSubStatements();

        onLayout(mapContext.direction);
    };

    const onNodeDrag = useCallback(
        (_: React.MouseEvent<Element, MouseEvent>, node: Node) => {
            setEdges([]);

            const intersections = getIntersectingNodes(node).find((n) => n.id);

            setNodes((ns) =>
                ns.map((n) => ({
                    ...n,
                    className: intersections?.id === n.id ? "highlight" : "",
                })),
            );
        },
        [],
    );

    const onSave = useCallback(() => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            localStorage.setItem("flowKey", JSON.stringify(flow));
        }
    }, [rfInstance]);

    // TODO: Create an option to save the current state of the map and return to it if changes were made...

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            style={{ height: `100vh` }}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onInit={(reactFlowInstance) => {
                setRfInstance(reactFlowInstance);
                const flow = reactFlowInstance.toObject();
                localStorage.setItem("flowKey", JSON.stringify(flow));
            }}
        >
            <Controls />
            <Panel position="bottom-right" style={{ marginBottom: "2rem" }}>
                <div className="btns">
                    <button
                        className="btn btn--agree"
                        onClick={() => onLayout("TB")}
                    >
                        vertical layout
                    </button>
                    <button
                        className="btn btn--agree"
                        onClick={() => onLayout("LR")}
                    >
                        horizontal layout
                    </button>
                    <button onClick={onRestore} className="btn btn--agree">
                        Restore
                    </button>
                    <button onClick={onSave} className="btn btn--agree">
                        Save
                    </button>
                </div>
            </Panel>
        </ReactFlow>
    );
}
