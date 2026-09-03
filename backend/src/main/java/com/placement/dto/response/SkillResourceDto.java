package com.placement.dto.response;

public class SkillResourceDto {
    private String skillName;
    private String resourceTitle;
    private String resourceUrl;
    private String description;

    public SkillResourceDto() {}

    public SkillResourceDto(String skillName, String resourceTitle, String resourceUrl, String description) {
        this.skillName = skillName;
        this.resourceTitle = resourceTitle;
        this.resourceUrl = resourceUrl;
        this.description = description;
    }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getResourceTitle() { return resourceTitle; }
    public void setResourceTitle(String resourceTitle) { this.resourceTitle = resourceTitle; }

    public String getResourceUrl() { return resourceUrl; }
    public void setResourceUrl(String resourceUrl) { this.resourceUrl = resourceUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
