package com.placement.service;

import com.placement.dto.request.CompanyRequest;
import com.placement.dto.response.CompanyDto;
import com.placement.entity.Company;
import com.placement.exception.BadRequestException;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDto getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return mapToDto(company);
    }

    @Transactional
    public CompanyDto createCompany(CompanyRequest request) {
        if (companyRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Company with name '" + request.getName() + "' already exists.");
        }

        Company company = new Company();
        company.setName(request.getName().trim());
        company.setDescription(request.getDescription());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        company.setContactEmail(request.getContactEmail());

        Company saved = companyRepository.save(company);
        return mapToDto(saved);
    }

    @Transactional
    public CompanyDto updateCompany(Long id, CompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        // Check if name is taken by another company
        companyRepository.findByNameIgnoreCase(request.getName().trim()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Company with name '" + request.getName() + "' already exists.");
            }
        });

        company.setName(request.getName().trim());
        company.setDescription(request.getDescription());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        company.setContactEmail(request.getContactEmail());

        Company updated = companyRepository.save(company);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        companyRepository.delete(company);
    }

    public CompanyDto mapToDto(Company company) {
        CompanyDto dto = new CompanyDto();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setDescription(company.getDescription());
        dto.setIndustry(company.getIndustry());
        dto.setLocation(company.getLocation());
        dto.setWebsite(company.getWebsite());
        dto.setContactEmail(company.getContactEmail());
        dto.setCreatedAt(company.getCreatedAt());
        return dto;
    }
}
