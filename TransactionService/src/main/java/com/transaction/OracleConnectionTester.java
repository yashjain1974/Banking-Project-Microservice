package com.transaction;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;

public class OracleConnectionTester {

    // --- IMPORTANT: Set these to match your application.yml file EXACTLY ---
    // Make sure this points to the database where your TRANSACTION table lives.
    private static final String DB_URL = "jdbc:oracle:thin:@localhost:1521/ORCLPDB";
    private static final String USER = "TRANSACT_MS";
    private static final String PASS = "transact123";

    public static void main(String[] args) {
        System.out.println("Attempting to connect to the database...");
        System.out.println("URL: " + DB_URL);
        System.out.println("User: " + USER);

        // Using try-with-resources to automatically close the connection
        try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS)) {

            if (conn != null) {
                System.out.println("------------------------------------");
                System.out.println("✅ Connection SUCCESSFUL!");
                System.out.println("------------------------------------");

                // --- NEW CODE TO FETCH AND PRINT DATA ---
                fetchAndPrintTransactions(conn);
                // ----------------------------------------

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

    /**
     * Fetches all records from the TRANSACTION table and prints them to the console.
     * @param connection The active database connection.
     */
    private static void fetchAndPrintTransactions(Connection connection) {
        // Using try-with-resources to also close the Statement and ResultSet
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT * FROM TRANSACTION")) {

            System.out.println("\nFetching data from TRANSACTION table...");
            System.out.println("==================================================");

            int recordCount = 0;
            // Loop through each row in the result set
            while (rs.next()) {
                recordCount++;
                // Retrieve data by column name
                String transactionId = rs.getString("TRANSACTION_ID");
                String fromAccountId = rs.getString("FROM_ACCOUNT_ID");
                String toAccountId = rs.getString("TO_ACCOUNT_ID");
                double amount = rs.getDouble("AMOUNT");
                String type = rs.getString("TRANSACTION_TYPE");
                String status = rs.getString("TRANSACTION_STATUS");
                LocalDateTime transactionDate = rs.getTimestamp("TRANSACTION_DATE").toLocalDateTime();

                // Print the retrieved data
                System.out.println("Record " + recordCount + ":");
                System.out.println("  ID: " + transactionId);
                System.out.println("  From: " + fromAccountId);
                System.out.println("  To: " + toAccountId);
                System.out.println("  Amount: " + amount);
                System.out.println("  Type: " + type);
                System.out.println("  Status: " + status);
                System.out.println("  Date: " + transactionDate);
                System.out.println("--------------------------------------------------");
            }

            if (recordCount == 0) {
                System.out.println("No records found in the TRANSACTION table.");
            }
            System.out.println("==================================================");


        } catch (SQLException e) {
            System.err.println("Error fetching data from the transaction table.");
            e.printStackTrace();
        }
    }
}