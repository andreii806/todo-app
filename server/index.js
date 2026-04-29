const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/**
 * PostgreSQL connection
 */
const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/todoapp",
});

/**
 * Helpers
 */
const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

function calculateStreak(dates) {
  if (!Array.isArray(dates) || dates.length === 0) return 0;

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

/**
 * GET all tasks
 */
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * CREATE task
 */
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks (title, created_at, completed, completed_dates, streak)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, getToday(), false, [], 0]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * COMPLETE task + update streak
 */
app.put("/tasks/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = result.rows[0];
    const today = getToday();

    let dates = Array.isArray(task.completed_dates)
      ? task.completed_dates
      : [];

    if (!dates.includes(today)) {
      dates.push(today);
    }

    const streak = calculateStreak(dates);

    const updated = await pool.query(
      `UPDATE tasks
       SET completed = true,
           completed_dates = $1,
           streak = $2
       WHERE id = $3
       RETURNING *`,
      [dates, streak, id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE task
 */
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
