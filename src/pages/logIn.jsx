import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authActions } from '../store/auth.js';

const LogIn = () => {
  const [Data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const change = (e) => {
    const { name, value } = e.target;
    setData({ ...Data, [name]: value });
  };

  const submit = async () => {
    try {
      if (Data.email === "" || Data.password === "") {
        alert("All fields are required");
      } else {
        const response = await axios.post("http://localhost:3000/api/v1/log-in", Data);
        setData({ email: "", password: "" });
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("token", response.data.token);

        const userResponse = await axios.get("http://localhost:3000/api/v1/get-all-users", {
          headers: {
            Authorization: `Bearer ${response.data.token}`
          }
        });

        const userData = userResponse.data.data.find(user => user._id === response.data.id);

        localStorage.setItem("userData", JSON.stringify({
          username: userData.username,
          email: userData.email
        }));

        dispatch(authActions.login());
        navigate("/");
      }
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 p-6 bg-slate-600 rounded-lg shadow-md'>
        <div className='text-2xl font-semibold text-center text-white'>LogIn</div>
        <input 
          type="email"
          placeholder='Email'
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-100'
          name='email'
          value={Data.email}
          onChange={change}
        />
        <input 
          type="password"
          placeholder='Password'
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-100'
          name='password'
          value={Data.password}
          onChange={change}
        />
        <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0'>
          <button 
            className='w-full sm:w-auto bg-gray-200 text-xl font-semibold text-gray-500 px-4 py-2 rounded hover:bg-gray-300 transition duration-200'
            onClick={submit}
          >
            LogIn
          </button>
          <Link to="/signUp" className='text-gray-300 hover:text-gray-100 text-sm'>
            Not having an account? SignUp here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LogIn;