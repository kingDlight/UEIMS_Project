import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class CheckDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/ueims_db";
        String user = "postgres";
        String pass = "05022005"; // default from properties
        
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            String query = "SELECT email, password_hash, must_change_password FROM users";
            try (PreparedStatement stmt = conn.prepareStatement(query);
                 ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    System.out.println("Email: " + rs.getString("email"));
                    System.out.println("Hash: " + rs.getString("password_hash"));
                    System.out.println("MustChange: " + rs.getBoolean("must_change_password"));
                    System.out.println("--------------------------------");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
