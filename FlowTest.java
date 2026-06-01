import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class FlowTest {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        ObjectMapper mapper = new ObjectMapper();
        
        // 1. Try Login with a known user (e.g. from DB)
        // I need to use the admin token or something to create a user.
        // But wait, I can just use a raw JDBC connection to change a user's password, then login, then change password via API, then login again!
    }
}
