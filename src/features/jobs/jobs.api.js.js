import axiosInstance from "../../helpers/axiosInstance";

export const fetchJobsApi = async () => {
    const res = await axiosInstance.get('/jobs');
    return res.data.data;
}

export const createJobApi = async (jobData) => {
    const res = await axiosInstance.post('/jobs', jobData);
    return res.data.data;
}

export const updateJobApi = async (jobId, jobData) => {
    const res = await axiosInstance.put(`/jobs/${jobId}`, jobData);
    return res.data.data;
}

export const closeJobApi = async (jobId) => {
    const res = await axiosInstance.patch(`/jobs/${jobId}/close`);
    return res.data.data;
}

export const reopenJobApi = async (jobId) => {
    const res = await axiosInstance.patch(`/jobs/${jobId}/reopen`);
    return res.data.data;
}

export const deleteJobApi = async (jobId) => {
    const res = await axiosInstance.delete(`/jobs/${jobId}`);
    return res.data.data;
}