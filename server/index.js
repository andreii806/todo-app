const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let tasks = [];

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  const newTask = {
    id: Date.now(),
    title,
    completed: false,
    createdAt: getToday(),
    completedDates: [],
    streak: 0,
  };

  tasks.push(newTask);

  res.json(newTask);
});

app.put("/tasks/:id/complete", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const today = getToday();

  task.completed = true;

  if (!task.completedDates.includes(today)) {
    task.completedDates.push(today);
  }

  task.streak = calculateStreak(task.completedDates);

  res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  tasks = tasks.filter(t => t.id != req.params.id);

  res.json({ message: "Task deleted" });
});

function calculateStreak(dates) {
  if (dates.length === 0) return 0;

  const sorted = [...dates].sort();

  let streak = 1;

  for (let i = sorted.length - 1; i > 0; i--) {
    const current = new Date(sorted[i]);
    const previous = new Date(sorted[i - 1]);

    const diff = (current - previous) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

