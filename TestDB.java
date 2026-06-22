import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.ResultSet;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/ueims_db";
        String user = "postgres";
        String password = "Password@123";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
             
            ResultSet rs = stmt.executeQuery("SELECT * FROM interviews LIMIT 1");
            while(rs.next()){
               System.out.println("ID: " + rs.getString("interview_id"));
            }
            System.out.println("Success! All columns exist.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
