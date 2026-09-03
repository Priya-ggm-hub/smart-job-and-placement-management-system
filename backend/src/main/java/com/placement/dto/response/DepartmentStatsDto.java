package com.placement.dto.response;

public class DepartmentStatsDto {
    private String department;
    private long totalStudents;
    private long placedStudents;
    private double placementPercentage;

    public DepartmentStatsDto() {}

    public DepartmentStatsDto(String department, long totalStudents, long placedStudents, double placementPercentage) {
        this.department = department;
        this.totalStudents = totalStudents;
        this.placedStudents = placedStudents;
        this.placementPercentage = placementPercentage;
    }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getPlacedStudents() { return placedStudents; }
    public void setPlacedStudents(long placedStudents) { this.placedStudents = placedStudents; }

    public double getPlacementPercentage() { return placementPercentage; }
    public void setPlacementPercentage(double placementPercentage) { this.placementPercentage = placementPercentage; }
}
