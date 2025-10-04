package com.interviewiq.dto;

import com.interviewiq.entity.Interview;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InterviewDto {
    private Long id;
    private String title;
    private Interview.InterviewStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer totalDuration;
    private Double overallScore;
    private String overallFeedback;
    private LocalDateTime createdAt;
    private Long resumeId;
    private List<QuestionDto> questions;
    private List<AnswerDto> answers;

    // Constructors
    public InterviewDto() {}


}
