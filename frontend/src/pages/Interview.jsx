import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  ArrowLeft,
  Home
} from 'lucide-react';

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const fetchInterview = async () => {
    try {
      const response = await interviewService.getInterviewById(id);
      setInterview(response.data);
      
      // If interview is not started, start it
      if (response.data.status === 'CREATED') {
        await startInterview();
      }
    } catch (error) {
      setError('Failed to load interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    try {
      const response = await interviewService.startInterview(id);
      setInterview(response.data);
    } catch (error) {
      setError('Failed to start interview. Please try again.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const currentQuestion = interview.questions[currentQuestionIndex];
      const response = await interviewService.submitAnswer(
        id,
        currentQuestion.id,
        answerText,
        audioRef.current?.src || null,
        recordingTime
      );

      setInterview(response.data);
      setAnswerText('');
      setRecordingTime(0);
      
      // Move to next question or end interview
      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        await endInterview();
      }
    } catch (error) {
      setError('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const endInterview = async () => {
    try {
      const response = await interviewService.endInterview(id);
      setInterview(response.data);
    } catch (error) {
      setError('Failed to end interview. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Interview not found.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (interview.status === 'COMPLETED') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h1>
          <p className="text-gray-600">Great job on completing the interview.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {interview.overallScore ? `${interview.overallScore}/10` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {interview.totalDuration ? `${interview.totalDuration} min` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {interview.questions?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
          </div>
        </div>

        {interview.overallFeedback && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Feedback</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{interview.overallFeedback}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            View History
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = interview.questions?.[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{interview.title}</h1>
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} of {interview.questions?.length || 0}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(recordingTime)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / (interview.questions?.length || 1)) * 100}%`
          }}
        ></div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full mr-3">
                {currentQuestion.questionType?.toUpperCase() || 'QUESTION'}
              </span>
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                {currentQuestion.difficultyLevel?.toUpperCase() || 'MEDIUM'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Recording Controls */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Recording
                </button>
              )}

              {audioRef.current?.src && (
                <div className="flex items-center space-x-2">
                  {!isPlaying ? (
                    <button
                      onClick={playRecording}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Answer Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer (Optional - for text transcription)
              </label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Type your answer here or leave blank if you only want to record audio..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={submitAnswer}
                disabled={submitting || (!answerText.trim() && !audioRef.current?.src)}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {currentQuestionIndex < interview.questions.length - 1 ? 'Next Question' : 'Finish Interview'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default Interview;
