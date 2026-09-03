package com.placement.dto.response;

public class FunnelStatsDto {
    private String stage;
    private long count;

    public FunnelStatsDto() {}

    public FunnelStatsDto(String stage, long count) {
        this.stage = stage;
        this.count = count;
    }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
