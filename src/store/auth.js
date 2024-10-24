import { createSlice } from "@reduxjs/toolkit";
 
// Create a slice for authentication state
const authSlice = createSlice({
  name: "auth", // Slice name
  initialState: { isLoggedIn: false }, // Initial state
  reducers: {
    login(state) {
      state.isLoggedIn = true; // Set isLoggedIn to true on login
    },
    logout(state) {
      state.isLoggedIn = false; // Set isLoggedIn to false on logout
    },
  },
});
 
// Export actions and reducer
export const authActions = authSlice.actions;
export default authSlice.reducer;