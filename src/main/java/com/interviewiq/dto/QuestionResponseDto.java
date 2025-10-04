package com.interviewiq.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuestionResponseDto {
    private String questionText;
    private String questionType;
    private String difficultyLevel;
    private String targetSkill;
    private List<String> evaluationCriteria;
}
