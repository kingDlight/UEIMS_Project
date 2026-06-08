import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class CheckDB2 {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/ueims_db";
        String user = "postgres";
        String pass = "05022005"; 
        
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            String query = "SELECT r.role_name FROM users_roles r WHERE r.user_id = 'df5eb595-db10-47d3-bcf8-705de6f50e52'::uuid";
            try (PreparedStatement stmt = conn.prepareStatement(query);
                 ResultSet rs = stmt.executeQuery()) {
                System.out.println("User Roles:");
                while (rs.next()) {
                    System.out.println("- " + rs.getString("role_name"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
