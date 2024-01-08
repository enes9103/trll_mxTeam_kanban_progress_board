import KanbanBoard from "./components/KanbanBoard";
import TodoContainer from "./components/ProgressBoardContainer";

function App() {
  return (
    <TodoContainer>
      <KanbanBoard />
    </TodoContainer>
  );
}

export default App;
