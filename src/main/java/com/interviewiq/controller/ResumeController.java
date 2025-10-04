package com.interviewiq.controller;

import com.interviewiq.dto.ResumeResponseDto;
import com.interviewiq.dto.ResumeUploadResponse;
import com.interviewiq.entity.Resume;
import com.interviewiq.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<ResumeUploadResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        ResumeUploadResponse response = resumeService.uploadResume(file, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ResumeResponseDto>> getUserResumes(@PathVariable Long userId) {
        List<ResumeResponseDto> resumes = resumeService.getUserResumes(userId);
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResumeById(@PathVariable Long id) {
        Resume resume = resumeService.getResumeById(id);
        return ResponseEntity.ok(resume);
    }
}
