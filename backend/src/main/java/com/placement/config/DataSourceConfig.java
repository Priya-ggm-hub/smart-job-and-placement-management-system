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
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${spring.datasource.url:}") String configUrl,
            @Value("${spring.datasource.username:}") String configUsername,
            @Value("${spring.datasource.password:}") String configPassword,
            @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}") String driverClassName) {

        String rawUrl = getFirstNonEmpty(
                System.getenv("DB_URL"),
                System.getenv("SPRING_DATASOURCE_URL"),
                System.getenv("MYSQL_URL"),
                System.getenv("MYSQL_PRIVATE_URL"),
                System.getenv("MYSQL_PUBLIC_URL"),
                System.getenv("DATABASE_URL"),
                System.getenv("MYSQLURL"),
                configUrl
        );

        String host = getFirstNonEmpty(System.getenv("MYSQLHOST"), System.getenv("MYSQL_HOST"), System.getenv("DB_HOST"));
        String port = getFirstNonEmpty(System.getenv("MYSQLPORT"), System.getenv("MYSQL_PORT"), System.getenv("DB_PORT"));
        String database = getFirstNonEmpty(System.getenv("MYSQLDATABASE"), System.getenv("MYSQL_DATABASE"), System.getenv("DB_NAME"));
        String username = getFirstNonEmpty(System.getenv("DB_USERNAME"), System.getenv("DB_USER"), System.getenv("MYSQLUSER"), System.getenv("MYSQL_USER"), System.getenv("SPRING_DATASOURCE_USERNAME"), configUsername);
        String password = getFirstNonEmpty(System.getenv("DB_PASSWORD"), System.getenv("MYSQLPASSWORD"), System.getenv("MYSQL_PASSWORD"), System.getenv("SPRING_DATASOURCE_PASSWORD"), configPassword);

        String finalJdbcUrl = null;
        String finalUsername = username;
        String finalPassword = password;

        if (rawUrl != null && !rawUrl.isBlank()) {
            if (rawUrl.startsWith("mysql://") || rawUrl.startsWith("mariadb://")) {
                try {
                    URI uri = new URI(rawUrl);
                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        if (finalUsername == null || finalUsername.isBlank()) {
                            finalUsername = parts[0];
                        }
                        if (finalPassword == null || finalPassword.isBlank()) {
                            finalPassword = parts[1];
                        }
                    }
                    String path = uri.getPath();
                    if (path != null && path.startsWith("/")) {
                        path = path.substring(1);
                    }
                    if (path == null || path.isBlank()) {
                        path = (database != null && !database.isBlank()) ? database : "railway";
                    }
                    int uriPort = uri.getPort() > 0 ? uri.getPort() : 3306;
                    finalJdbcUrl = "jdbc:mysql://" + uri.getHost() + ":" + uriPort + "/" + path
                            + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true";
                } catch (Exception e) {
                    logger.warn("Could not parse URI {}, using jdbc:mysql fallback.", rawUrl);
                    finalJdbcUrl = "jdbc:" + rawUrl;
                }
            } else if (rawUrl.startsWith("jdbc:")) {
                finalJdbcUrl = rawUrl;
            } else {
                finalJdbcUrl = "jdbc:mysql://" + rawUrl;
            }
        }

        // If no raw URL, construct from host/port/database
        if (finalJdbcUrl == null || finalJdbcUrl.isBlank()) {
            if (host != null && !host.isBlank()) {
                String dbPort = (port != null && !port.isBlank()) ? port : "3306";
                String dbName = (database != null && !database.isBlank()) ? database : "railway";
                finalJdbcUrl = "jdbc:mysql://" + host + ":" + dbPort + "/" + dbName
                        + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true";
            } else {
                finalJdbcUrl = "jdbc:mysql://localhost:3306/placement_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true";
            }
        }

        if (finalUsername == null || finalUsername.isBlank()) {
            finalUsername = "root";
        }
        if (finalPassword == null) {
            finalPassword = "";
        }

        logger.info("Configuring DataSource with JDBC URL: {} and Username: {}", maskUrl(finalJdbcUrl), finalUsername);

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(finalJdbcUrl);
        hikariConfig.setUsername(finalUsername);
        hikariConfig.setPassword(finalPassword);
        hikariConfig.setDriverClassName(driverClassName);
        hikariConfig.setMaximumPoolSize(10);
        hikariConfig.setMinimumIdle(2);
        hikariConfig.setConnectionTimeout(30000);
        hikariConfig.setIdleTimeout(600000);
        hikariConfig.setMaxLifetime(1800000);

        return new HikariDataSource(hikariConfig);
    }

    private String getFirstNonEmpty(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (v != null && !v.trim().isEmpty()) {
                return v.trim();
            }
        }
        return null;
    }

    private String maskUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
    }
}
