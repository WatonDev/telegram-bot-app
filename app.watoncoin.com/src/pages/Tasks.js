import React from "react";
import MenuBar from "../components/MenuBar";
import { tasks } from "../data/tasksConfig";

const Tasks = () => {
  const handleTaskCompletion = (task) => {
    window.open(task.link, "_blank"); // Otwiera link
  };

  return (
    <div className="page-container">
      <h1>Tasks</h1>
      {tasks.map((task) => (
        <div key={task.id} className="card">
          <h3>{task.name}</h3>
          <p>Points: {task.points}</p>
          <button
            className="button-primary"
            onClick={() => handleTaskCompletion(task)}
          >
            Start Task
          </button>
        </div>
      ))}
      <MenuBar />
    </div>
  );
};

export default Tasks;
