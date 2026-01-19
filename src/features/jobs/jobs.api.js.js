import axiosInstance from "../../helpers/axiosInstance";

export const fetchJobsApi = async () => {
    const res = await axiosInstance.get('/jobs');
    return res.data.data;
}

export const createJobApi = async (jobData) => {
    const res = await axiosInstance.post('/jobs', jobData);
    return res.data.data;
}