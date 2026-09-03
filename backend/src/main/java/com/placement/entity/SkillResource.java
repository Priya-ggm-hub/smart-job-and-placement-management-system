package com.placement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "skill_resources")
public class SkillResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_name", nullable = false, unique = true, length = 50)
    private String skillName;

    @Column(name = "resource_title", nullable = false, length = 100)
    private String resourceTitle;

    @Column(name = "resource_url", nullable = false, length = 255)
    private String resourceUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    public SkillResource() {}

    public SkillResource(String skillName, String resourceTitle, String resourceUrl, String description) {
        this.skillName = skillName;
        this.resourceTitle = resourceTitle;
        this.resourceUrl = resourceUrl;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getResourceTitle() { return resourceTitle; }
    public void setResourceTitle(String resourceTitle) { this.resourceTitle = resourceTitle; }

    public String getResourceUrl() { return resourceUrl; }
    public void setResourceUrl(String resourceUrl) { this.resourceUrl = resourceUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
