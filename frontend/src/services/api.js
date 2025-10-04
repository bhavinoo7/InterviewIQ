import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      config.headers.Authorization = `Bearer ${user.id}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  createOrGetUser: (userData) => api.post('/users', userData),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserByEmail: (email) => api.get(`/users/email/${email}`),
};

export const resumeService = {
  uploadResume: (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    return api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUserResumes: (userId) => api.get(`/resumes/user/${userId}`),
  getResumeById: (id) => api.get(`/resumes/${id}`),
};

export const interviewService = {
  createInterview: (userId, resumeId, title) => 
    api.post('/interviews', null, {
      params: { userId, resumeId, title }
    }),
  startInterview: (id) => api.post(`/interviews/${id}/start`),
  endInterview: (id) => api.post(`/interviews/${id}/end`),
  submitAnswer: (interviewId, questionId, answerText, audioFilePath, duration) =>
    api.post(`/interviews/${interviewId}/submit-answer`, null, {
      params: { questionId, answerText, audioFilePath, duration }
    }),
  getUserInterviews: (userId) => api.get(`/interviews/user/${userId}`),
  getInterviewById: (id) => api.get(`/interviews/${id}`),
};

export default api;
