package com.habithacker.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/habits")
@CrossOrigin(origins = "*")
public class HabitHistoryController {

    @Value("${supabase.url:https://phsubtmwjfkspqpzusxm.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.anon-key:sb_publishable_p2xKtuWO_AoxUEljV9FAgg_SB9PgNSN}")
    private String supabaseAnonKey;

    @Value("${supabase.service-role-key:}")
    private String supabaseServiceKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // In-memory fallback caches if Supabase is offline
    private final Map<String, List<Map<String, Object>>> completionHistoryCache = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> updateHistoryCache = new ConcurrentHashMap<>();

    private String bestKey() {
        if (supabaseServiceKey != null && !supabaseServiceKey.isBlank()) return supabaseServiceKey;
        return supabaseAnonKey;
    }

    private HttpHeaders supabaseHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.set("apikey", bestKey());
        h.set("Authorization", "Bearer " + bestKey());
        return h;
    }

    // POST /api/v1/habits/{taskId}/completion-history
    @PostMapping("/{taskId}/completion-history")
    public ResponseEntity<Map<String, Object>> logCompletionHistory(
            @PathVariable String taskId,
            @RequestBody Map<String, Object> payload) {

        payload.putIfAbsent("id", "comp-" + UUID.randomUUID().toString().substring(0, 8));
        payload.putIfAbsent("task_id", taskId);
        payload.putIfAbsent("completed_at", LocalDateTime.now().toString());

        // Cache in memory
        completionHistoryCache.computeIfAbsent(taskId, k -> new ArrayList<>()).add(0, payload);

        // Try inserting into Supabase
        try {
            String url = supabaseUrl + "/rest/v1/habit_completion_history";
            HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, supabaseHeaders());
            restTemplate.exchange(url, HttpMethod.POST, req, String.class);
        } catch (Exception e) {
            System.err.println("[HabitHistoryController] Supabase completion insert notice: " + e.getMessage());
        }

        return ResponseEntity.ok(payload);
    }

    // GET /api/v1/habits/{taskId}/completion-history
    @GetMapping("/{taskId}/completion-history")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<Map<String, Object>>> getCompletionHistory(@PathVariable String taskId) {
        try {
            String url = supabaseUrl + "/rest/v1/habit_completion_history?or=(task_id.eq." + taskId + ",parent_task_id.eq." + taskId + ")&order=completed_at.desc&limit=50";
            HttpEntity<Void> req = new HttpEntity<>(supabaseHeaders());
            ResponseEntity<List> resp = restTemplate.exchange(url, HttpMethod.GET, req, List.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return ResponseEntity.ok((List<Map<String, Object>>) resp.getBody());
            }
        } catch (Exception e) {
            System.err.println("[HabitHistoryController] Supabase completion fetch notice: " + e.getMessage());
        }

        List<Map<String, Object>> cached = completionHistoryCache.getOrDefault(taskId, Collections.emptyList());
        return ResponseEntity.ok(cached);
    }

    // POST /api/v1/habits/{taskId}/update-history
    @PostMapping("/{taskId}/update-history")
    public ResponseEntity<Map<String, Object>> logUpdateHistory(
            @PathVariable String taskId,
            @RequestBody Map<String, Object> payload) {

        payload.putIfAbsent("id", "upd-" + UUID.randomUUID().toString().substring(0, 8));
        payload.putIfAbsent("task_id", taskId);
        payload.putIfAbsent("created_at", LocalDateTime.now().toString());

        // Cache in memory
        updateHistoryCache.computeIfAbsent(taskId, k -> new ArrayList<>()).add(0, payload);

        // Try inserting into Supabase
        try {
            String url = supabaseUrl + "/rest/v1/habit_update_history";
            HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, supabaseHeaders());
            restTemplate.exchange(url, HttpMethod.POST, req, String.class);
        } catch (Exception e) {
            System.err.println("[HabitHistoryController] Supabase update insert notice: " + e.getMessage());
        }

        return ResponseEntity.ok(payload);
    }

    // GET /api/v1/habits/{taskId}/update-history
    @GetMapping("/{taskId}/update-history")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<Map<String, Object>>> getUpdateHistory(@PathVariable String taskId) {
        try {
            String url = supabaseUrl + "/rest/v1/habit_update_history?or=(task_id.eq." + taskId + ",parent_task_id.eq." + taskId + ")&order=created_at.desc&limit=50";
            HttpEntity<Void> req = new HttpEntity<>(supabaseHeaders());
            ResponseEntity<List> resp = restTemplate.exchange(url, HttpMethod.GET, req, List.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return ResponseEntity.ok((List<Map<String, Object>>) resp.getBody());
            }
        } catch (Exception e) {
            System.err.println("[HabitHistoryController] Supabase update fetch notice: " + e.getMessage());
        }

        List<Map<String, Object>> cached = updateHistoryCache.getOrDefault(taskId, Collections.emptyList());
        return ResponseEntity.ok(cached);
    }
}
