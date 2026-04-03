import java.sql.*;

public class DbInspector {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/synergy_doctors";
        String user = "postgres";
        String password = "password";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("--- DOCTOR TABLE DUMP ---");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, user_id, first_name, last_name, verification_status FROM doctors");
            while (rs.next()) {
                System.out.printf("ID: %d | UserID: %d | Name: %s %s | Status: %s%n",
                        rs.getLong("id"),
                        rs.getLong("user_id"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getString("verification_status"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
