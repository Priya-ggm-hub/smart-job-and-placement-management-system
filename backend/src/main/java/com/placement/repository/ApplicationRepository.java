package com.placement.repository;

import com.placement.entity.Application;
import com.placement.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    List<Application> findByJobId(Long jobId);
    Optional<Application> findByStudentIdAndJobId(Long studentId, Long jobId);
    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

    @Query("SELECT a FROM Application a WHERE " +
           "(:jobId IS NULL OR a.job.id = :jobId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:query IS NULL OR LOWER(a.student.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.student.user.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Application> filterApplications(
        @Param("jobId") Long jobId,
        @Param("status") ApplicationStatus status,
        @Param("query") String query,
        Pageable pageable
    );

    long countByStatus(ApplicationStatus status);

    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT a.student.department, COUNT(a) FROM Application a WHERE a.status = 'SELECTED' GROUP BY a.student.department")
    List<Object[]> countPlacedStudentsByDepartment();
}
