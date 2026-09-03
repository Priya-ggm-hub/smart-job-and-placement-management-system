package com.placement.repository;

import com.placement.entity.Interview;
import com.placement.entity.enums.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationId(Long applicationId);
    Optional<Interview> findFirstByApplicationIdOrderByIdDesc(Long applicationId);

    @Query("SELECT i FROM Interview i WHERE i.application.student.id = :studentId ORDER BY i.interviewDate DESC, i.interviewTime DESC")
    List<Interview> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT i FROM Interview i WHERE i.interviewDate >= :fromDate ORDER BY i.interviewDate ASC, i.interviewTime ASC")
    List<Interview> findUpcomingInterviews(@Param("fromDate") LocalDate fromDate);

    long countByStatus(InterviewStatus status);
}
