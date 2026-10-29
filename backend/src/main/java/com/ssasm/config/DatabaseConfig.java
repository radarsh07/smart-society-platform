package com.ssasm.config;

import java.net.URI;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

/**
 * Cloud-resilient DataSource configuration supporting both standard JDBC URLs
 * and cloud service URIs (e.g. Aiven, Render, Railway mysql://user:pass@host:port/db).
 * Includes automatic keep-alive pings to prevent idle TCP drops across days of running.
 */
@Configuration
public class DatabaseConfig {

  private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

  @Value("${SPRING_DATASOURCE_URL:#{null}}")
  private String springDatasourceUrl;

  @Value("${DATABASE_URL:#{null}}")
  private String databaseUrl;

  @Value("${MYSQL_URL:#{null}}")
  private String mysqlUrl;

  @Value("${spring.datasource.username:root}")
  private String defaultUsername;

  @Value("${spring.datasource.password:Adarsh@2005}")
  private String defaultPassword;

  @Bean
  @Primary
  public DataSource dataSource() {
    String rawUrl = springDatasourceUrl;
    if (rawUrl == null || rawUrl.isBlank()) {
      rawUrl = databaseUrl;
    }
    if (rawUrl == null || rawUrl.isBlank()) {
      rawUrl = mysqlUrl;
    }
    if (rawUrl == null || rawUrl.isBlank()) {
      rawUrl = "jdbc:mysql://localhost:3306/ssasm_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    }

    rawUrl = rawUrl.trim();
    HikariConfig config = new HikariConfig();
    config.setDriverClassName("com.mysql.cj.jdbc.Driver");

    // Resilience against cloud timeouts, idle drops, and sleep cycles:
    config.setInitializationFailTimeout(-1);
    config.setConnectionTimeout(30000);
    config.setMaximumPoolSize(5);
    config.setMinimumIdle(1);
    config.setIdleTimeout(300000); // 5 mins
    config.setMaxLifetime(600000); // 10 mins (refreshes before MySQL wait_timeout or NAT drop)
    config.setKeepaliveTime(30000); // Periodic 30s ping keeps socket alive through days of running
    config.setConnectionTestQuery("/* ping */ SELECT 1");
    config.setLeakDetectionThreshold(60000);

    if (rawUrl.startsWith("mysql://")) {
      try {
        URI uri = new URI(rawUrl);
        String userInfo = uri.getUserInfo();
        String username = defaultUsername;
        String password = defaultPassword;
        if (userInfo != null && !userInfo.isBlank()) {
          String[] parts = userInfo.split(":", 2);
          username = parts[0];
          if (parts.length > 1) {
            password = parts[1];
          }
        }

        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 3306;
        String path = uri.getPath();
        if (path == null || path.isBlank() || path.equals("/")) {
          path = "/defaultdb";
        }

        String jdbcUrl = "jdbc:mysql://" + host + ":" + port + path
            + "?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=true&sslMode=REQUIRED&serverTimezone=UTC";

        log.info("Detected and parsed cloud mysql:// URI for host: {}, port: {}, database: {}", host, port, path);
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        return new HikariDataSource(config);
      } catch (Exception e) {
        log.warn("Failed to parse mysql:// URI, falling back to prefixing jdbc:", e);
        String converted = "jdbc:" + rawUrl;
        config.setJdbcUrl(converted);
        config.setUsername(defaultUsername);
        config.setPassword(defaultPassword);
        return new HikariDataSource(config);
      }
    } else {
      config.setJdbcUrl(rawUrl);
      config.setUsername(defaultUsername);
      config.setPassword(defaultPassword);
      return new HikariDataSource(config);
    }
  }
}
