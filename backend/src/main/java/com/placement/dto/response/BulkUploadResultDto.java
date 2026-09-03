package com.placement.dto.response;

import java.util.ArrayList;
import java.util.List;

public class BulkUploadResultDto {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<BulkUploadErrorDto> errors = new ArrayList<>();

    public BulkUploadResultDto() {}

    public BulkUploadResultDto(int totalRows, int successCount, int failureCount, List<BulkUploadErrorDto> errors) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.errors = errors != null ? errors : new ArrayList<>();
    }

    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }

    public List<BulkUploadErrorDto> getErrors() { return errors; }
    public void setErrors(List<BulkUploadErrorDto> errors) { this.errors = errors; }
}
