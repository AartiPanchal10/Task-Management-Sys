import { configureStore } from "@reduxjs/toolkit"; // Import function to configure the Redux store
import authReducer from "./auth.js" // Import the auth reducer
 
const store = configureStore({
    reducer: {
        auth: authReducer, // Add the auth reducer to the store
    },
});
 
export default store; // Export the configured store