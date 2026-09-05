package com.placement.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    private static final Pattern MYSQL_URI_PATTERN = Pattern.compile(
            "^(?:jdbc:)?(?:mysql|mariadb)://(?:([^:@]+)(?::([^@]*))?@)?([^:/]+)(?::(\\d+))?(?:/([^?#]*))?(?:\\?(.*))?$",
            Pattern.CASE_INSENSITIVE
    );

    public static class ResolvedDbConfig {
        public String jdbcUrl;
        public String username;
        public String password;

        public ResolvedDbConfig(String jdbcUrl, String username, String password) {
            this.jdbcUrl = jdbcUrl;
            this.username = username;
            this.password = password;
        }
    }

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${spring.datasource.url:}") String configUrl,
            @Value("${spring.datasource.username:}") String configUsername,
            @Value("${spring.datasource.password:}") String configPassword,
            @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}") String driverClassName) {

        ResolvedDbConfig resolved = resolveConfig(configUrl, configUsername, configPassword);

        logger.info("Initializing HikariDataSource with JDBC URL: {} and Username: {}", maskUrl(resolved.jdbcUrl), resolved.username);

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(resolved.jdbcUrl);
        hikariConfig.setUsername(resolved.username);
        hikariConfig.setPassword(resolved.password);
        hikariConfig.setDriverClassName(driverClassName);
        hikariConfig.setMaximumPoolSize(10);
        hikariConfig.setMinimumIdle(2);
        hikariConfig.setConnectionTimeout(20000);
        hikariConfig.setValidationTimeout(5000);
        hikariConfig.setIdleTimeout(600000);
        hikariConfig.setMaxLifetime(1800000);
        hikariConfig.setInitializationFailTimeout(30000);

        return new HikariDataSource(hikariConfig);
    }

    public static ResolvedDbConfig resolveConfig(String configUrl, String configUsername, String configPassword) {
        // Priority 1: Railway MySQL URLs (prioritized over legacy DB_* vars)
        String rawUrl = getFirstNonEmpty(
                System.getenv("MYSQL_URL"),
                System.getenv("MYSQL_PRIVATE_URL"),
                System.getenv("MYSQL_PUBLIC_URL"),
                System.getenv("DATABASE_URL"),
                System.getenv("MYSQLURL"),
                System.getenv("SPRING_DATASOURCE_URL"),
                System.getenv("DB_URL"),
                configUrl
        );

        String host = getFirstNonEmpty(
                System.getenv("MYSQLHOST"),
                System.getenv("MYSQL_HOST"),
                System.getenv("DB_HOST")
        );
        String port = getFirstNonEmpty(
                System.getenv("MYSQLPORT"),
                System.getenv("MYSQL_PORT"),
                System.getenv("DB_PORT")
        );
        String database = getFirstNonEmpty(
                System.getenv("MYSQLDATABASE"),
                System.getenv("MYSQL_DATABASE"),
                System.getenv("DB_NAME")
        );
        String username = getFirstNonEmpty(
                System.getenv("MYSQLUSER"),
                System.getenv("MYSQL_USER"),
                System.getenv("SPRING_DATASOURCE_USERNAME"),
                System.getenv("DB_USERNAME"),
                System.getenv("DB_USER"),
                configUsername
        );
        String password = getFirstNonEmpty(
                System.getenv("MYSQLPASSWORD"),
                System.getenv("MYSQL_PASSWORD"),
                System.getenv("SPRING_DATASOURCE_PASSWORD"),
                System.getenv("DB_PASSWORD"),
                configPassword
        );

        String finalJdbcUrl = null;
        String finalUsername = username;
        String finalPassword = password;

        if (rawUrl != null && !rawUrl.isBlank()) {
            Matcher matcher = MYSQL_URI_PATTERN.matcher(rawUrl.trim());
            if (matcher.matches()) {
                String uriUser = matcher.group(1);
                String uriPass = matcher.group(2);
                String uriHost = matcher.group(3);
                String uriPort = matcher.group(4);
                String uriDb = matcher.group(5);
                String uriQuery = matcher.group(6);

                // When credentials are embedded in MYSQL_URL, they take precedence
                if (uriUser != null && !uriUser.isBlank()) {
                    finalUsername = uriUser;
                }
                if (uriPass != null) {
                    finalPassword = uriPass;
                }

                String effectivePort = (uriPort != null && !uriPort.isBlank()) ? uriPort : ((port != null && !port.isBlank()) ? port : "3306");
                String effectiveDb = (uriDb != null && !uriDb.isBlank()) ? uriDb : ((database != null && !database.isBlank()) ? database : "railway");

                String base = "jdbc:mysql://" + uriHost + ":" + effectivePort + "/" + effectiveDb;
                if (uriQuery != null && !uriQuery.isBlank()) {
                    base += "?" + uriQuery;
                }
                finalJdbcUrl = appendJdbcParams(base);
            } else if (rawUrl.startsWith("jdbc:")) {
                finalJdbcUrl = appendJdbcParams(rawUrl);
            } else {
                finalJdbcUrl = appendJdbcParams("jdbc:mysql://" + rawUrl);
            }
        }

        // Fallback to host/port/database if no rawUrl was provided
        if (finalJdbcUrl == null || finalJdbcUrl.isBlank()) {
            String dbHost = (host != null && !host.isBlank()) ? host : "mysql.railway.internal";
            String dbPort = (port != null && !port.isBlank()) ? port : "3306";
            String dbName = (database != null && !database.isBlank()) ? database : "railway";
            finalJdbcUrl = appendJdbcParams("jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbName);
        }

        if (finalUsername == null || finalUsername.isBlank()) {
            finalUsername = "root";
        }
        if (finalPassword == null) {
            finalPassword = "";
        }

        return new ResolvedDbConfig(finalJdbcUrl, finalUsername, finalPassword);
    }

    public static String appendJdbcParams(String url) {
        if (url == null) return url;
        String separator = url.contains("?") ? "&" : "?";
        StringBuilder sb = new StringBuilder(url);
        if (!url.contains("allowPublicKeyRetrieval")) {
            sb.append(separator).append("allowPublicKeyRetrieval=true");
            separator = "&";
        }
        if (!url.contains("useSSL")) {
            sb.append(separator).append("useSSL=false");
            separator = "&";
        }
        if (!url.contains("serverTimezone")) {
            sb.append(separator).append("serverTimezone=UTC");
            separator = "&";
        }
        if (!url.contains("createDatabaseIfNotExist")) {
            sb.append(separator).append("createDatabaseIfNotExist=true");
        }
        return sb.toString();
    }

    private static String getFirstNonEmpty(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (v != null && !v.trim().isEmpty()) {
                return v.trim();
            }
        }
        return null;
    }

    private static String maskUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
    }
}
