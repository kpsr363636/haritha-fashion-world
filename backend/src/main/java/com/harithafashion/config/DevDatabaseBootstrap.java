package com.harithafashion.config;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public final class DevDatabaseBootstrap {

    private static EmbeddedPostgres embeddedPostgres;

    private DevDatabaseBootstrap() {
    }

    public static void prepare() {
        if (embeddedPostgres != null) {
            return;
        }

        String profile = firstNonBlank(
                System.getenv("SPRING_PROFILES_ACTIVE"),
                System.getProperty("spring.profiles.active"),
                "dev");
        if (!profile.contains("dev")) {
            return;
        }
        if ("true".equalsIgnoreCase(System.getenv("USE_EXTERNAL_DB"))) {
            return;
        }

        String url = firstNonBlank(System.getenv("DB_URL"), "jdbc:postgresql://localhost:5432/haritha_fashion");
        String user = firstNonBlank(System.getenv("DB_USER"), "postgres");
        String password = firstNonBlank(System.getenv("DB_PASSWORD"), "postgres");

        if (canConnect(url, user, password)) {
            return;
        }

        String embeddedBaseUrl = "jdbc:postgresql://localhost:5433/haritha_fashion";
        if (canConnect(embeddedBaseUrl, "postgres", "postgres")) {
            System.setProperty("DB_URL", embeddedBaseUrl);
            System.setProperty("DB_USER", "postgres");
            System.setProperty("DB_PASSWORD", "postgres");
            return;
        }

        try {
            embeddedPostgres = EmbeddedPostgres.builder()
                    .setPort(5433)
                    .start();
            ensureDatabase("haritha_fashion");
            String embeddedUrl = embeddedPostgres.getJdbcUrl("postgres", "haritha_fashion");
            System.setProperty("DB_URL", embeddedUrl);
            System.setProperty("DB_USER", "postgres");
            System.setProperty("DB_PASSWORD", "postgres");
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                try {
                    if (embeddedPostgres != null) {
                        embeddedPostgres.close();
                    }
                } catch (IOException ignored) {
                    // shutdown hook
                }
            }));
            System.out.println("[dev] External PostgreSQL unavailable — using embedded PostgreSQL on port 5433");
        } catch (IOException | SQLException e) {
            throw new IllegalStateException("Failed to start embedded PostgreSQL for local development", e);
        }
    }

    private static void ensureDatabase(String databaseName) throws SQLException {
        try (Connection connection = embeddedPostgres.getPostgresDatabase().getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE DATABASE " + databaseName);
        } catch (SQLException e) {
            if (!"42P04".equals(e.getSQLState())) {
                throw e;
            }
        }
    }

    private static boolean canConnect(String url, String user, String password) {
        try {
            Class.forName("org.postgresql.Driver");
            try (Connection connection = DriverManager.getConnection(url, user, password)) {
                return connection.isValid(3);
            }
        } catch (Exception e) {
            return false;
        }
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
