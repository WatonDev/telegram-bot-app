import React, { useState } from "react";
import styled from "styled-components";

const TaskWrapper = styled.div`
  background: #1e1e1e;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
`;

const Button = styled.button`
  background: ${(props) => (props.done ? "#444" : "#007bff")};
  color: ${(props) => (props.done ? "#999" : "#fff")};
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: ${(props) => (props.done ? "not-allowed" : "pointer")};

  &:hover {
    background: ${(props) => (!props.done ? "#0056b3" : "#444")};
  }
`;

const TaskCard = ({ task, onComplete }) => {
  const [done, setDone] = useState(false);

  const handleClick = () => {
    if (!done) {
      setDone(true);
      setTimeout(() => {
        onComplete(task.id);
      }, 10000); // Odliczanie 10 sekund
    }
  };

  return (
    <TaskWrapper>
      <div>
        <p>{task.description}</p>
        <small>{task.points} Points</small>
      </div>
      <Button onClick={handleClick} done={done}>
        {done ? "Done" : "Go"}
      </Button>
    </TaskWrapper>
  );
};

export default TaskCard;