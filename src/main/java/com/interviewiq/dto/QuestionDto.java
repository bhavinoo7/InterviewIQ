package com.interviewiq.dto;

import lombok.Data;

@Data
public class QuestionDto {
    private Long id;
    private String questionText;
    private String questionType;
    private String difficultyLevel;

    // Constructors
    public QuestionDto() {}

    public QuestionDto(Long id, String questionText, String questionType, String difficultyLevel) {
        this.id = id;
        this.questionText = questionText;
        this.questionType = questionType;
        this.difficultyLevel = difficultyLevel;
    }

}
