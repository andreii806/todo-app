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

return (
  <div style={{ padding: "20px" }}>
    <h1>To-Do App</h1>

    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="New task..."
    />

    <button onClick={addTask}>Add</button>

    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title} — 🔥 {task.streak}
        </li>
      ))}
    </ul>
  </div>
);
}
export default App;