package com.placement.dto.response;

public class BulkUploadErrorDto {
    private int rowNumber;
    private String email;
    private String reason;

    public BulkUploadErrorDto() {}

    public BulkUploadErrorDto(int rowNumber, String email, String reason) {
        this.rowNumber = rowNumber;
        this.email = email;
        this.reason = reason;
    }

    public int getRowNumber() { return rowNumber; }
    public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
