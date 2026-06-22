import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixUserMain {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/ueims_db";
        String user = "postgres";
        String password = "Password@123"; // typically default
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
             
            int rows1 = stmt.executeUpdate("UPDATE users SET full_name = 'Nguyễn Duy Quang' WHERE email LIKE '%duyquangdn522005%'");
            int rows2 = stmt.executeUpdate("UPDATE eligible_students SET current_semester = 5 WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%duyquangdn522005%')");
            int rows3 = stmt.executeUpdate("UPDATE eligible_students SET current_semester = 5 WHERE email LIKE '%duyquangdn522005%'");
            
            System.out.println("Success: " + rows1 + " users, " + rows2 + " profiles by user_id, " + rows3 + " profiles by email updated.");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Failed to connect with Password@123, trying no password or root...");
        }
    }
}
