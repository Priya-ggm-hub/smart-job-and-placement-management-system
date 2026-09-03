package com.placement.service;

import com.placement.dto.response.BulkUploadErrorDto;
import com.placement.dto.response.BulkUploadResultDto;
import com.placement.entity.Skill;
import com.placement.entity.Student;
import com.placement.entity.User;
import com.placement.entity.enums.NotificationType;
import com.placement.entity.enums.Role;
import com.placement.exception.BadRequestException;
import com.placement.repository.SkillRepository;
import com.placement.repository.StudentRepository;
import com.placement.repository.UserRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class BulkUploadService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public BulkUploadResultDto processBulkStudentUpload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty.");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return processExcelFile(file);
        } else if (filename.endsWith(".csv")) {
            return processCsvFile(file);
        } else {
            throw new BadRequestException("Unsupported file type. Please upload an Excel (.xlsx) or CSV (.csv) file.");
        }
    }

    private BulkUploadResultDto processExcelFile(MultipartFile file) {
        List<BulkUploadErrorDto> errors = new ArrayList<>();
        Set<String> fileEmails = new HashSet<>();
        int totalRows = 0;
        int successCount = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new BadRequestException("Excel workbook does not contain any sheets.");
            }

            // Read header row (Row 0)
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new BadRequestException("Excel file is empty or missing headers.");
            }

            int rowIdx = 0;
            for (Row row : sheet) {
                rowIdx++;
                if (rowIdx == 1) continue; // Skip header

                if (isRowEmpty(row)) continue;

                totalRows++;
                int actualRowNumber = rowIdx;

                try {
                    String name = getCellValueAsString(row.getCell(0));
                    String email = getCellValueAsString(row.getCell(1));
                    String phone = getCellValueAsString(row.getCell(2));
                    String department = getCellValueAsString(row.getCell(3));
                    String degree = getCellValueAsString(row.getCell(4));
                    String gradYearStr = getCellValueAsString(row.getCell(5));
                    String cgpaStr = getCellValueAsString(row.getCell(6));
                    String skillsStr = getCellValueAsString(row.getCell(7));

                    // Validate row
                    String error = validateStudentData(name, email, department, degree, gradYearStr, cgpaStr, fileEmails);
                    if (error != null) {
                        errors.add(new BulkUploadErrorDto(actualRowNumber, email, error));
                        continue;
                    }

                    int gradYear = Integer.parseInt(gradYearStr.trim());
                    BigDecimal cgpa = new BigDecimal(cgpaStr.trim());
                    String cleanEmail = email.trim().toLowerCase();
                    fileEmails.add(cleanEmail);

                    createAndSaveStudent(name.trim(), cleanEmail, phone, department.trim().toUpperCase(), degree.trim(), gradYear, cgpa, skillsStr);
                    successCount++;

                } catch (Exception ex) {
                    errors.add(new BulkUploadErrorDto(actualRowNumber, "Row " + actualRowNumber, "Data error: " + ex.getMessage()));
                }
            }

        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Error processing Excel file: " + ex.getMessage());
        }

        return new BulkUploadResultDto(totalRows, successCount, errors.size(), errors);
    }

    private BulkUploadResultDto processCsvFile(MultipartFile file) {
        List<BulkUploadErrorDto> errors = new ArrayList<>();
        Set<String> fileEmails = new HashSet<>();
        int totalRows = 0;
        int successCount = 0;

        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .setIgnoreEmptyLines(true)
                .build();

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVParser csvParser = csvFormat.parse(reader)) {

            int rowIdx = 1;
            for (CSVRecord record : csvParser) {
                rowIdx++;
                totalRows++;

                try {
                    String name = record.isSet("Name") ? record.get("Name") : (record.size() > 0 ? record.get(0) : "");
                    String email = record.isSet("Email") ? record.get("Email") : (record.size() > 1 ? record.get(1) : "");
                    String phone = record.isSet("Phone") ? record.get("Phone") : (record.size() > 2 ? record.get(2) : "");
                    String department = record.isSet("Department") ? record.get("Department") : (record.size() > 3 ? record.get(3) : "");
                    String degree = record.isSet("Degree") ? record.get("Degree") : (record.size() > 4 ? record.get(4) : "");
                    String gradYearStr = record.isSet("GraduationYear") ? record.get("GraduationYear") : (record.size() > 5 ? record.get(5) : "");
                    String cgpaStr = record.isSet("CGPA") ? record.get("CGPA") : (record.size() > 6 ? record.get(6) : "");
                    String skillsStr = record.isSet("Skills") ? record.get("Skills") : (record.size() > 7 ? record.get(7) : "");

                    String error = validateStudentData(name, email, department, degree, gradYearStr, cgpaStr, fileEmails);
                    if (error != null) {
                        errors.add(new BulkUploadErrorDto(rowIdx, email, error));
                        continue;
                    }

                    int gradYear = Integer.parseInt(gradYearStr.trim());
                    BigDecimal cgpa = new BigDecimal(cgpaStr.trim());
                    String cleanEmail = email.trim().toLowerCase();
                    fileEmails.add(cleanEmail);

                    createAndSaveStudent(name.trim(), cleanEmail, phone, department.trim().toUpperCase(), degree.trim(), gradYear, cgpa, skillsStr);
                    successCount++;

                } catch (Exception ex) {
                    errors.add(new BulkUploadErrorDto(rowIdx, "Row " + rowIdx, "Data error: " + ex.getMessage()));
                }
            }

        } catch (Exception ex) {
            throw new BadRequestException("Error processing CSV file: " + ex.getMessage());
        }

        return new BulkUploadResultDto(totalRows, successCount, errors.size(), errors);
    }

    private String validateStudentData(String name, String email, String department, String degree, String gradYearStr, String cgpaStr, Set<String> fileEmails) {
        if (name == null || name.trim().isEmpty()) return "Full name is required";
        if (email == null || email.trim().isEmpty()) return "Email is required";
        if (!EMAIL_PATTERN.matcher(email.trim()).matches()) return "Invalid email address format";

        String cleanEmail = email.trim().toLowerCase();
        if (fileEmails.contains(cleanEmail)) return "Duplicate email found in file";
        if (userRepository.existsByEmail(cleanEmail)) return "Email already exists in system";

        if (department == null || department.trim().isEmpty()) return "Department is required";
        if (degree == null || degree.trim().isEmpty()) return "Degree is required";

        if (gradYearStr == null || gradYearStr.trim().isEmpty()) return "Graduation year is required";
        try {
            int year = Integer.parseInt(gradYearStr.trim());
            if (year < 2020 || year > 2035) return "Graduation year must be between 2020 and 2035";
        } catch (NumberFormatException e) {
            return "Invalid graduation year format";
        }

        if (cgpaStr == null || cgpaStr.trim().isEmpty()) return "CGPA is required";
        try {
            BigDecimal cgpa = new BigDecimal(cgpaStr.trim());
            if (cgpa.compareTo(BigDecimal.ZERO) < 0 || cgpa.compareTo(BigDecimal.TEN) > 0) {
                return "CGPA must be between 0.0 and 10.0";
            }
        } catch (Exception e) {
            return "Invalid CGPA format";
        }

        return null;
    }

    private void createAndSaveStudent(String name, String email, String phone, String department, String degree, int gradYear, BigDecimal cgpa, String skillsStr) {
        User user = new User(
                email,
                passwordEncoder.encode("Student@123"), // Default temporary password
                Role.ROLE_STUDENT
        );
        User savedUser = userRepository.save(user);

        Student student = new Student();
        student.setUser(savedUser);
        student.setFullName(name);
        student.setPhone(phone != null && !phone.trim().isEmpty() ? phone.trim() : null);
        student.setDepartment(department);
        student.setDegree(degree);
        student.setGraduationYear(gradYear);
        student.setCgpa(cgpa);
        student.setProfileCompleted(true);

        if (skillsStr != null && !skillsStr.trim().isEmpty()) {
            Set<Skill> skills = new HashSet<>();
            String[] skillTokens = skillsStr.split("[,;|]");
            for (String token : skillTokens) {
                String clean = token.trim();
                if (!clean.isEmpty()) {
                    Skill skill = skillRepository.findByNameIgnoreCase(clean)
                            .orElseGet(() -> skillRepository.save(new Skill(clean)));
                    skills.add(skill);
                }
            }
            student.setSkills(skills);
        }

        Student savedStudent = studentRepository.save(student);

        // Send onboarding notification
        notificationService.createNotification(
                savedStudent,
                "Welcome to Campus Placement Portal",
                "Your account was created by the placement cell. Your initial login password is 'Student@123'. Please change your password upon first login.",
                NotificationType.SYSTEM
        );
    }

    public Resource generateSampleTemplate() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Students Template");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] columns = {"Name", "Email", "Phone", "Department", "Degree", "GraduationYear", "CGPA", "Skills"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample Data Rows
            Object[][] sampleData = {
                    {"Aarav Mehta", "aarav.mehta@college.edu", "+91 9876543220", "CSE", "B.Tech", 2025, 8.65, "Java, Spring Boot, SQL, Git"},
                    {"Sneha Reddy", "sneha.reddy@college.edu", "+91 9876543221", "ECE", "B.Tech", 2025, 7.80, "Python, React, JavaScript"},
                    {"Rohan Gupta", "rohan.gupta@college.edu", "+91 9876543222", "IT", "B.Tech", 2025, 8.10, "AWS, Docker, Linux, Git"},
                    {"Kavya Joshi", "kavya.joshi@college.edu", "+91 9876543223", "MECH", "B.Tech", 2025, 7.50, "C++, Python, Data Structures"}
            };

            int rowIdx = 1;
            for (Object[] rowData : sampleData) {
                Row row = sheet.createRow(rowIdx++);
                for (int colIdx = 0; colIdx < rowData.length; colIdx++) {
                    Cell cell = row.createCell(colIdx);
                    if (rowData[colIdx] instanceof Number) {
                        cell.setCellValue(((Number) rowData[colIdx]).doubleValue());
                    } else {
                        cell.setCellValue((String) rowData[colIdx]);
                    }
                }
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayResource(out.toByteArray());
        } catch (Exception ex) {
            throw new BadRequestException("Could not generate sample template: " + ex.getMessage());
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double num = cell.getNumericCellValue();
                if (num == Math.floor(num)) {
                    return String.format("%.0f", num);
                }
                return String.valueOf(num);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValueAsString(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }
}
