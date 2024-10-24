import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { IoIosAddCircle } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';

const Cards = ({ home, setInputDiv, data, setUpdatedData, fetchTasks }) => {
  const [usernames, setUsernames] = useState({});
  const headers = {
    id: localStorage.getItem('id'),
    authorization: `Bearer ${localStorage.getItem('token')}`
  };
  const loggedInUserId = localStorage.getItem('id');

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/get-all-users', { headers });
        const usernameMap = {};
        response.data.data.forEach(user => {
          usernameMap[user._id] = user.username;
        });
        setUsernames(usernameMap);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };

    fetchUsernames();
  }, []);

  const handleCompleteTask = async (id, assignedBy) => {
    if (assignedBy !== loggedInUserId) {
      alert("You do not have permission to update this task.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:3000/api/v2/update-complete-task/${id}`,
        {},
        { headers }
      );
      alert("Task Updated Successfully.");
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const deleteTask = async (id, assignedBy) => {
    if (assignedBy !== loggedInUserId) {
      alert("You do not have permission to delete this task.");
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/api/v2/delete-task/${id}`, {
        headers,
      });
      alert("Task Deleted.");
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdate = (id, title, description, assignedTo, assignedBy, dueDate) => {
    if (assignedBy !== loggedInUserId) {
      alert("You do not have permission to update this task.");
      return;
    }
    setInputDiv('fixed');
    setUpdatedData({ id, title, description, assignedTo, dueDate });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDueDateColor = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500';
    if (diffDays <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data &&
        data.map((items) => (
          <div
            key={items._id}
            className="flex flex-col justify-between bg-slate-600 rounded-xl p-4"
          >
            <div>
              <h2 className="text-xl font-semibold">{items.title}</h2>
              <p className="text-slate-100 my-2">{items.description}</p>
              <p className="text-slate-300">Assigned to: {usernames[items.assignedTo] || 'Loading...'}</p>
              <p className="text-slate-300">Assigned by: {usernames[items.assignedBy] || 'Loading...'}</p>
              <p className={`${getDueDateColor(items.dueDate)} font-semibold`}>
                Due: {formatDate(items.dueDate)}
              </p>
            </div>
            <div className="mt-4 w-full flex flex-col sm:flex-row items-center">
              <button
                className={`${
                  items.complete === false ? 'bg-amber-700' : 'bg-green-700'
                } p-2 rounded w-full sm:w-3/6 mb-2 sm:mb-0`}
                onClick={() => handleCompleteTask(items._id, items.assignedBy)}
              >
                {items.complete === true ? 'Completed' : 'Incomplete'}
              </button>
              <div className="text-white p-2 w-full sm:w-3/6 text-xl flex justify-around">
                <button
                  onClick={() =>
                    handleUpdate(items._id, items.title, items.description, items.assignedTo, items.assignedBy, items.dueDate)
                  }
                >
                  <FaEdit />
                </button>
                <button onClick={() => deleteTask(items._id, items.assignedBy)}>
                  <MdDelete />
                </button>
              </div>
            </div>
          </div>
        ))}
      {home === 'true' && (
        <button
          className="flex flex-col justify-center items-center bg-slate-600 rounded-xl p-4 text-slate-100 hover:scale-105 cursor-pointer transition-all duration-300"
          onClick={() => setInputDiv('fixed')}
        >
          <IoIosAddCircle className="text-5xl text-slate-100" />
          <h2 className="text-2xl mt-4">Add Task</h2>
        </button>
      )}
    </div>
  );
};

export default Cards;