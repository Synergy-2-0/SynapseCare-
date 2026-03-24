public class VerifyJsonMapper {
    public static void main(String[] args) {
        com.fasterxml.jackson.databind.json.JsonMapper mapper = com.fasterxml.jackson.databind.json.JsonMapper.builder().build();
        System.out.println(mapper.getClass().getName());
    }
}
