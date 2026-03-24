import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import candidateReducer from "../features/candidates/candidateSlice";
import jobReducer from "../features/jobs/jobsSlice";


export default combineReducers({
    auth: authReducer,
    jobs: jobReducer,
    candidates: candidateReducer
});