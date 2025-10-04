package com.interviewiq.service;

import com.interviewiq.dto.ResumeResponseDto;
import com.interviewiq.dto.ResumeUploadResponse;
import com.interviewiq.entity.Question;
import com.interviewiq.entity.Resume;
import com.interviewiq.entity.User;
import com.interviewiq.repository.ResumeRepository;
import com.interviewiq.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AiService aiService;

    private static final String UPLOAD_DIR = "uploads/resumes/";

    public ResumeUploadResponse uploadResume(MultipartFile file, Long userId) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Create Resume entity
            User user = new User();
            user.setId(userId);
            Resume resume = new Resume(
                originalFilename,
                filePath.toString(),
                file.getSize(),
                file.getContentType(),
                user
            );

            // Save resume
            Resume savedResume = resumeRepository.save(resume);

            // Parse resume content using AI
            String resumeContent = extractTextFromFile(file);
            String parsedContent = aiService.parseResume(resumeContent);
            savedResume.setParsedContent(parsedContent);
            savedResume = resumeRepository.save(savedResume);

            // Generate questions
            List<Question> questions = aiService.generateQuestions(savedResume);
            for (Question question : questions) {
                question.setResume(savedResume);
            }
            questionRepository.saveAll(questions);

            return new ResumeUploadResponse(
                savedResume.getId(),
                originalFilename,
                "Resume uploaded and processed successfully",
                true
            );

        } catch (IOException e) {
            return new ResumeUploadResponse(
                null,
                file.getOriginalFilename(),
                "Failed to upload resume: " + e.getMessage(),
                false
            );
        }
    }

    public List<ResumeResponseDto> getUserResumes(Long userId) {
        List<ResumeResponseDto> resumes=resumeRepository.findAllResumeIdsByUserId(userId);
        System.out.println(resumes);
        return resumes;
    }

    public Resume getResumeById(Long id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + id));
    }

    private String extractTextFromFile(MultipartFile file) throws IOException {
        // This is a simplified implementation
        // In a real application, you would use libraries like Apache Tika
        // to extract text from various file formats (PDF, DOC, DOCX, etc.)
        return new String(file.getBytes());
    }
}
