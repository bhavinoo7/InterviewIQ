import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { resumeService, interviewService } from '../services/api';
import { Upload, Play, Clock, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import LoginForm from '../components/LoginForm';

const Dashboard = () => {
  const { user, loading } = useUser();
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [resumesRes, interviewsRes] = await Promise.all([
        resumeService.getUserResumes(user.id),
        interviewService.getUserInterviews(user.id)
      ]);
      

      setResumes(resumesRes.data);
      setInterviews(interviewsRes.data);

      // Calculate stats
      const completedInterviews = interviewsRes.data.filter(i => i.status === 'COMPLETED');
      const totalScore = completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0);
      const averageScore = completedInterviews.length > 0 ? totalScore / completedInterviews.length : 0;

      setStats({
        totalResumes: resumesRes.data.length,
        totalInterviews: interviewsRes.data.length,
        completedInterviews: completedInterviews.length,
        averageScore: Math.round(averageScore * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const startNewInterview = async (resumeId) => {
    try {
      const response = await interviewService.createInterview(
        user.id,
        resumeId,
        `Interview - ${new Date().toLocaleDateString()}`
      );
      window.location.href = `/interview/${response.data.id}`;
    } catch (error) {
      console.error('Error creating interview:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-primary-100">
          Ready to ace your next interview? Upload your resume and start practicing with AI-powered questions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resumes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResumes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Resume */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Upload your resume to generate personalized interview questions using AI.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Resume
          </Link>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Interviews</h2>
          </div>
          {interviews.length > 0 ? (
            <div className="space-y-3">
              {interviews.slice(0, 3).map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{interview.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      interview.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : interview.status === 'IN_PROGRESS'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {interview.status}
                    </span>
                    {interview.status === 'CREATED' && (
                      <button
                        onClick={() => startNewInterview(interview.resumeId)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No interviews yet. Upload a resume to get started!</p>
          )}
        </div>
      </div>

      {/* Resumes Section */}
      {resumes.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Resumes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900 truncate">{resume.fileName}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => startNewInterview(resume.id)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Start Interview
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
