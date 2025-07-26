package com.example.transaction;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class OracleConnectionTester {

    // --- IMPORTANT: Set these to match your application.yml file EXACTLY ---
    private static final String DB_URL = "jdbc:oracle:thin:@localhost:1521/ORCLPDB";
    private static final String USER = "TRANSACT_MS";
    private static final String PASS = "transact123";

    public static void main(String[] args) {
        System.out.println("Attempting to connect to the database...");
        System.out.println("URL: " + DB_URL);
        System.out.println("User: " + USER);

        try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS)) {

            if (conn != null) {
                System.out.println("------------------------------------");
                System.out.println("✅ Connection SUCCESSFUL!");
                System.out.println("------------------------------------");
            } else {
                System.out.println("------------------------------------");
                System.out.println("❌ Connection FAILED! (No exception, but connection is null)");
                System.out.println("------------------------------------");
            }

        } catch (SQLException e) {
            System.err.println("------------------------------------");
            System.err.println("❌ Connection FAILED! An SQL Exception occurred.");
            System.err.println("------------------------------------");
            // This will print the exact ORA- error code
            e.printStackTrace();
        }
    }
}