import { useState } from "react";
import { DataType, Id, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, Modal, Tooltip } from "antd";
import { CloseCircleTwoTone } from "@ant-design/icons";
import { useEffect } from "react";
import { Button, List, Skeleton } from "antd";

const count = 3;
const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (
    id: Id,
    content: string,
    personal: DataType | null | undefined | string
  ) => void;
  handleSelectPerson: (item: DataType, task: Task) => void;
}

function TaskCard({ task, deleteTask, updateTask, handleSelectPerson }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [list, setList] = useState<DataType[]>([]);

  console.log(task);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  useEffect(() => {
    fetch(fakeDataUrl)
      .then((res) => res.json())
      .then((res) => {
        setInitLoading(false);
        setData(res.results);
        setList(res.results);
      });
  }, []);

  const onLoadMore = () => {
    setLoading(true);
    setList(
      data.concat(
        [...new Array(count)].map(() => ({
          loading: true,
          name: {},
          picture: {},
        }))
      )
    );
    fetch(fakeDataUrl)
      .then((res) => res.json())
      .then((res) => {
        const newData = data.concat(res.results);
        setData(newData);
        setList(newData);
        setLoading(false);
        window.dispatchEvent(new Event("resize"));
      });
  };
  const loadMore =
    !initLoading && !loading ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          lineHeight: "32px",
        }}
      >
        <Button onClick={onLoadMore}>loading more</Button>
      </div>
    ) : null;

  const taskContainerClass =
    "bg-mainBgColor p-2 h-[100px] min-h-[100px] flex items-center text-left rounded-lg shadow-lg cursor-grab relative";

  const renderEditMode = () => (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${taskContainerClass} hover:ring-2 hover:ring-inset hover:ring-hoverColor`}
    >
      <textarea
        className="h-[90%] w-full resize-none border-none rounded-lg bg-transparent text-textColor focus:outline-none"
        value={task.content}
        autoFocus
        placeholder="Task content here"
        onBlur={toggleEditMode}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.shiftKey) {
            toggleEditMode();
          }
        }}
        onChange={(e) =>
          updateTask(
            task.id,
            e.target.value,
            task?.personal?.name.first !== undefined
              ? task?.personal?.name.first
              : null
          )
        }
      ></textarea>
    </div>
  );

  const renderTaskView = () => (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      className={`${taskContainerClass} hover:ring-2 hover:ring-inset hover:ring-hoverColor`}
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>

      <div className="h-full flex items-end">
        {mouseIsOver && (
          <button
            onClick={() => deleteTask(task.id)}
            className="absolute top-0 stroke-textColor p-2 opacity-60 hover:opacity-100"
          >
            <CloseCircleTwoTone />
          </button>
        )}
        <Tooltip
          placement="right"
          title={`${
            task?.personal?.name.first
              ? `${task?.personal?.name.first} ${task?.personal?.name.last}`
              : "Add Person"
          }`}
        >
          <Avatar
            onClick={showModal}
            className="cursor-pointer border-slate-500"
            src={task?.personal !== null && task?.personal?.picture.medium}
          />
        </Tooltip>
      </div>
    </div>
  );

  return (
    <>
      {isDragging ? (
        <div
          ref={setNodeRef}
          style={style}
          className={`${taskContainerClass} opacity-40 border-2 border-hoverColor`}
        />
      ) : editMode ? (
        renderEditMode()
      ) : (
        renderTaskView()
      )}

      <Modal
        title="Basic Modal"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          loadMore={loadMore}
          dataSource={list}
          renderItem={(item) => (
            <List.Item
              onClick={() => {
                handleSelectPerson(item, task);
                setIsModalOpen(false);
              }}
              actions={[
                <a key="list-loadmore-edit">edit</a>,
                <a key="list-loadmore-more">more</a>,
              ]}
              className="cursor-pointer"
            >
              <Skeleton avatar title={false} loading={item.loading} active>
                <List.Item.Meta
                  avatar={<Avatar src={item.picture.large} />}
                  title={
                    <span>{`${item.name?.first} ${item.name?.last}`}</span>
                  }
                  description="Application designer, is refined by Ant Team"
                />
              </Skeleton>
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}

export default TaskCard;
