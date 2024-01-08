import { ReactNode } from "react";

interface TodoContainerProps {
  children: ReactNode;
}

function ProgressBoardContainer({ children }: TodoContainerProps) {
  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="bg-white rounded shadow-md p-4">{children}</div>
    </div>
  );
}

export default ProgressBoardContainer;
