import React, { useState, useCallback, useEffect } from "react";
import { Button, Tooltip } from "antd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { EditOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import DraggableTable from "./DraggableTable";
import { ITables } from "../types/tables";
import { isTouchDevice } from "../utils/isTouchDevice";

interface TableCanvasProps {
  selectedTable: number;
  onSelect: (index: number) => void;
  onSaveLayout: (layout: TableLayout[]) => void;
}

export interface TableLayout {
  id: string; // Unique ID
  index: number;
  position: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
}

interface CanvasTable {
  id: string; // Unique ID
  originalIndex: number; // Original index from source data
  table: ITables | null;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 210;

// Generate a unique ID
const generateId = () => {
  return "table_" + Math.random().toString(36).substr(2, 9);
};

// Local storage key
const LAYOUT_STORAGE_KEY = "cafebujo_table_layout";

const TableCanvas: React.FC<TableCanvasProps> = ({
  selectedTable,
  onSelect,
  onSaveLayout,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [canvasTables, setCanvasTables] = useState<CanvasTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Load tables from localStorage - don't create default layout
  useEffect(() => {
    try {
      // Try to load saved layout from localStorage
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);

      if (savedLayout) {
        const savedTables = JSON.parse(savedLayout) as CanvasTable[];

        if (savedTables.length > 0) {
          console.log("Loaded saved layout", savedTables);
          setCanvasTables(savedTables);

          // Set selected table ID based on selected index
          const selectedCanvasTable = savedTables.find(
            (t) => t.originalIndex === selectedTable
          );
          if (selectedCanvasTable) {
            setSelectedTableId(selectedCanvasTable.id);
          }
        } else {
          // Start with empty canvas if saved layout is empty
          setCanvasTables([]);
        }
      } else {
        // Start with empty canvas if no saved layout
        setCanvasTables([]);
      }
    } catch (error) {
      console.error("Error loading saved layout:", error);
      // Start with empty canvas on error
      setCanvasTables([]);
    }
  }, [selectedTable]);

  // Update selected table ID when selected table changes
  useEffect(() => {
    const selectedCanvasTable = canvasTables.find(
      (t) => t.originalIndex === selectedTable
    );
    if (selectedCanvasTable) {
      setSelectedTableId(selectedCanvasTable.id);
    }
  }, [selectedTable, canvasTables]);

  // Move a table
  const moveTable = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setCanvasTables((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, position } : item
        );
        // Save to localStorage after update
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // Resize a table
  const resizeTable = useCallback(
    (id: string, size: { width: number; height: number }) => {
      setCanvasTables((prev) => {
        console.log("size", size);
        const updated = prev.map((item) =>
          item.id === id ? { ...item, size } : item
        );
        // Save to localStorage after update
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // Delete a table by ID
  const deleteTable = useCallback(
    (id: string) => {
      // Find the table before deleting it
      const tableToDelete = canvasTables.find((t) => t.id === id);
      if (!tableToDelete) return;

      // Remove the table from the array
      setCanvasTables((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        // Save to localStorage after update
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      // If it was the selected table, select another one
      if (selectedTableId === id) {
        // Find another table to select
        const remainingTables = canvasTables.filter((t) => t.id !== id);
        if (remainingTables.length > 0) {
          const newSelectedTable = remainingTables[0];
          setSelectedTableId(newSelectedTable.id);
          onSelect(newSelectedTable.originalIndex);
        } else {
          setSelectedTableId(null);
          onSelect(0);
        }
      }
    },
    [canvasTables, selectedTableId, onSelect]
  );

  // Add a new table
  const addTable = useCallback(() => {
    // Find the next position (at the end of the current layout)
    const tableCount = canvasTables.length;
    const row = Math.floor(tableCount / 4);
    const col = tableCount % 4;

    // Create a new empty table with a unique ID
    const newTable: CanvasTable = {
      id: generateId(),
      originalIndex: -1, // Indicates this is a new table not in original data
      table: null,
      position: {
        x: col * 320 + 20,
        y: row * 230 + 20,
      },
      size: {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      },
    };

    setCanvasTables((prev) => {
      const updated = [...prev, newTable];
      // Save to localStorage after update
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [canvasTables.length]);

  // Save the layout
  const saveLayout = () => {
    // Save to localStorage
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(canvasTables));

    // Convert to TableLayout format for the callback
    const layouts: TableLayout[] = canvasTables.map((item) => ({
      id: item.id,
      index: item.originalIndex !== -1 ? item.originalIndex : -1,
      position: item.position,
      size: item.size,
    }));

    onSaveLayout(layouts);
    setIsEditMode(false);
  };

  // Handle table selection - we need to map from tableId to original index
  const handleTableClick = (tableId: string) => {
    const clickedTable = canvasTables.find((t) => t.id === tableId);
    if (clickedTable && clickedTable.originalIndex !== -1) {
      setSelectedTableId(tableId);
      onSelect(clickedTable.originalIndex);
    }
  };

  // Determine which backend to use based on device
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Edit mode controls */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        {isEditMode ? (
          <>
            <Tooltip title="Add Table">
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={addTable}
                style={{ marginRight: 8 }}
              />
            </Tooltip>
            <Tooltip title="Save Layout">
              <Button
                type="primary"
                shape="circle"
                icon={<SaveOutlined />}
                onClick={saveLayout}
              />
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Edit Layout">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => setIsEditMode(true)}
            />
          </Tooltip>
        )}
      </div>

      {/* Canvas with draggable tables */}
      <DndProvider backend={backend}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "calc(100vh - 130px)",
            overflow: "auto",
            background: isEditMode ? "#f5f5f5" : "transparent",
            border: isEditMode ? "1px dashed #ccc" : "none",
            transition: "all 0.3s",
            padding: "10px",
          }}
        >
          {canvasTables.map((item) => (
            <DraggableTable
              key={item.id}
              id={item.id}
              table={item.table}
              index={item.originalIndex}
              isEditMode={isEditMode}
              position={item.position}
              size={item.size}
              onMove={moveTable}
              onResize={resizeTable}
              onDelete={deleteTable}
              onClick={() => handleTableClick(item.id)}
              selected={item.id === selectedTableId}
            />
          ))}
        </div>
      </DndProvider>
    </div>
  );
};

export default TableCanvas;
