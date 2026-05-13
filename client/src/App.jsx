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
    .then(() => {
        fetch("http://localhost:5000/tasks")
        .then((res) => res.json())
        .then((data) => setTasks(data));
    });
};

const deleteTask = (id) => {
  fetch(`http://localhost:5000/tasks/${id}`, {
    method: "DELETE",
  }).then(() => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  });
};

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const formatDate = (date) => {
  if (!date) return null;

  const d = new Date(date);
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1). padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
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
            disabled={
              formatDate(task.last_completed_date) === getToday()
            }
            style={{
              marginLeft: "10px",
              padding: "6px 10px",
              border: "none",
              borderRadius: "6px",

              cursor:
                formatDate(task.last_completed_date) === getToday()
                  ? "not-allowed"
                  : "pointer",

              backgroundColor:
                formatDate(task.last_completed_date) === getToday()
                  ? "#999"
                  : "#ff9800",

              color: "white",

              opacity:
                formatDate(task.last_completed_date) === getToday()
                  ? 0.6
                  : 1,
            }}
          >
            {formatDate(task.last_completed_date) === getToday()
              ? "Completed ✅"
              : "Complete 🔥"}
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