import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { VscTasklist } from "react-icons/vsc";
import { FaCheckDouble } from 'react-icons/fa';
import { TbNotebookOff } from 'react-icons/tb';
import axios from 'axios';

const OtherUserTasks = () => {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const headers = {
          'id': localStorage.getItem('id'),
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        const response = await axios.get("http://localhost:3000/api/v2/get-all-tasks", { headers });
        const userId = localStorage.getItem('id');
        const assignedTasks = response.data.allTasks.filter(task => task.assignedBy === userId && task.assignedTo !== userId);
        setTasks(assignedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    
    fetchTasks();
  }, []);

  const taskLinks = [
    { title: "All Tasks", icon: <VscTasklist />, link: "/otherUserTasks/allTasks" },
    { title: "Completed Assigned Tasks", icon: <FaCheckDouble />, link: "/otherUserTasks/completedTasks" },
    { title: "Incomplete Assigned Tasks", icon: <TbNotebookOff />, link: "/otherUserTasks/incompletedTasks" },
  ];

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        {taskLinks.map((task, i) => (
          <Link 
            key={i} 
            to={task.link} 
            className='border border-gray-300 rounded-xl flex items-center p-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors'>
            {task.icon}&nbsp;{task.title}
          </Link>
        ))}
      </div>
      <div className='task-content'>
        <Outlet context={{ tasks }} />
      </div>
    </div>
  );
};

export default OtherUserTasks;