package com.placement;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PasswordValidationTest {

    @Test
    @DisplayName("Verify BCrypt password encoding matches Admin@123 and Password@123")
    void testPasswordMatches() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String adminHash = "$2a$10$6bFOhzG31.OlaXc3ses/muUfIZrENSuAuulkMwwj43/jzgu5PHnmG";
        String studentHash = "$2a$10$24hx5FgZO6MUHJ1yfPxPZ.N0lPFWH1PABofHpVTh2msqAQBmcL6JK";

        assertTrue(encoder.matches("Admin@123", adminHash), "Admin hash must match Admin@123");
        assertTrue(encoder.matches("Password@123", studentHash), "Student hash must match Password@123");

        String dynamicAdminHash = encoder.encode("Admin@123");
        String dynamicStudentHash = encoder.encode("Password@123");

        assertTrue(encoder.matches("Admin@123", dynamicAdminHash));
        assertTrue(encoder.matches("Password@123", dynamicStudentHash));
    }
}
