import { useState, useMemo } from "react";
import { Column, DataType, Id, Task } from "../types";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { DeleteTwoTone, ReconciliationTwoTone } from "@ant-design/icons";
import { setLocalStorageData } from "../helpers/storage";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  updateTask: (id: Id, content: string, personal: DataType | null) => void;
  deleteTask: (id: Id) => void;
  tasks: Task[];
  handleSelectPerson: (item: DataType, task: Task) => void;
}

function ColumnContainer(props: Props) {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
    handleSelectPerson,
  } = props;

  const [edit, setEdit] = useState(false);

  const tasksId = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: edit,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBgColor opacity-40 border-4 border-red-700 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBgColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col shadow-lg my-8"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEdit(true);
        }}
        className="bg-mainBgColor text-md h-[60px] cursor-grab rounded-lg p-3 font-bold border-columnBgColor border-4 flex items-center justify-between"
      >
        {!edit && column.title}
        {edit && (
          <input
            className="bg-columnBgColor rounded-lg outline-none px-2"
            value={column.title}
            onChange={(e) => updateColumn(column.id, e.target.value)}
            autoFocus
            onBlur={() => setEdit(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEdit(false);
            }}
          />
        )}

        <button
          onClick={() => deleteColumn(column.id)}
          className="flex justify-center items-center stroke-textColor bg-columnBgColor p-2 rounded-full opacity-60 hover:opacity-100"
        >
          <DeleteTwoTone />
        </button>
      </div>

      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksId}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
              handleSelectPerson={handleSelectPerson}
            />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={() => {
          createTask(column.id);
          setLocalStorageData("selectedUserData", null);
        }}
        className="flex items-center gap-2 border-t-2 border-textColor rounded-lg p-4 shadow-inner hover:bg-hoverColor hover:text-white active:bg-columnBgColor active:text-black"
      >
        <ReconciliationTwoTone className="text-2xl" />
        Add Task
      </button>
    </div>
  );
}

export default ColumnContainer;
