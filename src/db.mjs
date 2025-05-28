import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync("todo.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

database.exec("PRAGMA foreign_keys = ON");
database.exec("PRAGMA journal_mode = WAL");
database.exec("PRAGMA synchronous = NORMAL");
database.exec("PRAGMA cache_size = 10000");

const createTodosTable = `CREATE TABLE IF NOT EXISTS TODOS (
  id TEXT NOT NULL PRIMARY KEY,
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT 0,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
)`;

const createUsersTable = `CREATE TABLE IF NOT EXISTS USERS (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
)`;

const insertSampleData = `INSERT INTO TODOS (id, text, done, user_id)
  SELECT * FROM (
    SELECT 'b1a8f3e2-7c4a-4f3b-9d6e-8f2d4c9a1b3e', 'Sample Todo 1', 0, 1
    UNION ALL
    SELECT 'd4e5c6f7-8a9b-4c2d-9e1f-7b3a6c8d5e4f', 'Sample Todo 2', 0, 1
    UNION ALL
    SELECT 'f9e8d7c6-5b4a-3f2e-1d9c-8a7b6e5c4f3d', 'Sample Todo 3', 0, 1
  ) AS new_data 
    WHERE NOT EXISTS (SELECT 1 FROM TODOS)
`;

database.exec(createUsersTable, (err) => {
  if (err) {
    console.error("Error creating table " + err.message);
  } else {
    console.log("Table created or already exists.");
  }
});

database.exec(createTodosTable, (err) => {
  if (err) {
    console.error("Error creating table " + err.message);
  } else {
    console.log("Table created or already exists.");
  }
});

database.exec(insertSampleData, (err) => {
  if (err) {
    console.error("Error inserting data on TODOS " + err.message);
  } else {
    console.log("Data inserted.");
  }
});


const insertUser = database.prepare(
  "INSERT INTO USERS (id, name, email, password) VALUES ($id, $name, $email, $password) RETURNING id, name, email"
);

const getUser = database.prepare(
  `SELECT id, name, email, password FROM USERS WHERE email = $email`
);

const insertTodo = database.prepare(
  "INSERT INTO TODOS (id, text, done, user_id) VALUES ($id, $text, 0, $user_id) RETURNING id, text, done"
);
const updateTodo = database.prepare(
  "UPDATE TODOS SET text = $text, done = $done WHERE id = $id and user_id = $user_id RETURNING id, text, done"
);
const getTodo = database.prepare(
  `SELECT id, text, done FROM TODOS WHERE id = $id AND user_id = $user_id`
);
const getAllTodos = database.prepare(`SELECT id, text, done FROM TODOS WHERE user_id = $user_id`);

export { database, insertTodo, updateTodo, getTodo, getAllTodos, insertUser, getUser };