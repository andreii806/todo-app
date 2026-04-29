import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
  fetch("http://localhost:5000/tasks")
    .then((res) => res.json())
    .then((data) => setTasks(data));
}, []);

const addTask = () => {
  fetch("http://localhost:5000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  })
    .then((res) => res.json())
    .then((newTask) => {
      setTasks([...tasks, newTask]);
      setTitle("");
    });
};
const completeTask = (id) => {
  fetch(`http://localhost:5000/tasks/${id}/complete`, {
    method: "PUT",
  })
    .then((res) => res.json())
    .then((updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    });
};

const deleteTask = (id) => {
  fetch(`http://localhost:5000/tasks/${id}`, {
    method: "DELETE",
  }).then(() => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  });
};

return (
  <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
    <h1>To-Do App</h1>

    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="New task..."
      style={{ padding: "8px", width: "70%" }}
    />

    <button onClick={addTask} style={{ padding: "8px" }}>
      Add
    </button>

    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title} — 🔥 {task.streak}

          <button
            onClick={() => completeTask(task.id)}
            disabled={task.completed}
          >
            {task.completed ? "Done ✅" : "Complete❓"}
          </button>

          <button onClick={() => deleteTask(task.id)}>
            Delete ❌
          </button>
        </li>
      ))}
    </ul>

  </div>
);
}
export default App;