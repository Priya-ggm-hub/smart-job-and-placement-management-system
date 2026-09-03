package com.placement.repository;

import com.placement.entity.SkillResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface SkillResourceRepository extends JpaRepository<SkillResource, Long> {
    Optional<SkillResource> findBySkillNameIgnoreCase(String skillName);
    List<SkillResource> findBySkillNameInIgnoreCase(Set<String> skillNames);
}
