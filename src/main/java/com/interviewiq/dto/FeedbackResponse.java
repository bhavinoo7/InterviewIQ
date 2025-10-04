package com.interviewiq.dto;

import lombok.Data;

@Data
public class FeedbackResponse {
    private double score;
    private String feedback;
    private String strengths;
    private String improvements;
}
