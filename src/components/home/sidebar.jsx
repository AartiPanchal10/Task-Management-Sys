import React, { useEffect, useState } from 'react';
import { MdLabelImportant } from 'react-icons/md';
import { VscTasklist } from "react-icons/vsc";
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authActions } from '../../store/auth';

const Sidebar = ({ closeSidebar }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    const sidebarLinks = [
        {
            title: "My Tasks",
            link: "/myTasks/allTasks",
            icon: <VscTasklist />
        },
        {
            title: "Other Users' Tasks",
            link: "/otherUserTasks/allTasks",
            icon: <MdLabelImportant />
        },
    ];

    const logout = () => {
        localStorage.removeItem("id");
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        dispatch(authActions.logout());
        navigate("/signUp");
    };

    useEffect(() => {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-600 text-white p-4">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className='text-xl font-semibold'>{userData?.username}</h2>
                    <h4 className='mb-1 text-slate-300 text-sm truncate'>{userData?.email}</h4>
                </div>
                <button
                    className="md:hidden text-2xl p-2"
                    onClick={closeSidebar}
                >
                    ✕
                </button>
            </div>
            <hr className="border-slate-400 mb-4" />
            <nav className="flex-grow flex flex-col justify-center">
                {sidebarLinks.map((item, i) => (
                    <Link
                        to={item.link}
                        key={i}
                        className='my-2 flex items-center hover:bg-gray-700 p-2 rounded transition-all duration-300'
                        onClick={closeSidebar}
                    >
                        {item.icon}&nbsp;{item.title}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto">
                <button 
                    className="bg-gray-200 w-full text-xl font-semibold text-gray-500 px-3 py-2 rounded" 
                    onClick={logout}
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;