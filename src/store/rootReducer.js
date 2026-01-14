import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import candidateReducer from "../features/candidates/candidateSlice";
// later: job, interviews, analytics etc.

export default combineReducers({
    auth: authReducer,
    candidate: candidateReducer
});