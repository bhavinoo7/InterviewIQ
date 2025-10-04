package com.interviewiq.repository;

import com.interviewiq.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByResumeIdOrderByCreatedAtAsc(Long resumeId);
    List<Question> findByResumeIdAndQuestionType(Long resumeId, String questionType);
}
