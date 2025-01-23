package com.example.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    @Override
    public void run(String... args) throws Exception {
        String dbName1 = "users";
        String dbName2 = "medical_records";

        DatabasesExistsCheckerConfig.setDatabaseMedicalRecordsExists(true);
        DatabasesExistsCheckerConfig.setDatabaseUsersExists(true);

        createDatabaseIfNotExists(dbName1);
        createDatabaseIfNotExists(dbName2);
    }

    private void createDatabaseIfNotExists(String dbName) {
        String checkDatabaseQuery = "SELECT 1 FROM pg_database WHERE datname = ?";
        String createDatabaseQuery = "CREATE DATABASE " + dbName;
//
//        Boolean exists = jdbcTemplate.query(
//                checkDatabaseQuery,
//                new Object[]{dbName},
//                rs -> rs.next() // Returns true if the ResultSet is not empty
//        );
//
//        if (Boolean.FALSE.equals(exists)) {
//            jdbcTemplate.execute(createDatabaseQuery);
//            System.out.println("Database created: " + dbName);
//        } else {
//            System.out.println("Database already exists: " + dbName);
//        }
        if(dbName.equals("users")) {
            if (DatabasesExistsCheckerConfig.getDatabaseUsersExists()) {
                System.out.println("Database already exists: " + dbName);
            } else {
                jdbcTemplate.execute(createDatabaseQuery);
                System.out.println("Database created: " + dbName);
            }
        }


        if(dbName.equals("medical_records")) {
            if (DatabasesExistsCheckerConfig.getDatabaseUsersExists()) {
                System.out.println("Database already exists: " + dbName);
            } else {
                jdbcTemplate.execute(createDatabaseQuery);
                System.out.println("Database created: " + dbName);
            }
        }
    }
}
