import express from "express";
import cors from "cors";

import { getAllTodos, getTodo, insertTodo, updateTodo } from "./db.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello, World!");
});

app.get("/todos", (_req, res) => {
  const allTodos = getAllTodos.all();

  return res.status(200).json(
    allTodos.map((todo) => ({
      id: todo.id,
      text: todo.text,
      done: Boolean(todo.done),
    }))
  );
});

app.post("/todos", (req, res) => {
  const text = req.body.text ?? req.body.text.trim();

  if (!text || text.length === 0) {
    return res.status(400).json({ error: "Text is required" });
  }

  const newId = crypto.randomUUID();

  const newTodo = insertTodo.get({ $id: newId, $text: text });

  return res.status(200).json({
    id: newTodo.id,
    text: newTodo.text,
    done: Boolean(newTodo.done),
  });
});

app.put("/todos/:id", (req, res) => {
  const id = req.params.id;

  const todo = getTodo.get({ $id: id });

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const isTextUpdated = req.body.text !== undefined && req.body.text !== null;
  const isDoneUpdated = req.body.done !== undefined && req.body.done !== null;

  if (!isTextUpdated && !isDoneUpdated) {
    return res.status(400).json({ error: "Text or done is required" });
  }

  const newText = isTextUpdated ? req.body.text.trim() : todo.text;
  const newDone = isDoneUpdated ? Number(req.body.done) : todo.done;

  if (isTextUpdated && newText.length === 0) {
    return res.status(400).json({ error: "Text should not be empty" });
  }

  const updatedTodo = updateTodo.get({
    $id: id,
    $text: newText,
    $done: newDone,
  });

  return res.status(200).json({
    id: updatedTodo.id,
    text: updatedTodo.text,
    done: Boolean(updatedTodo.done),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
