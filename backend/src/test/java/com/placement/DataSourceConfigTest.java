package com.placement;

import com.placement.config.DataSourceConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataSourceConfigTest {

    @Test
    @DisplayName("Verify resolveConfig correctly extracts credentials and converts mysql:// URI into jdbc:mysql://")
    void testMysqlUrlParsing() {
        String testUrl = "mysql://root:secretPass123@junction.proxy.rlwy.net:54321/railway";
        DataSourceConfig.ResolvedDbConfig config = DataSourceConfig.resolveConfig(testUrl, "oldUser", "oldPass");

        assertEquals("root", config.username);
        assertEquals("secretPass123", config.password);
        assertTrue(config.jdbcUrl.startsWith("jdbc:mysql://junction.proxy.rlwy.net:54321/railway"));
        assertTrue(config.jdbcUrl.contains("allowPublicKeyRetrieval=true"));
        assertTrue(config.jdbcUrl.contains("createDatabaseIfNotExist=true"));
    }

    @Test
    @DisplayName("Verify appendJdbcParams preserves existing query parameters and adds required flags")
    void testAppendJdbcParams() {
        String base = "jdbc:mysql://localhost:3306/railway?custom=true";
        String appended = DataSourceConfig.appendJdbcParams(base);

        assertTrue(appended.startsWith("jdbc:mysql://localhost:3306/railway?custom=true&"));
        assertTrue(appended.contains("allowPublicKeyRetrieval=true"));
        assertTrue(appended.contains("useSSL=false"));
        assertTrue(appended.contains("serverTimezone=UTC"));
        assertTrue(appended.contains("createDatabaseIfNotExist=true"));
    }
}
