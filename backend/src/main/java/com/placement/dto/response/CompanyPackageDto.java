package com.placement.dto.response;

public class CompanyPackageDto {
    private String companyName;
    private double averagePackageLPA;
    private long totalOpenings;

    public CompanyPackageDto() {}

    public CompanyPackageDto(String companyName, double averagePackageLPA, long totalOpenings) {
        this.companyName = companyName;
        this.averagePackageLPA = averagePackageLPA;
        this.totalOpenings = totalOpenings;
    }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public double getAveragePackageLPA() { return averagePackageLPA; }
    public void setAveragePackageLPA(double averagePackageLPA) { this.averagePackageLPA = averagePackageLPA; }

    public long getTotalOpenings() { return totalOpenings; }
    public void setTotalOpenings(long totalOpenings) { this.totalOpenings = totalOpenings; }
}
