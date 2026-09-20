package com.habithacker.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * AuthController — Custom authentication backed by Supabase app_users table.
 *
 * Architecture:
 *  - NO Supabase Auth (no emails, no confirmation, no rate limits)
 *  - Users stored in app_users table (email, password_hash, display_name)
 *  - password_hash = SHA-256(password) as hex string
 *  - user_id used everywhere = the user's email address (lowercase, trimmed)
 *  - This controller calls Supabase REST API using the service-role key or anon key
 */
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Value("${supabase.url:https://phsubtmwjfkspqpzusxm.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.anon-key:}")
    private String supabaseAnonKey;

    @Value("${supabase.service-role-key:}")
    private String supabaseServiceKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Helpers ────────────────────────────────────────────────────────────────

    /** SHA-256 hex hash of the password */
    private String hashPassword(String raw) {
        if (raw == null || raw.isBlank()) return "";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "hash_" + raw.hashCode();
        }
    }

    /** Returns the best available Supabase API key */
    private String bestKey() {
        if (supabaseServiceKey != null && !supabaseServiceKey.isBlank()) return supabaseServiceKey;
        return supabaseAnonKey;
    }

    /** Build headers for Supabase REST API calls */
    private HttpHeaders supabaseHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.set("apikey", bestKey());
        h.set("Authorization", "Bearer " + bestKey());
        h.set("Prefer", "return=representation");
        return h;
    }

    /** GET from Supabase REST — returns list of matching rows */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> supabaseSelect(String table, String filterQuery) {
        try {
            String url = supabaseUrl + "/rest/v1/" + table + "?" + filterQuery;
            HttpEntity<Void> req = new HttpEntity<>(supabaseHeaders());
            ResponseEntity<List> resp = restTemplate.exchange(url, HttpMethod.GET, req, List.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return (List<Map<String, Object>>) resp.getBody();
            }
        } catch (Exception e) {
            System.err.println("[AuthController] Supabase SELECT error: " + e.getMessage());
        }
        return Collections.emptyList();
    }

    /** POST to Supabase REST — inserts a row */
    private boolean supabaseInsert(String table, Map<String, Object> payload) {
        try {
            String url = supabaseUrl + "/rest/v1/" + table;
            HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, supabaseHeaders());
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, req, String.class);
            return resp.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("[AuthController] Supabase INSERT error: " + e.getMessage());
            return false;
        }
    }

    // ── Endpoints ──────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/auth/register
     * Body: { "email": "...", "password": "...", "displayName": "..." }
     * Returns: 200 OK with user info, 409 if already registered, 400 if bad input
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String displayName = body.get("displayName");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required."));
        }

        String cleanEmail = email.trim().toLowerCase();
        String name = (displayName != null && !displayName.isBlank()) ? displayName.trim() : cleanEmail.split("@")[0];

        // Check if user already exists
        List<Map<String, Object>> existing = supabaseSelect("app_users",
                "select=id,email&email=eq." + cleanEmail + "&limit=1");
        if (!existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "An account with email " + cleanEmail + " already exists. Please sign in instead."
            ));
        }

        // Insert new user
        Map<String, Object> newUser = new LinkedHashMap<>();
        newUser.put("email", cleanEmail);
        newUser.put("password_hash", hashPassword(password));
        newUser.put("display_name", name);

        boolean ok = supabaseInsert("app_users", newUser);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Registration failed. Please check your Supabase configuration and try again."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Account registered successfully for " + cleanEmail,
                "user", Map.of(
                        "id", cleanEmail,         // user_id = email
                        "email", cleanEmail,
                        "displayName", name
                )
        ));
    }

    /**
     * POST /api/v1/auth/login
     * Body: { "email": "...", "password": "..." }
     * Returns: 200 OK with user info, 404 if not found, 401 if wrong password
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required."));
        }

        String cleanEmail = email.trim().toLowerCase();

        List<Map<String, Object>> rows = supabaseSelect("app_users",
                "select=id,email,password_hash,display_name&email=eq." + cleanEmail + "&limit=1");

        if (rows.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "No account found for \"" + cleanEmail + "\". Please register first."
            ));
        }

        Map<String, Object> user = rows.get(0);
        String storedHash = (String) user.get("password_hash");
        String incomingHash = hashPassword(password);

        if (storedHash == null || !storedHash.equals(incomingHash)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Incorrect password for \"" + cleanEmail + "\". Please try again."
            ));
        }

        String displayName = (String) user.getOrDefault("display_name", cleanEmail.split("@")[0]);

        return ResponseEntity.ok(Map.of(
                "message", "Sign in successful",
                "user", Map.of(
                        "id", cleanEmail,         // user_id = email
                        "email", cleanEmail,
                        "displayName", displayName
                )
        ));
    }

    /**
     * GET /api/v1/auth/check?email=...
     * Returns: { "registered": true/false }
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkRegistration(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.ok(Map.of("registered", false));
        }
        String cleanEmail = email.trim().toLowerCase();
        List<Map<String, Object>> rows = supabaseSelect("app_users",
                "select=id&email=eq." + cleanEmail + "&limit=1");
        return ResponseEntity.ok(Map.of("registered", !rows.isEmpty(), "email", cleanEmail));
    }
}
