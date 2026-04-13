import api from './axios';

// ── Auth ──────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register/', data);
export const loginUser    = (data) => api.post('/auth/login/', data);
export const getMe        = ()     => api.get('/auth/me/');

// ── Jobs ──────────────────────────────────────────────────────
export const getAllJobs  = ()           => api.get('/jobs/');
export const getMyJobs  = ()           => api.get('/jobs/my/');
export const getJob     = (id)         => api.get(`/jobs/${id}/`);
export const createJob  = (data)       => api.post('/jobs/', data);
export const updateJob  = (id, data)   => api.put(`/jobs/${id}/`, data);
export const deleteJob  = (id)         => api.delete(`/jobs/${id}/`);

// ── Applications ──────────────────────────────────────────────
export const applyToJob        = (formData) =>
  api.post('/applications/apply/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getMyApplications = ()          => api.get('/applications/mine/');
export const getJobApplicants  = (jobId)     => api.get(`/applications/job/${jobId}/`);
export const updateAppStatus   = (appId, status) =>
  api.patch(`/applications/${appId}/status/`, { status });
