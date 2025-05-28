import * as db from "./db.mjs";
import crypto from "crypto";

export const allTodos = (req, res) => {
  try {
    const userId = req.user.id;
    const allTodos = db.getAllTodos.all({ $user_id: userId });

    return res.status(200).json(
      allTodos.map((todo) => ({
        id: todo.id,
        text: todo.text,
        done: Boolean(todo.done),
      }))
    );
  } catch (error) {
    console.error("Error fetching todos:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createTodo = (req, res) => {
  try {
    const text = req.body.text?.trim();

    if (!text || text.length === 0) {
      return res.status(400).json({ error: "Text is required" });
    }

    const newId = crypto.randomUUID();
    const userId = req.user.id;

    const newTodo = db.insertTodo.get({ $id: newId, $text: text, $user_id: userId });

    return res.status(200).json({
      id: newTodo.id,
      text: newTodo.text,
      done: Boolean(newTodo.done),
    });
  } catch (error) {
    console.error("Error creating todo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTodo = (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const todo = db.getTodo.get({ $id: id, $user_id: userId });

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

    const updatedTodo = db.updateTodo.get({
      $id: id,
      $text: newText,
      $done: newDone,
      $user_id: userId,
    });

    return res.status(200).json({
      id: updatedTodo.id,
      text: updatedTodo.text,
      done: Boolean(updatedTodo.done),
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
