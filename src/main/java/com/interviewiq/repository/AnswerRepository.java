package com.interviewiq.repository;

import com.interviewiq.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByInterviewIdOrderByAnsweredAtAsc(Long interviewId);
    List<Answer> findByQuestionId(Long questionId);
}
