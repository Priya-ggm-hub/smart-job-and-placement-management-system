package com.placement.dto.response;

public class DashboardSummaryDto {
    private long totalStudents;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;
    private long shortlistedCount;
    private long selectedCount;
    private long rejectedCount;
    private long upcomingInterviewsCount;
    private double overallPlacementRate;

    public DashboardSummaryDto() {}

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalCompanies() { return totalCompanies; }
    public void setTotalCompanies(long totalCompanies) { this.totalCompanies = totalCompanies; }

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(long shortlistedCount) { this.shortlistedCount = shortlistedCount; }

    public long getSelectedCount() { return selectedCount; }
    public void setSelectedCount(long selectedCount) { this.selectedCount = selectedCount; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public long getUpcomingInterviewsCount() { return upcomingInterviewsCount; }
    public void setUpcomingInterviewsCount(long upcomingInterviewsCount) { this.upcomingInterviewsCount = upcomingInterviewsCount; }

    public double getOverallPlacementRate() { return overallPlacementRate; }
    public void setOverallPlacementRate(double overallPlacementRate) { this.overallPlacementRate = overallPlacementRate; }
}
