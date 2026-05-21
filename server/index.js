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
  return new Date().toLocaleDateString("en-CA", {timeZone: "Europe/Bucharest",});
};

/**
 * GET all tasks
 */
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );

     return res.json(result.rows);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
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
    let streak = task.streak || 0;
    const last =
      task.last_completed_date
       ? new Date(task.last_completed_date)
        .toLocaleDateString("en-CA", {
          timeZone: "Europe/Bucharest",
        })
    : null;
    if (!last){
      streak = 1;
    }
    else if (last === today) return res.json(task);
    else {
      const lastDate = new Date(last);
      const todayDate = new Date(today);

      const diffDays = Math.round(
        (todayDate - lastDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1){
        streak += 1;
      }
      else{
        streak = 1;
      }
    }

    const updated = await pool.query(
      `UPDATE tasks
       SET completed = true,
           streak = $1,
           last_completed_date = $2
       WHERE id = $3
       RETURNING *`,
      [streak, today, id]
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
