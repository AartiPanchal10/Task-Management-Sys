import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cards from "../components/home/cards";
import { useOutletContext } from 'react-router-dom';
 
// Component for displaying incomplete tasks
const IncompletedTasks = () => {
  const [Data, setData] = useState(); // State for storing task data
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  const { tasks } = useOutletContext(); // Access tasks from Outlet context
 
  // Fetch incomplete tasks when the component mounts
  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get("http://localhost:3000/api/v2/get-incomplete-tasks", {
        headers,
      });
      // Filter incomplete tasks based on the provided tasks context
      const incompleteTasks = response.data.data.filter(task => tasks.some(t => t._id === task._id));
      setData(incompleteTasks);
    };
    fetch();
  }, [tasks]);
 
  return (
    <div>
      <Cards home={"false"} data={Data}/> {/* Render Cards component with task data */}
    </div>
  );
}
 
export default IncompletedTasks;
