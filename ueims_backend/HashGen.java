import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// Standalone utility — run as Java Application only (NOT Spring Boot).
// Usage: mvn -q exec:java -Dexec.mainClass="HashGen" -Dexec.classpathScope=compile
//        or right-click -> Run 'HashGen.main()' in IDE
public class HashGen {
    public static void main(String[] args) {
        String raw = "Password@123";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(raw);
        System.out.println(hash);
        System.out.println("len=" + hash.length());
        System.out.println("verify=" + encoder.matches(raw, hash));
    }
}
