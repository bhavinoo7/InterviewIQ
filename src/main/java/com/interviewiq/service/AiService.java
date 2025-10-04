package com.interviewiq.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewiq.dto.FeedbackResponse;
import com.interviewiq.dto.QuestionResponseDto;
import com.interviewiq.entity.Question;
import com.interviewiq.entity.Resume;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@NoArgsConstructor
@AllArgsConstructor
public class AiService {

    @Value("${spring.ai.vertex.ai.gemini.api-key}")
    private String apiKey;

    @Value("${spring.ai.vertex.ai.gemini.project-id}")
    private String projectId;

    private final RestTemplate restTemplate = new RestTemplate();

    public String parseResume(String resumeContent) {
        String prompt = "ANALYZE AND STRUCTURE THIS RESUME\n\n" +
                "RESUME CONTENT:\n" + resumeContent + "\n\n" +
                "TASK: Extract and organize the following information in a structured JSON format:\n" +
                "{\n" +
                "  \"professional_summary\": \"Brief professional overview\",\n" +
                "  \"technical_skills\": {\n" +
                "    \"programming_languages\": [],\n" +
                "    \"frameworks\": [],\n" +
                "    \"tools\": [],\n" +
                "    \"databases\": [],\n" +
                "    \"cloud_technologies\": []\n" +
                "  },\n" +
                "  \"work_experience\": [\n" +
                "    {\n" +
                "      \"company\": \"\",\n" +
                "      \"position\": \"\",\n" +
                "      \"duration\": \"\",\n" +
                "      \"responsibilities\": [],\n" +
                "      \"achievements\": []\n" +
                "    }\n" +
                "  ],\n" +
                "  \"education\": [\n" +
                "    {\n" +
                "      \"institution\": \"\",\n" +
                "      \"degree\": \"\",\n" +
                "      \"year\": \"\",\n" +
                "      \"gpa\": \"\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"projects\": [\n" +
                "    {\n" +
                "      \"name\": \"\",\n" +
                "      \"description\": \"\",\n" +
                "      \"technologies\": [],\n" +
                "      \"outcomes\": \"\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"certifications\": [],\n" +
                "  \"key_strengths\": []\n" +
                "}\n\n" +
                "INSTRUCTIONS:\n" +
                "- Be precise and factual - only extract information explicitly mentioned\n" +
                "- Categorize technical skills appropriately\n" +
                "- Include specific achievements and metrics where available\n" +
                "- If information is missing for any section, leave it empty\n" +
                "- Return ONLY valid JSON, no additional text";

        return callGeminiAPI(prompt);
    }
    public List<Question> generateQuestions(Resume resume) {
        String prompt = "ROLE: Senior Technical Interviewer\n\n" +
                "RESUME DATA:\n" + resume.getParsedContent() + "\n\n" +
                "TASK: Generate 7 targeted interview questions that assess:\n" +
                "1. Technical depth in mentioned technologies\n" +
                "2. Practical experience and project impact\n" +
                "3. Problem-solving approach\n" +
                "4. Behavioral competencies\n" +
                "5. Cultural fit and motivation\n\n" +
                "QUESTION DISTRIBUTION:\n" +
                "- 3 Technical questions (specific to mentioned skills)\n" +
                "- 2 Experience/Project-based questions\n" +
                "- 2 Behavioral/Situational questions\n\n" +
                "OUTPUT FORMAT (STRICT JSON):\n" +
                "[\n" +
                "  {\n" +
                "    \"questionText\": \"Specific, actionable question\",\n" +
                "    \"questionType\": \"TECHNICAL|EXPERIENCE|BEHAVIORAL\",\n" +
                "    \"difficultyLevel\": \"EASY|MEDIUM|HARD\",\n" +
                "    \"targetSkill\": \"Specific technology or competency being assessed\",\n" +
                "    \"evaluationCriteria\": [\"What interviewer should look for in answer\"]\n" +
                "  }\n" +
                "]\n\n" +
                "GUIDELINES:\n" +
                "- Questions should be open-ended and require detailed responses\n" +
                "- Technical questions should be specific to technologies in resume\n" +
                "- Include at least one system design question for senior roles\n" +
                "- Behavioral questions should relate to work scenarios\n" +
                "- Ensure difficulty progression from medium to hard\n" +
                "- Return ONLY the JSON array, no other text";

        String responseContent = callGeminiAPI(prompt);
        return parseQuestionsFromJson(responseContent, resume);
    }

    public String generateFeedback(String questionText, String answerText) {
        String prompt = "ROLE: Expert Interview Coach\n\n" +
                "EVALUATE THIS INTERVIEW RESPONSE:\n\n" +
                "QUESTION: " + questionText + "\n\n" +
                "CANDIDATE ANSWER: " + answerText + "\n\n" +
                "TASK: Analyze the answer and provide feedback in the following EXACT JSON format:\n" +
                "{\n" +
                "  \"score\": 8.0,\n" +
                "  \"feedback\": \"Brief feedback statement\",\n" +
                "  \"strengths\": \"Strength1, strength2\",\n" +
                "  \"improvements\": \"Improvement1, improvement2\"\n" +
                "}\n\n" +
                "CRITICAL INSTRUCTIONS:\n" +
                "1. Return ONLY the JSON object\n" +
                "2. No additional text before or after the JSON\n" +
                "3. No code blocks (no ```json or ```)\n" +
                "4. No explanations\n" +
                "5. No comments\n" +
                "6. Just the pure JSON object\n\n" +
                "SCORING GUIDE:\n" +
                "- 9-10: Exceptional, comprehensive answer with specific examples\n" +
                "- 7-8: Good answer with solid understanding\n" +
                "- 5-6: Average, basic understanding but needs depth\n" +
                "- 3-4: Poor, incomplete or vague\n" +
                "- 1-2: Very poor, irrelevant or no meaningful content";


        return callGeminiAPI(prompt);
    }

    public String generateOverallFeedback(List<String> allAnswers, List<String> allQuestions) {
        StringBuilder qaPairs = new StringBuilder();
        for (int i = 0; i < allQuestions.size(); i++) {
            qaPairs.append("QUESTION ").append(i + 1).append(": ").append(allQuestions.get(i))
                    .append("\nANSWER ").append(i + 1).append(": ").append(allAnswers.get(i))
                    .append("\n---\n");
        }

        String prompt = "ROLE: Senior Hiring Manager\n\n" +
                "COMPREHENSIVE INTERVIEW PERFORMANCE ANALYSIS\n\n" +
                "INTERVIEW TRANSCRIPT:\n" + qaPairs.toString() + "\n\n" +
                "PERFORMANCE ANALYSIS FRAMEWORK:\n" +
                "A. TECHNICAL COMPETENCE (40%)\n" +
                "   - Depth of technical knowledge\n" +
                "   - Problem-solving approach\n" +
                "   - Practical application of skills\n\n" +
                "B. COMMUNICATION SKILLS (25%)\n" +
                "   - Clarity and structure of responses\n" +
                "   - Ability to explain complex concepts\n" +
                "   - Active listening and question understanding\n\n" +
                "C. EXPERIENCE & ACHIEVEMENTS (20%)\n" +
                "   - Relevance of past experience\n" +
                "   - Demonstrated impact and results\n" +
                "   - Learning and growth trajectory\n\n" +
                "D. BEHAVIORAL & CULTURAL FIT (15%)\n" +
                "   - Teamwork and collaboration\n" +
                "   - Problem-solving mindset\n" +
                "   - Motivation and values alignment\n\n" +
                "OUTPUT FORMAT:\n" +
                "# INTERVIEW PERFORMANCE REPORT\n\n" +
                "## Overall Score: X/10\n\n" +
                "## Executive Summary\n"
                         +
        "## Detailed Analysis\n\n" +
                "### 🎯 Technical Competence (X/10)\n" +
                "- Strengths: [Specific technical strengths]\n" +
                "- Areas for Development: [Technical gaps]\n\n" +
                "### 💬 Communication Skills (X/10)\n" +
                "- Strengths: [Communication positives]\n" +
                "- Areas for Development: [Communication improvements]\n\n" +
                "### 📈 Experience & Impact (X/10)\n" +
                "- Key Achievements: [Notable accomplishments]\n" +
                "- Experience Gaps: [Missing relevant experience]\n\n" +
                "### 🤝 Behavioral Fit (X/10)\n" +
                "- Cultural Alignment: [Fit observations]\n" +
                "- Development Areas: [Behavioral improvements]\n\n" +
                "## 🎯 Key Recommendations\n" +
                "1. [Priority recommendation 1]\n" +
                "2. [Priority recommendation 2]\n" +
                "3. [Priority recommendation 3]\n\n" +
                "## 📊 Hiring Recommendation\n" +
                "[Strong Hire / Hire / No Hire] - [Justification]";


        return callGeminiAPI(prompt);
    }

    private String callGeminiAPI(String prompt) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", List.of(part));
            requestBody.put("contents", List.of(content));
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            
            // Parse the response to extract the generated text
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content2 = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content2.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            
            return "AI service temporarily unavailable. Please try again later.";
        } catch (Exception e) {
            e.printStackTrace();
            return "AI service temporarily unavailable. Please try again later.";
        }
    }

    private List<Question> parseQuestionsFromJson(String jsonResponse, Resume resume) {
        try {
            // 🧹 Remove markdown formatting (```json ... ```)
            String cleaned = jsonResponse
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            ObjectMapper mapper = new ObjectMapper();

            // ✅ Use TypeReference to parse JSON array into List<QuestionResponseDto>
            List<QuestionResponseDto> feedback = mapper.readValue(
                    cleaned,
                    new com.fasterxml.jackson.core.type.TypeReference<List<QuestionResponseDto>>() {}
            );

            System.out.println("Parsed Feedback: " + feedback);

            // ✅ Convert DTOs to Entity
            List<Question> questions = new ArrayList<>();
            for (QuestionResponseDto q : feedback) {
                questions.add(new Question(
                        q.getQuestionText(),
                        q.getQuestionType(),
                        q.getDifficultyLevel(),
                        resume
                ));
            }

            return questions;

        } catch (Exception e) {
            log.error("Error parsing JSON feedback: ", e);
           // safer than null
        }
        return null;
    }
}
