package com.interviewiq.dto;

import lombok.Data;

@Data
public class ResumeUploadResponse {
    private Long resumeId;
    private String fileName;
    private String message;
    private boolean success;

    // Constructors
    public ResumeUploadResponse() {}

    public ResumeUploadResponse(Long resumeId, String fileName, String message, boolean success) {
        this.resumeId = resumeId;
        this.fileName = fileName;
        this.message = message;
        this.success = success;
    }


}
