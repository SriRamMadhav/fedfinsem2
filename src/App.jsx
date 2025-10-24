import React, { useState, useEffect } from "react";
import { getTasks, addTask, deleteTask, updateTask } from "./api";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (err) {
      // If backend isn't available yet, keep tasks empty and log error
      console.error("Could not fetch tasks:", err.message || err);
      setTasks([]);
    }
  };

  const handleAddTask = async (title) => {
    const newTask = { title, completed: false };
    try {
      const response = await addTask(newTask);
      setTasks((prev) => [...prev, response.data]);
    } catch (err) {
      // If backend not available, optimistically add with a temporary id
      console.error("Could not add task via API, adding locally:", err.message || err);
      const tempTask = { id: Date.now(), ...newTask };
      setTasks((prev) => [...prev, tempTask]);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Could not delete task via API, removing locally:", err.message || err);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
  };

  const toggleTaskCompletion = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updatedTask = { ...task, completed: !task.completed };
    try {
      await updateTask(id, updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      console.error("Could not update task via API, updating locally:", err.message || err);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    }
  };

  return (
    <div className="App">
      <h1>To-Do List</h1>
      <TaskForm onAddTask={handleAddTask} />
      {tasks.length === 0 ? (
        <p>No tasks yet! Add your first one below</p>
      ) : (
        <TaskList tasks={tasks} onDelete={handleDeleteTask} onToggle={toggleTaskCompletion} />
      )}
    </div>
  );
}

export default App;
