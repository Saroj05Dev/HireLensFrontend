import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import candidateReducer from "../features/candidates/candidateSlice";
import jobReducer from "../features/jobs/jobsSlice";
import interviewReducer from "../features/interviews/interviewSlice";
import teamReducer from "../features/team/teamSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import profileReducer from "../features/profile/profileSlice";


export default combineReducers({
    auth: authReducer,
    jobs: jobReducer,
    candidates: candidateReducer,
    interviews: interviewReducer,
    team: teamReducer,
    notifications: notificationReducer,
    profile: profileReducer
});