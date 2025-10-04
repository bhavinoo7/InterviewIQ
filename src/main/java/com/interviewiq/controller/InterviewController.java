package com.interviewiq.controller;

import com.interviewiq.dto.InterviewDto;
import com.interviewiq.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping
    public ResponseEntity<InterviewDto> createInterview(
            @RequestParam Long userId,
            @RequestParam Long resumeId,
            @RequestParam String title) {
        InterviewDto interview = interviewService.createInterview(userId, resumeId, title);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<InterviewDto> startInterview(@PathVariable Long id) {
        InterviewDto interview = interviewService.startInterview(id);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<InterviewDto> endInterview(@PathVariable Long id) {
        InterviewDto interview = interviewService.endInterview(id);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{interviewId}/submit-answer")
    public ResponseEntity<InterviewDto> submitAnswer(
            @PathVariable Long interviewId,
            @RequestParam Long questionId,
            @RequestParam String answerText,
            @RequestParam(required = false) String audioFilePath,
            @RequestParam(required = false) Integer duration) {
        InterviewDto interview = interviewService.submitAnswer(interviewId, questionId, answerText, audioFilePath, duration);
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InterviewDto>> getUserInterviews(@PathVariable Long userId) {
        List<InterviewDto> interviews = interviewService.getUserInterviews(userId);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDto> getInterviewById(@PathVariable Long id) {
        InterviewDto interview = interviewService.getInterviewById(id);
        return ResponseEntity.ok(interview);
    }
}
