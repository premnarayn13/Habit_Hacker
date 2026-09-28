package com.habithacker.controller;

import com.habithacker.entity.Task;
import com.habithacker.entity.TaskLog;
import com.habithacker.repository.TaskLogRepository;
import com.habithacker.repository.TaskRepository;
import com.habithacker.service.GroqAiInsightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
public class AiAnalyticsController {

    @Autowired
    private GroqAiInsightService groqAiInsightService;

    @Autowired(required = false)
    private TaskRepository taskRepository;

    @Autowired(required = false)
    private TaskLogRepository taskLogRepository;

    @Value("${supabase.url:https://phsubtmwjfkspqpzusxm.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.anon-key:sb_publishable_p2xKtuWO_AoxUEljV9FAgg_SB9PgNSN}")
    private String supabaseAnonKey;

    @Value("${supabase.service-role-key:}")
    private String supabaseServiceKey;

    private final RestTemplate restTemplate = new RestTemplate();

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
            System.err.println("[AiAnalyticsController] Supabase SELECT (" + table + ") error: " + e.getMessage());
        }
        return Collections.emptyList();
    }

    // GET /api/v1/analytics/ai-insights?userId=example@gmail.com
    @GetMapping("/ai-insights")
    public ResponseEntity<Map<String, Object>> getAiInsights(
            @RequestParam(defaultValue = "example@gmail.com") String userId,
            @RequestParam(required = false) Integer totalTasks,
            @RequestParam(required = false) Integer completedTasks,
            @RequestParam(required = false) Integer missedTasks,
            @RequestParam(required = false) Integer completionRate,
            @RequestParam(required = false) Integer maxStreak,
            @RequestParam(required = false) Integer plannedMinutes) {

        String cleanUserId = userId.trim().toLowerCase();

        // 1. Fetch Real User Data from Database (First try local JPA, then Supabase REST API)
        List<Map<String, Object>> dbTasks = new ArrayList<>();
        List<Map<String, Object>> dbLogs = new ArrayList<>();

        // Try Spring Data JPA repository
        if (taskRepository != null) {
            try {
                List<Task> jpaTasks = taskRepository.findByUserId(cleanUserId);
                if (jpaTasks != null && !jpaTasks.isEmpty()) {
                    for (Task t : jpaTasks) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", t.getId());
                        m.put("title", t.getTitle());
                        m.put("category", t.getCategory());
                        m.put("priority", t.getPriority());
                        m.put("is_done_today", t.getProgressPercent() != null && t.getProgressPercent() >= 100);
                        m.put("progress_percent", t.getProgressPercent());
                        m.put("estimated_minutes", t.getEstimatedMinutes());
                        dbTasks.add(m);
                    }
                }
            } catch (Exception ignored) {}
        }

        // If JPA has no data (e.g. running H2 in dev or Supabase is primary source of truth), query Supabase REST directly
        if (dbTasks.isEmpty()) {
            dbTasks = supabaseSelect("tasks", "user_id=eq." + cleanUserId + "&select=id,title,category,priority,is_done_today,progress_percent,estimated_minutes,current_count,target_count,tracking_mode");
        }

        // Fetch user's task logs
        dbLogs = supabaseSelect("task_logs", "user_id=eq." + cleanUserId + "&select=id,task_id,logged_date,is_successful,measured_value");

        // 2. Compute Accurate Metrics from Database
        int realTotal = dbTasks.size();
        int realCompleted = 0;
        int realPlannedMinutes = 0;
        Set<String> categories = new LinkedHashSet<>();
        List<String> habitTitles = new ArrayList<>();

        for (Map<String, Object> t : dbTasks) {
            String title = (String) t.get("title");
            if (title != null && !title.isBlank()) habitTitles.add(title);

            String cat = (String) t.get("category");
            if (cat != null && !cat.isBlank()) categories.add(cat);

            Number est = (Number) t.get("estimated_minutes");
            if (est != null) realPlannedMinutes += est.intValue();

            Object isDone = t.get("is_done_today");
            Number prog = (Number) t.get("progress_percent");
            Number cur = (Number) t.get("current_count");
            Number tgt = (Number) t.get("target_count");

            boolean done = Boolean.TRUE.equals(isDone) ||
                    (prog != null && prog.intValue() >= 100) ||
                    (cur != null && tgt != null && tgt.intValue() > 0 && cur.intValue() >= tgt.intValue());

            if (done) realCompleted++;
        }

        // If logs have completions today, factor that in
        if (realCompleted == 0 && !dbLogs.isEmpty()) {
            realCompleted = (int) dbLogs.stream().filter(l -> Boolean.TRUE.equals(l.get("is_successful"))).count();
        }

        int realMissed = Math.max(0, realTotal - realCompleted);
        int realRate = realTotal > 0 ? Math.round((realCompleted * 100.0f) / realTotal) : 0;
        int realMaxStreak = Math.max(1, (int) Math.ceil(realCompleted / 2.0));

        // Use client overrides only if valid and non-zero
        int finalTotal = (totalTasks != null && totalTasks > 0) ? totalTasks : realTotal;
        int finalCompleted = (completedTasks != null && completedTasks >= 0) ? completedTasks : realCompleted;
        int finalMissed = (missedTasks != null && missedTasks >= 0) ? missedTasks : realMissed;
        int finalRate = (completionRate != null && completionRate >= 0) ? completionRate : realRate;
        int finalStreak = (maxStreak != null && maxStreak > 0) ? maxStreak : realMaxStreak;
        int finalMinutes = (plannedMinutes != null && plannedMinutes > 0) ? plannedMinutes : (realPlannedMinutes > 0 ? realPlannedMinutes : 360);

        Map<String, Object> taskMetrics = new HashMap<>();
        taskMetrics.put("totalTasks", finalTotal);
        taskMetrics.put("completedTasks", finalCompleted);
        taskMetrics.put("missedTasks", finalMissed);
        taskMetrics.put("completionRate", finalRate);
        taskMetrics.put("maxStreak", finalStreak);
        taskMetrics.put("plannedMinutes", finalMinutes);
        taskMetrics.put("capacityPercentage", Math.min(100, Math.round((finalCompleted * 100.0f) / Math.max(1, finalTotal))));
        taskMetrics.put("habitTitles", habitTitles);
        taskMetrics.put("categories", new ArrayList<>(categories));
        taskMetrics.put("dbTasksCount", realTotal);
        taskMetrics.put("dbLogsCount", dbLogs.size());

        Map<String, Object> insights = groqAiInsightService.generateProductivityInsights(cleanUserId, taskMetrics);
        return ResponseEntity.ok(insights);
    }
}
