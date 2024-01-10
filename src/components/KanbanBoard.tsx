import { useState, useMemo, useEffect } from "react";
import { Column, DataType, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  getLocalStorageData,
  setLocalStorageData,
} from "../helpers/storage.js";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import { PlusCircleTwoTone } from "@ant-design/icons";

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(
    getLocalStorageData("columns") || []
  );
  const [selectedUserData, setSelectedUserData] = useState<DataType | null>(
    getLocalStorageData("selectedUserData") || null
  );
  const [tasks, setTasks] = useState<Task[]>(
    getLocalStorageData("tasks") || []
  );
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const columnsId = useMemo(
    () => columns.map((column) => column.id),
    [columns]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  useEffect(() => {
    const selectedUserData: DataType | null =
      getLocalStorageData("selectedUserData");
    setSelectedUserData(selectedUserData);
  }, []);

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
      personal: selectedUserData,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setLocalStorageData("tasks", updatedTasks);
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
    setLocalStorageData("selectedUserData", null);
  }

  function updateTask(
    id: Id,
    content: string,
    personal: DataType | null | undefined
  ) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content, personal };
    });

    setTasks(newTasks);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    const updatedColumns = [...columns, columnToAdd];

    setColumns(updatedColumns);

    setLocalStorageData("columns", updatedColumns);
  }

  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);

    setLocalStorageData("selectedUserData", null);
  }

  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((column) => {
      if (column.id !== id) return column;
      return { ...column, title };
    });

    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (column) => column.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (column) => column.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  function generateId() {
    return Math.floor(Math.random() * 10001);
  }

  useEffect(() => {
    setLocalStorageData("columns", columns);
  }, [columns]);

  useEffect(() => {
    setLocalStorageData("tasks", tasks);
  }, [tasks]);

  const handleSelectPerson = (item: DataType, task: Task) => {
    if (task.id) {
      const taskIndex = tasks.findIndex((t) => t.id === task.id);
      if (taskIndex !== -1) {
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = {
          ...task,
          personal: item,
        };
        setTasks(updatedTasks);
        setLocalStorageData("tasks", updatedTasks);
      }
      setLocalStorageData("selectedUserData", item);
    } else {
      console.log("Task ID is null.");
    }
  };

  return (
    <div className="bg-mainBgColor text-textColor h-full m-auto flex flex-col w-full items-center justify-center overflow-x-auto overflow-y-hidden px-10 py-5">
      <h1 className="text-3xl font-bold mt-4 underline">PROGRESS BOARD</h1>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                  handleSelectPerson={handleSelectPerson}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={createNewColumn}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBgColor border-4 border-columnBgColor p-4 hover:border-hoverColor flex items-center gap-2 my-8"
          >
            <PlusCircleTwoTone className="text-xl" />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                handleSelectPerson={handleSelectPerson}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                handleSelectPerson={handleSelectPerson}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
