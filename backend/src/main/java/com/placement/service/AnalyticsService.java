package com.placement.service;

import com.placement.dto.response.CompanyPackageDto;
import com.placement.dto.response.DashboardSummaryDto;
import com.placement.dto.response.DepartmentStatsDto;
import com.placement.dto.response.FunnelStatsDto;
import com.placement.entity.Application;
import com.placement.entity.Interview;
import com.placement.entity.enums.ApplicationStatus;
import com.placement.entity.enums.InterviewStatus;
import com.placement.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    private static final Pattern LPA_PATTERN = Pattern.compile("([0-9]+(\\.[0-9]+)?)");

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        DashboardSummaryDto dto = new DashboardSummaryDto();

        long totalStudents = studentRepository.count();
        long totalCompanies = companyRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();

        long shortlisted = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long selected = applicationRepository.countByStatus(ApplicationStatus.SELECTED);
        long rejected = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        long upcomingInterviews = interviewRepository.findUpcomingInterviews(LocalDate.now()).size();

        dto.setTotalStudents(totalStudents);
        dto.setTotalCompanies(totalCompanies);
        dto.setTotalJobs(totalJobs);
        dto.setTotalApplications(totalApplications);
        dto.setShortlistedCount(shortlisted);
        dto.setSelectedCount(selected);
        dto.setRejectedCount(rejected);
        dto.setUpcomingInterviewsCount(upcomingInterviews);

        double placementRate = totalStudents > 0 ? ((double) selected / totalStudents) * 100.0 : 0.0;
        dto.setOverallPlacementRate(Math.round(placementRate * 100.0) / 100.0);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<DepartmentStatsDto> getDepartmentStats() {
        List<Object[]> deptCounts = studentRepository.countStudentsByDepartment();
        Map<String, Long> totalMap = new HashMap<>();
        for (Object[] row : deptCounts) {
            String dept = (String) row[0];
            Long count = (Long) row[1];
            totalMap.put(dept, count);
        }

        List<Object[]> placedCounts = applicationRepository.countPlacedStudentsByDepartment();
        Map<String, Long> placedMap = new HashMap<>();
        for (Object[] row : placedCounts) {
            String dept = (String) row[0];
            Long count = (Long) row[1];
            placedMap.put(dept, count);
        }

        List<DepartmentStatsDto> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : totalMap.entrySet()) {
            String dept = entry.getKey();
            long total = entry.getValue();
            long placed = placedMap.getOrDefault(dept, 0L);
            double pct = total > 0 ? ((double) placed / total) * 100.0 : 0.0;

            result.add(new DepartmentStatsDto(dept, total, placed, Math.round(pct * 10.0) / 10.0));
        }

        result.sort(Comparator.comparing(DepartmentStatsDto::getDepartment));
        return result;
    }

    @Transactional(readOnly = true)
    public List<CompanyPackageDto> getCompanyPackages() {
        List<Object[]> rawPackages = jobRepository.findCompanyPackages();
        Map<String, List<Double>> companyToSalaries = new HashMap<>();

        for (Object[] row : rawPackages) {
            String companyName = (String) row[0];
            String salaryStr = (String) row[1];

            if (companyName != null && salaryStr != null) {
                Matcher matcher = LPA_PATTERN.matcher(salaryStr);
                if (matcher.find()) {
                    try {
                        double val = Double.parseDouble(matcher.group(1));
                        companyToSalaries.computeIfAbsent(companyName, k -> new ArrayList<>()).add(val);
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        List<CompanyPackageDto> result = new ArrayList<>();
        for (Map.Entry<String, List<Double>> entry : companyToSalaries.entrySet()) {
            String company = entry.getKey();
            List<Double> salaries = entry.getValue();
            double avg = salaries.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            result.add(new CompanyPackageDto(company, Math.round(avg * 100.0) / 100.0, salaries.size()));
        }

        result.sort((a, b) -> Double.compare(b.getAveragePackageLPA(), a.getAveragePackageLPA()));
        return result;
    }

    @Transactional(readOnly = true)
    public List<FunnelStatsDto> getFunnelStats() {
        List<FunnelStatsDto> funnel = new ArrayList<>();

        long applied = applicationRepository.count();
        long shortlisted = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long interviewed = applicationRepository.countByStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        long selected = applicationRepository.countByStatus(ApplicationStatus.SELECTED);
        long rejected = applicationRepository.countByStatus(ApplicationStatus.REJECTED);

        funnel.add(new FunnelStatsDto("Total Applied", applied));
        funnel.add(new FunnelStatsDto("Shortlisted", shortlisted));
        funnel.add(new FunnelStatsDto("Interview Scheduled", interviewed));
        funnel.add(new FunnelStatsDto("Selected (Offers)", selected));
        funnel.add(new FunnelStatsDto("Rejected", rejected));

        return funnel;
    }

    @Transactional(readOnly = true)
    public Resource exportPlacementReportCsv() {
        List<Application> applications = applicationRepository.findAll();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             Writer writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                     "Application ID", "Student Name", "Email", "Phone", "Department", "Degree",
                     "CGPA", "Company", "Job Title", "Salary Package", "Application Date", "Status", "Remarks"
             ))) {

            for (Application app : applications) {
                csvPrinter.printRecord(
                        app.getId(),
                        app.getStudent() != null ? app.getStudent().getFullName() : "N/A",
                        app.getStudent() != null && app.getStudent().getUser() != null ? app.getStudent().getUser().getEmail() : "N/A",
                        app.getStudent() != null ? app.getStudent().getPhone() : "N/A",
                        app.getStudent() != null ? app.getStudent().getDepartment() : "N/A",
                        app.getStudent() != null ? app.getStudent().getDegree() : "N/A",
                        app.getStudent() != null && app.getStudent().getCgpa() != null ? app.getStudent().getCgpa().toString() : "N/A",
                        app.getJob() != null && app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "N/A",
                        app.getJob() != null ? app.getJob().getTitle() : "N/A",
                        app.getJob() != null ? app.getJob().getSalaryPackage() : "N/A",
                        app.getApplicationDate() != null ? app.getApplicationDate().toString() : "N/A",
                        app.getStatus() != null ? app.getStatus().name() : "N/A",
                        app.getRemarks() != null ? app.getRemarks() : ""
                );
            }

            csvPrinter.flush();
            return new ByteArrayResource(out.toByteArray());
        } catch (Exception ex) {
            throw new RuntimeException("Error generating CSV report: " + ex.getMessage(), ex);
        }
    }
}
