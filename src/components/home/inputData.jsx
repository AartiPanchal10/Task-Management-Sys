import React, { useEffect, useState } from 'react';
import { IoMdCloseCircle } from "react-icons/io";
import axios from 'axios';
import Select from 'react-select';

const InputData = ({ InputDiv, setInputDiv, updatedData, setUpdatedData, fetchTasks }) => {
  const [Data, setData] = useState({ title: "", description: "", assignedTo: "", dueDate: "" });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setData({ 
      title: updatedData.title || "", 
      description: updatedData.description || "", 
      assignedTo: updatedData.assignedTo || "",
      dueDate: updatedData.dueDate ? new Date(updatedData.dueDate).toISOString().split('T')[0] : ""
    });
    if (updatedData.assignedTo) {
      const assignedUser = users.find(user => user._id === updatedData.assignedTo);
      if (assignedUser) {
        setSelectedUser({ value: assignedUser._id, label: assignedUser.username });
      }
    }
  }, [updatedData, users]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const headers = {
          id: localStorage.getItem("id"),
          authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const response = await axios.get("http://localhost:3000/api/v1/get-all-users", { headers });
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (localStorage.getItem("id") && localStorage.getItem("token")) {
      fetchUsers();
    }
  }, []);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const change = (e) => {
    const { name, value } = e.target;
    setData({ ...Data, [name]: value });
  };

  const handleUserSelect = (selectedOption) => {
    setSelectedUser(selectedOption);
    setData({ ...Data, assignedTo: selectedOption.value });
  };

  const submitData = async () => {
    if (Data.title === "" || Data.description === "" || Data.assignedTo === "" || Data.dueDate === "") {
      alert("All fields are required.");
    } else {
      try {
        await axios.post("http://localhost:3000/api/v2/create-task", Data, { headers });
        alert("Task Created.");
        setData({ title: "", description: "", assignedTo: "", dueDate: "" });
        setSelectedUser(null);
        setInputDiv("hidden");
        fetchTasks();
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
  };

  const updateTask = async () => {
    if (Data.title === "" || Data.description === "" || Data.assignedTo === "" || Data.dueDate === "") {
      alert("All fields are required.");
    } else {
      try {
        await axios.put(`http://localhost:3000/api/v2/update-task/${updatedData.id}`, Data, { headers });
        alert("Task Updated.");
        setUpdatedData({ id: "", title: "", description: "", assignedTo: "", dueDate: "" });
        setData({ title: "", description: "", assignedTo: "", dueDate: "" });
        setSelectedUser(null);
        setInputDiv("hidden");
        fetchTasks();
      } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task.");
      }
    }
  };

  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.username,
  }));

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#374151',
      color: 'white',
      border: '1px solid #4b5563',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#374151',
      color: 'white',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'white',
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? '#2a3446' : '#374151',
      color: 'white',
    }),
    input: (base) => ({
      ...base,
      color: 'white',
    }),
  };

  return (
    <>
      <div className={`${InputDiv} fixed inset-0 bg-gray-800 bg-opacity-80 z-40`}></div>
      <div className={`${InputDiv} fixed inset-0 flex items-center justify-center z-50 p-4`}>
        <div className='w-full max-w-lg bg-slate-500 p-4 rounded shadow-lg'>
          <div className='flex justify-end'>
            <button
              className='text-2xl text-white hover:text-gray-300 transition-colors'
              onClick={() => {
                setInputDiv("hidden");
                setData({ title: "", description: "", assignedTo: "", dueDate: "" });
                setSelectedUser(null);
                setUpdatedData({ id: "", title: "", description: "", assignedTo: "", dueDate: "" });
              }}
            >
              <IoMdCloseCircle />
            </button>
          </div>
          <input
            type="text"
            placeholder='Title'
            name='title'
            className='px-3 py-2 rounded w-full bg-slate-700 text-slate-100 my-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={Data.title}
            onChange={change}
          />
          <textarea
            name="description"
            rows="5"
            placeholder="Description...."
            className="px-3 py-2 rounded w-full bg-slate-700 text-slate-100 my-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={Data.description}
            onChange={change}
          />
          <div className="px-3 py-2 rounded w-full bg-slate-700 text-slate-100 my-3">
            <h2 className="text-lg font-semibold mb-2 text-white">Assign User</h2>
            <Select
              options={userOptions}
              value={selectedUser}
              onChange={handleUserSelect}
              placeholder="Search user..."
              className="text-slate-100"
              styles={customStyles}
            />
          </div>
          <input
            type="date"
            name="dueDate"
            className='px-3 py-2 rounded w-full bg-slate-700 text-slate-100 my-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={Data.dueDate}
            onChange={change}
          />
          {updatedData.id === "" ? (
            <button 
              className='w-full px-3 py-2 bg-gray-200 rounded text-gray-700 text-xl font-semibold mt-4 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500' 
              onClick={submitData}
            >
              Submit
            </button>
          ) : (
            <button 
              className='w-full px-3 py-2 bg-gray-200 rounded text-gray-700 text-xl font-semibold mt-4 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500' 
              onClick={updateTask}
            >
              Update
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default InputData;