package com.example.config;

public class DatabasesExistsCheckerConfig {
    static private  Boolean database_medical_records_exists;
    private static Boolean database_users_exists;
    public DatabasesExistsCheckerConfig(Boolean database_medical_records_exists, Boolean database_users_exists) {
        this.database_medical_records_exists = database_medical_records_exists;
        this.database_users_exists = database_users_exists;
    }
    public static void setDatabaseMedicalRecordsExists(Boolean database_medical_records_exists) {
        DatabasesExistsCheckerConfig.database_medical_records_exists = database_medical_records_exists;
    }
    public static void setDatabaseUsersExists(Boolean database_users_exists) {
        DatabasesExistsCheckerConfig.database_users_exists = database_users_exists;
    }
    static public Boolean getDatabaseMedicalRecordsExists() {
        return database_medical_records_exists;
    }
    static public Boolean getDatabaseUsersExists() {
        return database_users_exists;
    }
}
