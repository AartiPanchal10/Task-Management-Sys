import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import validator from 'validator';

const SignUp = () => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const [Data, setData] = useState({ username: "", email: "", password: "" });
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    const change = (e) => {
        const { name, value } = e.target;
        setData({ ...Data, [name]: value });
    };

    const validateForm = () => {
        if (Data.username === "" || Data.email === "" || Data.password === "") {
            alert("All fields are required");
            return false;
        }
        if (Data.username.length < 6) {
            alert("Username should have at least 6 characters");
            return false;
        }
        if (!validator.isEmail(Data.email)) {
            alert("Invalid email format");
            return false;
        }
        if (!validator.isStrongPassword(Data.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            alert("Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol");
            return false;
        }
        return true;
    };

    const submit = async () => {
        try {
            if (validateForm()) {
                const response = await axios.post("http://localhost:3000/api/v1/sign-up", Data);
                setData({ username: "", email: "", password: "" });
                alert(response.data.message);
                navigate("/logIn");
            }
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8 p-6 bg-slate-600 rounded-lg shadow-md'>
                <div className='text-2xl font-semibold text-center text-white'>SignUp</div>
                <input 
                    type="text"
                    placeholder='Username'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-100'
                    name='username'
                    value={Data.username}
                    onChange={change}
                />
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
                        SignUp
                    </button>
                    <Link to="/logIn" className='text-gray-300 hover:text-gray-100 text-sm'>
                        Already have an account? LogIn here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;