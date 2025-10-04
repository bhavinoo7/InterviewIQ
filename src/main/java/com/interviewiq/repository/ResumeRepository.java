package com.interviewiq.repository;

import com.interviewiq.dto.ResumeResponseDto;
import com.interviewiq.dto.ResumeUploadResponse;
import com.interviewiq.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserIdOrderByUploadedAtDesc(Long userId);
    List<Resume> findByUserIdAndParsedContentIsNotNull(Long userId);
    @Query("SELECT new com.interviewiq.dto.ResumeResponseDto(r.id,r.fileName,r.uploadedAt) FROM Resume r WHERE r.user.id = :userId Order By r.uploadedAt DESC")
    List<ResumeResponseDto> findAllResumeIdsByUserId(@Param("userId") Long userId);

}
