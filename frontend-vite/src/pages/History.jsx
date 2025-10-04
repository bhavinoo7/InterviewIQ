import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { interviewService } from '../services/api';
import { 
  Clock, 
  CheckCircle, 
  Play, 
  TrendingUp, 
  Calendar,
  Star,
  MessageSquare,
  FileText
} from 'lucide-react';

const History = () => {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const fetchInterviews = async () => {
    try {
      const response = await interviewService.getUserInterviews(user.id);
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'CREATED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview History</h1>
          <p className="text-gray-600 mt-2">
            Review your past interviews and track your progress
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {interviews.length} interview{interviews.length !== 1 ? 's' : ''} completed
        </div>
      </div>

      {/* Stats Overview */}
      {interviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.filter(i => i.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.filter(i => i.overallScore).length > 0
                    ? (interviews
                        .filter(i => i.overallScore)
                        .reduce((sum, i) => sum + i.overallScore, 0) /
                      interviews.filter(i => i.overallScore).length
                      ).toFixed(1)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.filter(i => i.totalDuration).length > 0
                    ? Math.round(
                        interviews
                          .filter(i => i.totalDuration)
                          .reduce((sum, i) => sum + i.totalDuration, 0) /
                        interviews.filter(i => i.totalDuration).length
                      )
                    : 'N/A'}{' '}
                  min
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your resume and start practicing to see your interview history here.
          </p>
          <a
            href="/upload"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Your First Interview
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">All Interviews</h2>
          </div>
          <div className="divide-y">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {interview.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(interview.createdAt)}
                      </div>
                      
                      {interview.totalDuration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {interview.totalDuration} min
                        </div>
                      )}
                      
                      {interview.overallScore && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          <span className={getScoreColor(interview.overallScore)}>
                            {interview.overallScore}/10
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {interview.questions?.length || 0} questions
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedInterview(
                        selectedInterview?.id === interview.id ? null : interview
                      )}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {selectedInterview?.id === interview.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Interview Details */}
                {selectedInterview?.id === interview.id && (
                  <div className="mt-4 pt-4 border-t">
                    {interview.overallFeedback && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">AI Feedback</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {interview.overallFeedback}
                          </p>
                        </div>
                      </div>
                    )}

                    {interview.answers && interview.answers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Q&A Details</h4>
                        <div className="space-y-3">
                          {interview.answers.map((answer, index) => (
                            <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">
                                  Question {index + 1}
                                </h5>
                                {answer.score && (
                                  <span className={`text-sm font-medium ${getScoreColor(answer.score)}`}>
                                    {answer.score}/10
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                {answer.questionText}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Answer:</strong> {answer.answerText}
                              </p>
                              {answer.feedback && (
                                <div className="text-sm text-gray-600">
                                  <strong>Feedback:</strong> {answer.feedback}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
