import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Badge, Card, Empty } from "antd";
import { ITables } from "../types/tables";
import { DeleteOutlined } from "@ant-design/icons";

// Define the item type for DnD
const ItemTypes = {
  TABLE: "table",
};

interface TablePosition {
  x: number;
  y: number;
}

interface TableSize {
  width: number;
  height: number;
}

interface DraggableTableProps {
  id: string;
  table: ITables | null;
  index: number;
  isEditMode: boolean;
  position: TablePosition;
  size: TableSize;
  onMove: (id: string, position: TablePosition) => void;
  onResize: (id: string, size: TableSize) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
  selected: boolean;
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

const takeMaxFour = (arr: ITables["products"]) =>
  arr?.slice(0, Math.min(4, arr.length)) || [];
const totalAmount = (arr: ITables["products"]) =>
  arr?.reduce((sum, item) => sum + item.quantity * item.product.price, 0) || 0;

const DraggableTable: React.FC<DraggableTableProps> = ({
  id,
  table,
  index,
  isEditMode,
  position,
  size,
  onMove,
  onResize,
  onDelete,
  onClick,
  selected,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Track resize state with refs to avoid re-renders
  const resizeRef = useRef({
    isResizing: false,
    direction: "",
    startPoint: { x: 0, y: 0 },
    startSize: { ...size },
    currentSize: { ...size },
  });

  // Use a single state for current size
  const [currentSize, setCurrentSize] = useState(size);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!isEditMode) return;

    e.stopPropagation();
    e.preventDefault();

    // Set resize state in ref
    resizeRef.current = {
      isResizing: true,
      direction,
      startPoint: { x: e.clientX, y: e.clientY },
      startSize: { ...currentSize },
      currentSize: { ...currentSize },
    };

    // Add document event listeners
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  // Handle resize
  const handleResize = (e: MouseEvent) => {
    if (!resizeRef.current.isResizing) return;

    e.preventDefault();

    const { direction, startPoint, startSize } = resizeRef.current;

    const deltaX = e.clientX - startPoint.x;
    const deltaY = e.clientY - startPoint.y;

    let newWidth = startSize.width;
    let newHeight = startSize.height;

    // Adjust width and height based on resize direction
    if (direction.includes("right")) {
      newWidth = Math.max(MIN_WIDTH, startSize.width + deltaX);
    }

    if (direction.includes("bottom")) {
      newHeight = Math.max(MIN_HEIGHT, startSize.height + deltaY);
    }

    // Store the current size in ref for immediate access
    resizeRef.current.currentSize = { width: newWidth, height: newHeight };
    // Update local size for visual feedback
    setCurrentSize({ width: newWidth, height: newHeight });
  };

  // Handle resize end
  const handleResizeEnd = () => {
    if (!resizeRef.current.isResizing) return;

    // Use the final size from ref to ensure we have the latest values
    const finalSize = resizeRef.current.currentSize || currentSize;
    onResize(id, finalSize);

    // Reset resize state
    resizeRef.current = {
      isResizing: false,
      direction: "",
      startPoint: { x: 0, y: 0 },
      startSize: finalSize,
      currentSize: finalSize,
    };

    // Remove document event listeners
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  // Clean up event listeners when component unmounts
  React.useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);

      // If component unmounts during resize, save the final size from ref
      if (resizeRef.current.isResizing && resizeRef.current.currentSize) {
        onResize(id, resizeRef.current.currentSize);
      }
    };
  }, [id, onResize]);

  // Update current size when props change
  React.useEffect(() => {
    if (!resizeRef.current.isResizing) {
      setCurrentSize(size);
    }
  }, [size]);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TABLE,
    item: { id, originalPosition: position },
    canDrag: isEditMode && !resizeRef.current.isResizing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    options: {
      dropEffect: "move",
    },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.TABLE,
    hover: (_, monitor) => {
      if (!ref.current || !isEditMode || resizeRef.current.isResizing) {
        return;
      }

      // Get the drop position
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get middle
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Get pointer position
      const clientOffset = monitor.getClientOffset();

      if (clientOffset) {
        // Calculate the hover position
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse position is outside of the middle area
        if (
          Math.abs(hoverClientX - hoverMiddleX) > 20 ||
          Math.abs(hoverClientY - hoverMiddleY) > 20
        ) {
          const delta = {
            x: clientOffset.x - (hoverBoundingRect.left + hoverMiddleX),
            y: clientOffset.y - (hoverBoundingRect.top + hoverMiddleY),
          };

          // Update the position
          const newPosition = {
            x: position.x + delta.x,
            y: position.y + delta.y,
          };

          // Move item using ID
          onMove(id, newPosition);
        }
      }
    },
  });

  // Initialize drag ref
  drag(drop(ref));

  const opacity = isDragging ? 0 : 1;
  const cursor =
    isEditMode && !resizeRef.current.isResizing ? "move" : "pointer";

  return (
    <div
      ref={ref}
      className="draggable-table"
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity,
        cursor,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
        zIndex: isDragging ? 100 : resizeRef.current.isResizing ? 101 : 1,
      }}
    >
      <Card
        style={{
          background: selected ? "#e6f4ff" : "none",
          borderRadius: 10,
          width: "100%",
          height: "100%",
          position: "relative",
          boxShadow: "rgba(99, 99, 99, 0.1) 0px 2px 8px 0px",
        }}
        bordered={false}
        onClick={onClick}
        bodyStyle={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "12px",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>
            {index + 1 < 10 ? "0" : ""}
            {index + 1}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Badge color={!table ? "#30d372" : "#f6da48"} />
            {isEditMode && (
              <DeleteOutlined
                style={{ marginLeft: 10, color: "red", fontSize: 16 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              />
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          {table ? (
            <div style={{ height: "calc(100% - 40px)" }} className="ellipsis">
              {takeMaxFour(table.products).map((item) => (
                <div key={item.id} style={{ opacity: "0.5" }}>
                  {item.quantity} x {item.product.name}
                </div>
              ))}
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="E lirë" />
          )}
        </div>

        {table ? (
          <div
            style={{
              fontWeight: "bold",
              opacity: "0.5",
              fontSize: "1.5em",
              textAlign: "center",
              marginTop: "auto",
            }}
          >
            {totalAmount(table.products)} Den
          </div>
        ) : null}

        {/* Resize handles - more visible and easier to grab */}
        {isEditMode && (
          <>
            <div
              className="resize-handle resize-handle-corner"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "24px",
                height: "24px",
                cursor: "nwse-resize",
                backgroundColor: "rgba(24, 144, 255, 0.6)",
                border: "2px solid #1677ff",
                borderRadius: "4px",
                opacity: 1,
              }}
              onMouseDown={(e) => handleResizeStart(e, "right-bottom")}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default DraggableTable;
