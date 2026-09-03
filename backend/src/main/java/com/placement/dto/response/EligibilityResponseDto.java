package com.placement.dto.response;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class EligibilityResponseDto {
    private boolean eligible;
    private List<String> reasons = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> matchedSkills = new ArrayList<>();
    private List<SkillResourceDto> learningResources = new ArrayList<>();

    private boolean cgpaSatisfied;
    private boolean departmentSatisfied;
    private boolean graduationYearSatisfied;
    private boolean skillsSatisfied;

    private BigDecimal studentCgpa;
    private BigDecimal minCgpaRequired;
    private String studentDepartment;
    private String eligibleDepartment;
    private boolean alreadyApplied;
    private boolean deadlinePassed;

    public EligibilityResponseDto() {}

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<SkillResourceDto> getLearningResources() { return learningResources; }
    public void setLearningResources(List<SkillResourceDto> learningResources) { this.learningResources = learningResources; }

    public boolean isCgpaSatisfied() { return cgpaSatisfied; }
    public void setCgpaSatisfied(boolean cgpaSatisfied) { this.cgpaSatisfied = cgpaSatisfied; }

    public boolean isDepartmentSatisfied() { return departmentSatisfied; }
    public void setDepartmentSatisfied(boolean departmentSatisfied) { this.departmentSatisfied = departmentSatisfied; }

    public boolean isGraduationYearSatisfied() { return graduationYearSatisfied; }
    public void setGraduationYearSatisfied(boolean graduationYearSatisfied) { this.graduationYearSatisfied = graduationYearSatisfied; }

    public boolean isSkillsSatisfied() { return skillsSatisfied; }
    public void setSkillsSatisfied(boolean skillsSatisfied) { this.skillsSatisfied = skillsSatisfied; }

    public BigDecimal getStudentCgpa() { return studentCgpa; }
    public void setStudentCgpa(BigDecimal studentCgpa) { this.studentCgpa = studentCgpa; }

    public BigDecimal getMinCgpaRequired() { return minCgpaRequired; }
    public void setMinCgpaRequired(BigDecimal minCgpaRequired) { this.minCgpaRequired = minCgpaRequired; }

    public String getStudentDepartment() { return studentDepartment; }
    public void setStudentDepartment(String studentDepartment) { this.studentDepartment = studentDepartment; }

    public String getEligibleDepartment() { return eligibleDepartment; }
    public void setEligibleDepartment(String eligibleDepartment) { this.eligibleDepartment = eligibleDepartment; }

    public boolean isAlreadyApplied() { return alreadyApplied; }
    public void setAlreadyApplied(boolean alreadyApplied) { this.alreadyApplied = alreadyApplied; }

    public boolean isDeadlinePassed() { return deadlinePassed; }
    public void setDeadlinePassed(boolean deadlinePassed) { this.deadlinePassed = deadlinePassed; }
}
