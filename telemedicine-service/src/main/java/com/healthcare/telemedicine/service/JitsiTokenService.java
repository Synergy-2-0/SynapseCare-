package com.healthcare.telemedicine.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Jitsi Meet JWT Token Generator.
 *
 * When using meet.jit.si (public Jitsi), tokens are OPTIONAL –
 * rooms are open but secured by room name uniqueness (UUID).
 * For a self-hosted Jitsi with prosody-token-auth, this service
 * generates proper JWT tokens for doctor (moderator) and patient (participant).
 *
 * Public meet.jit.si does NOT require tokens – the meetingLink alone works.
 */
@Service
@Slf4j
public class JitsiTokenService {

    @Value("${jitsi.app-id:synapscare}")
    private String appId;

    @Value("${jitsi.app-secret:synapscare-secret-key-2024}")
    private String appSecret;

    @Value("${jitsi.server-url:https://meet.jit.si}")
    private String serverUrl;

    /**
     * Generate Jitsi room name from session ID — kept unique and hard to guess.
     */
    public String generateRoomName(String sessionId) {
        return "synapscare-" + sessionId.replace("-", "").toLowerCase();
    }

    /**
     * Generate the full meeting URL.
     */
    public String generateMeetingLink(String roomName) {
        // Config string to disable prejoin (immediate join for embedded use)
        return serverUrl + "/" + roomName + "#config.prejoinPageEnabled=false";
    }

    /**
     * Generate JWT for doctor (isModerator=true) or patient (isModerator=false).
     * Only used if Jitsi server has token-based auth enabled.
     */
    public String generateToken(Long userId, String displayName, String email,
                                 String roomName, boolean isModerator) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(appSecret.getBytes(StandardCharsets.UTF_8));

            Map<String, Object> context = new HashMap<>();
            Map<String, Object> user = new HashMap<>();
            user.put("id", userId.toString());
            user.put("name", displayName);
            user.put("email", email);
            user.put("moderator", isModerator);
            context.put("user", user);

            Map<String, Object> features = new HashMap<>();
            features.put("livestreaming", false);
            features.put("recording", false);
            features.put("transcription", false);
            features.put("outbound-call", false);
            context.put("features", features);

            return Jwts.builder()
                    .setIssuer(appId)
                    .setSubject(serverUrl.replace("https://", "").replace("http://", ""))
                    .setAudience("jitsi")
                    .claim("room", roomName)
                    .claim("context", context)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 2 * 60 * 60 * 1000)) // 2 hours
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            log.warn("JWT generation failed, returning empty token (public Jitsi mode): {}", e.getMessage());
            return "";
        }
    }
}
