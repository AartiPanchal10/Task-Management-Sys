import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Cards from '../components/home/cards';
import InputData from '../components/home/inputData';

const AllTasks = () => {
  const [inputDiv, setInputDiv] = useState("hidden");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedData, setUpdatedData] = useState({ id: "", title: "", description: "", assignedTo: "", dueDate: "" });
  const location = useLocation();

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/v2/get-all-tasks", { headers });
      const allTasks = response.data.allTasks || response.data.data;
      const userId = localStorage.getItem('id');

      let filteredTasks;
      if (location.pathname.startsWith('/myTasks')) {
        filteredTasks = allTasks.filter(task => task.assignedTo === userId);
      } else if (location.pathname.startsWith('/otherUserTasks')) {
        filteredTasks = allTasks.filter(task => task.assignedBy === userId && task.assignedTo !== userId);
      } else {
        filteredTasks = allTasks;
      }

      setData(filteredTasks);
      setError(null);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to fetch tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("id") && localStorage.getItem("token")) {
      fetchTasks();
    } else {
      setError("User not authenticated. Please log in.");
      setLoading(false);
    }
  }, [location.pathname]);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div>
        <div>
        </div>
        {data && (
          <Cards home={"true"} setInputDiv={setInputDiv} data={data} setUpdatedData={setUpdatedData} fetchTasks={fetchTasks} />
        )}
      </div>
      <InputData InputDiv={inputDiv} setInputDiv={setInputDiv} updatedData={updatedData} setUpdatedData={setUpdatedData} fetchTasks={fetchTasks} />
    </>
  );
};

export default AllTasks;