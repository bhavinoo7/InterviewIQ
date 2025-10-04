package com.interviewiq.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnswerDto {
    private Long id;
    private String answerText;
    private String audioFilePath;
    private Integer duration;
    private Double score;
    private String feedback;
    private String strengths;
    private String improvements;
    private LocalDateTime answeredAt;
    private Long questionId;
    private String questionText;

    // Constructors
    public AnswerDto() {}


}
