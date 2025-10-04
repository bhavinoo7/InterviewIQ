package com.interviewiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewiq.dto.FeedbackResponse;
import com.interviewiq.dto.InterviewDto;
import com.interviewiq.dto.QuestionDto;
import com.interviewiq.dto.AnswerDto;
import com.interviewiq.entity.*;
import com.interviewiq.repository.InterviewRepository;
import com.interviewiq.repository.QuestionRepository;
import com.interviewiq.repository.AnswerRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.json.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import java.util.*;

@Slf4j
@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private AiService aiService;

    public InterviewDto createInterview(Long userId, Long resumeId, String title) {
        User user = new User();
        user.setId(userId);
        
        Resume resume = new Resume();
        resume.setId(resumeId);

        Interview interview = new Interview(title, user, resume);
        Interview savedInterview = interviewRepository.save(interview);

        return convertToDto(savedInterview);
    }

    public InterviewDto startInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + interviewId));

        interview.setStatus(Interview.InterviewStatus.IN_PROGRESS);
        interview.setStartedAt(LocalDateTime.now());
        
        Interview savedInterview = interviewRepository.save(interview);
        return convertToDto(savedInterview);
    }

    public InterviewDto endInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + interviewId));

        interview.setStatus(Interview.InterviewStatus.COMPLETED);
        interview.setEndedAt(LocalDateTime.now());
        
        if (interview.getStartedAt() != null) {
            long duration = ChronoUnit.MINUTES.between(interview.getStartedAt(), interview.getEndedAt());
            interview.setTotalDuration((int) duration);
        }

        // Generate overall feedback
        List<Answer> answers = answerRepository.findByInterviewIdOrderByAnsweredAtAsc(interviewId);
        if (!answers.isEmpty()) {
            List<String> answerTexts = answers.stream()
                    .map(Answer::getAnswerText)
                    .collect(Collectors.toList());
            
            List<String> questionTexts = answers.stream()
                    .map(answer -> answer.getQuestion().getQuestionText())
                    .collect(Collectors.toList());

            String overallFeedback = aiService.generateOverallFeedback(answerTexts, questionTexts);
            interview.setOverallFeedback(overallFeedback);
            
            // Calculate overall score
            double avgScore = answers.stream()
                    .mapToDouble(answer -> answer.getScore() != null ? answer.getScore() : 0.0)
                    .average()
                    .orElse(0.0);
            interview.setOverallScore(avgScore);
        }

        Interview savedInterview = interviewRepository.save(interview);
        return convertToDto(savedInterview);
    }

    public InterviewDto submitAnswer(Long interviewId, Long questionId, String answerText, String audioFilePath, Integer duration) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + interviewId));

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));

        Answer answer = new Answer(answerText, question, interview);
        answer.setAudioFilePath(audioFilePath);
        answer.setDuration(duration);

        // Generate feedback using AI
        System.out.println(question.getQuestionText()+answerText);
        String feedbackJson = aiService.generateFeedback(question.getQuestionText(), answerText);
        System.out.println(feedbackJson);
        parseAndSetFeedback(answer, feedbackJson);

        Answer savedAnswer = answerRepository.save(answer);
        
        // Update interview with the new answer
        InterviewDto interviewDto = convertToDto(interview);
        return interviewDto;
    }

    public List<InterviewDto> getUserInterviews(Long userId) {
        List<Interview> interviews = interviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return interviews.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public InterviewDto getInterviewById(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + id));
        return convertToDto(interview);
    }

    private InterviewDto convertToDto(Interview interview) {
        InterviewDto dto = new InterviewDto();
        dto.setId(interview.getId());
        dto.setTitle(interview.getTitle());
        dto.setStatus(interview.getStatus());
        dto.setStartedAt(interview.getStartedAt());
        dto.setEndedAt(interview.getEndedAt());
        dto.setTotalDuration(interview.getTotalDuration());
        dto.setOverallScore(interview.getOverallScore());
        dto.setOverallFeedback(interview.getOverallFeedback());
        dto.setCreatedAt(interview.getCreatedAt());
        dto.setResumeId(interview.getResume().getId());

        // Convert questions
        if (interview.getResume() != null && interview.getResume().getQuestions() != null) {
            List<QuestionDto> questionDtos = interview.getResume().getQuestions().stream()
                    .map(this::convertQuestionToDto)
                    .collect(Collectors.toList());
            dto.setQuestions(questionDtos);
        }

        // Convert answers
        if (interview.getAnswers() != null) {
            List<AnswerDto> answerDtos = interview.getAnswers().stream()
                    .map(this::convertAnswerToDto)
                    .collect(Collectors.toList());
            dto.setAnswers(answerDtos);
        }

        return dto;
    }

    private QuestionDto convertQuestionToDto(Question question) {
        QuestionDto dto = new QuestionDto();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType());
        dto.setDifficultyLevel(question.getDifficultyLevel());
        return dto;
    }

    private AnswerDto convertAnswerToDto(Answer answer) {
        AnswerDto dto = new AnswerDto();
        dto.setId(answer.getId());
        dto.setAnswerText(answer.getAnswerText());
        dto.setAudioFilePath(answer.getAudioFilePath());
        dto.setDuration(answer.getDuration());
        dto.setScore(answer.getScore());
        dto.setFeedback(answer.getFeedback());
        dto.setStrengths(answer.getStrengths());
        dto.setImprovements(answer.getImprovements());
        dto.setAnsweredAt(answer.getAnsweredAt());
        dto.setQuestionId(answer.getQuestion().getId());
        dto.setQuestionText(answer.getQuestion().getQuestionText());
        return dto;
    }

    private void parseAndSetFeedback(Answer answer, String feedbackJson) {
        // This is a simplified implementation
        // In a real application, you would use a proper JSON parser
        // For now, we'll set some default values
        try {
            String cleaned = feedbackJson
                    .replaceAll("```json", "")  // remove ```json
                    .replaceAll("```", "");     // remove closing ```

            ObjectMapper mapper = new ObjectMapper();
            FeedbackResponse feedback = mapper.readValue(cleaned, FeedbackResponse.class);
            answer.setScore(feedback.getScore());
            answer.setFeedback(feedback.getFeedback());
            answer.setStrengths(feedback.getStrengths());
            answer.setImprovements(feedback.getImprovements());

        }catch(Exception e)
        {
            log.error(e.toString());
        }

    }
}
