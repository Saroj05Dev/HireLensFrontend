import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import candidateReducer from "../features/candidates/candidateSlice";
import jobReducer from "../features/jobs/jobsSlice";
import interviewReducer from "../features/interviews/interviewSlice";
import teamReducer from "../features/team/teamSlice";


export default combineReducers({
    auth: authReducer,
    jobs: jobReducer,
    candidates: candidateReducer,
    interviews: interviewReducer,
    team: teamReducer
});