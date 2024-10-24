import React, { useState, useEffect } from 'react';
import Cards from '../components/home/cards';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
 
const CompletedTasks = () => {
  const [Data, setData] = useState(); // State to store filtered tasks
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  const { tasks } = useOutletContext(); // Access tasks from Outlet context
  
  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get("http://localhost:3000/api/v2/get-complete-tasks", {
        headers,
      });
      // Filter completed tasks based on the provided tasks context
      const completedTasks = response.data.data.filter(task => tasks.some(t => t._id === task._id));
      setData(completedTasks);
    };
    fetch();
  }, [tasks]);
 
  return (
    <div>
      <Cards home={"false"} data={Data}/> {/* Pass filtered completed tasks to Cards component */}
    </div>
  );
}
 
export default CompletedTasks;
