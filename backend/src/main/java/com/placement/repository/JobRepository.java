package com.placement.repository;

import com.placement.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(String status);
    List<Job> findByCompanyId(Long companyId);

    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND j.deadline >= :currentDate")
    List<Job> findActiveJobs(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT j FROM Job j WHERE " +
           "(:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:department IS NULL OR :department = 'ALL' OR j.eligibleDepartment = 'ALL' OR LOWER(j.eligibleDepartment) = LOWER(:department)) AND " +
           "(:employmentType IS NULL OR LOWER(j.employmentType) = LOWER(:employmentType)) AND " +
           "(:status IS NULL OR j.status = :status)")
    Page<Job> filterJobs(
        @Param("query") String query,
        @Param("department") String department,
        @Param("employmentType") String employmentType,
        @Param("status") String status,
        Pageable pageable
    );

    @Query("SELECT j.company.name, j.salaryPackage FROM Job j WHERE j.salaryPackage IS NOT NULL")
    List<Object[]> findCompanyPackages();
}
