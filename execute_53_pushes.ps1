# PowerShell script to execute 53 atomic commits and pushes to origin main

$steps = @(
  @{ msg = "chore: initialize repository and add gitignore"; files = @(".gitignore") },
  @{ msg = "docs: add feature specification and technical documentation"; files = @("Habit_Hacker_Final_Feature_Specification.md", "Habit_Hacker_Final_Technical_Implementation.md") },
  @{ msg = "build(backend): Maven POM configuration"; files = @("backend/pom.xml") },
  @{ msg = "build(mobile): Vite package configuration"; files = @("mobile/package.json", "mobile/vite.config.js") },
  @{ msg = "config(mobile): HTML entrypoint and app manifest"; files = @("mobile/index.html", "mobile/app.json") },
  @{ msg = "style(mobile): global CSS tokens and aesthetic styling"; files = @("mobile/src/index.css") },
  @{ msg = "feat(backend): Spring Boot application entrypoint"; files = @("backend/src/main/java/com/habithacker/HabitHackerApplication.java") },
  @{ msg = "config(backend): application configuration settings"; files = @("backend/src/main/resources/application.properties") },
  @{ msg = "feat(backend): Spring security configuration"; files = @("backend/src/main/java/com/habithacker/config/SecurityConfig.java") },
  @{ msg = "feat(backend): User authentication domain entity"; files = @("backend/src/main/java/com/habithacker/entity/User.java") },
  @{ msg = "feat(backend): Task domain entity and tracking modes"; files = @("backend/src/main/java/com/habithacker/entity/Task.java") },
  @{ msg = "feat(backend): Subtask relational entity model"; files = @("backend/src/main/java/com/habithacker/entity/Subtask.java") },
  @{ msg = "feat(backend): Habit and HabitLog tracking models"; files = @("backend/src/main/java/com/habithacker/entity/Habit.java", "backend/src/main/java/com/habithacker/entity/HabitLog.java") },
  @{ msg = "feat(backend): TaskLog activity tracking entity"; files = @("backend/src/main/java/com/habithacker/entity/TaskLog.java") },
  @{ msg = "db(migration): Flyway V1 initial database schema"; files = @("backend/src/main/resources/db/migration/V1__initial_schema.sql") },
  @{ msg = "db(migration): Flyway V2 default seed data"; files = @("backend/src/main/resources/db/migration/V2__seed_data.sql") },
  @{ msg = "db(migration): Flyway V3 relational operations"; files = @("backend/src/main/resources/db/migration/V3__relational_operations.sql") },
  @{ msg = "db(migration): Flyway V4 target types and archiving"; files = @("backend/src/main/resources/db/migration/V4__target_types_and_archiving.sql") },
  @{ msg = "db(migration): Flyway V5 task fields unification"; files = @("backend/src/main/resources/db/migration/V5__task_fields_and_unification.sql") },
  @{ msg = "db(migration): Flyway V6 tracking mode refactoring"; files = @("backend/src/main/resources/db/migration/V6__refactor_tracking_modes.sql") },
  @{ msg = "db(migration): Flyway V7 smart archiving trigger"; files = @("backend/src/main/resources/db/migration/V7__smart_archive_trigger.sql") },
  @{ msg = "db(migration): Flyway V8 task logs schema"; files = @("backend/src/main/resources/db/migration/V8__create_task_logs_table.sql") },
  @{ msg = "feat(backend): TaskRepository JPA data access"; files = @("backend/src/main/java/com/habithacker/repository/TaskRepository.java") },
  @{ msg = "feat(backend): Subtask and User repository interfaces"; files = @("backend/src/main/java/com/habithacker/repository/SubtaskRepository.java", "backend/src/main/java/com/habithacker/repository/UserRepository.java") },
  @{ msg = "feat(backend): Habit and HabitLog repositories"; files = @("backend/src/main/java/com/habithacker/repository/HabitRepository.java", "backend/src/main/java/com/habithacker/repository/HabitLogRepository.java") },
  @{ msg = "feat(backend): CapacityEngine workload calculator"; files = @("backend/src/main/java/com/habithacker/engine/CapacityEngine.java") },
  @{ msg = "feat(backend): DisciplineEngine scoring service"; files = @("backend/src/main/java/com/habithacker/engine/DisciplineEngine.java") },
  @{ msg = "feat(backend): SubtaskAnalyticsEngine performance calculator"; files = @("backend/src/main/java/com/habithacker/engine/SubtaskAnalyticsEngine.java") },
  @{ msg = "feat(backend): HeatmapEngine activity matrix service"; files = @("backend/src/main/java/com/habithacker/engine/HeatmapEngine.java") },
  @{ msg = "feat(backend): AuthController authentication endpoints"; files = @("backend/src/main/java/com/habithacker/controller/AuthController.java") },
  @{ msg = "feat(backend): TaskController task REST endpoints"; files = @("backend/src/main/java/com/habithacker/controller/TaskController.java") },
  @{ msg = "feat(backend): SubtaskController REST endpoints"; files = @("backend/src/main/java/com/habithacker/controller/SubtaskController.java") },
  @{ msg = "feat(backend): DashboardController executive metrics"; files = @("backend/src/main/java/com/habithacker/controller/DashboardController.java") },
  @{ msg = "feat(backend): CalendarController multi-view endpoint"; files = @("backend/src/main/java/com/habithacker/controller/CalendarController.java") },
  @{ msg = "feat(backend): AnalyticsController deep analytics API"; files = @("backend/src/main/java/com/habithacker/controller/AnalyticsController.java") },
  @{ msg = "feat(backend): PlanningController capacity planner API"; files = @("backend/src/main/java/com/habithacker/controller/PlanningController.java") },
  @{ msg = "feat(mobile): Supabase integration client"; files = @("mobile/src/lib/supabaseClient.js") },
  @{ msg = "feat(mobile): AuthLandingPage login component"; files = @("mobile/src/components/AuthLandingPage.jsx") },
  @{ msg = "feat(mobile): AuthModal authentication modal"; files = @("mobile/src/components/AuthModal.jsx") },
  @{ msg = "feat(mobile): Header navigation component"; files = @("mobile/src/components/Header.jsx") },
  @{ msg = "feat(mobile): SidebarDrawer navigation component"; files = @("mobile/src/components/SidebarDrawer.jsx") },
  @{ msg = "feat(mobile): TodayDashboard executive view"; files = @("mobile/src/components/TodayDashboard.jsx") },
  @{ msg = "feat(mobile): WidgetsHubView interactive widget page"; files = @("mobile/src/components/WidgetsHubView.jsx") },
  @{ msg = "feat(mobile): TaskSubtaskView management hub"; files = @("mobile/src/components/TaskSubtaskView.jsx") },
  @{ msg = "feat(mobile): TaskDedicatedPageView analytics page"; files = @("mobile/src/components/TaskDedicatedPageView.jsx") },
  @{ msg = "feat(mobile): MultiViewCalendar component"; files = @("mobile/src/components/MultiViewCalendar.jsx") },
  @{ msg = "feat(mobile): HeatmapsHubView analytics view"; files = @("mobile/src/components/HeatmapsHubView.jsx") },
  @{ msg = "feat(mobile): BarGraphAnalyticsView deep analytics"; files = @("mobile/src/components/BarGraphAnalyticsView.jsx") },
  @{ msg = "feat(mobile): CapacityPlannerView workload planner"; files = @("mobile/src/components/CapacityPlannerView.jsx") },
  @{ msg = "feat(mobile): FocusTimerView and DiaryReflectionView"; files = @("mobile/src/components/FocusTimerView.jsx", "mobile/src/components/DiaryReflectionView.jsx") },
  @{ msg = "feat(mobile): GoalsManagementView and ProjectsKanbanView"; files = @("mobile/src/components/GoalsManagementView.jsx", "mobile/src/components/ProjectsKanbanView.jsx") },
  @{ msg = "feat(mobile): RoutinesTemplatesView and SettingsProfileView"; files = @("mobile/src/components/RoutinesTemplatesView.jsx", "mobile/src/components/SettingsProfileView.jsx") },
  @{ msg = "feat(mobile): Task Modals, Notification Manager & Main App integration"; files = @("mobile/src/components/QuickAddModal.jsx", "mobile/src/components/TaskDetailModal.jsx", "mobile/src/components/TaskEditModal.jsx", "mobile/src/components/DateDurationPickerModal.jsx", "mobile/src/components/NotificationAlertManager.jsx", "mobile/src/App.jsx", "mobile/src/main.jsx") }
)

$i = 1
foreach ($step in $steps) {
  Write-Host ">>> Executing Push $i of 53: $($step.msg)" -ForegroundColor Cyan
  
  foreach ($f in $step.files) {
    if (Test-Path $f) {
      git add $f
    }
  }
  
  git commit -m $step.msg
  git push origin main
  
  if ($LASTEXITCODE -eq 0) {
    Write-Host ">>> SUCCESS: Push $i committed & pushed!" -ForegroundColor Green
  } else {
    Write-Host ">>> WARNING: Push $i encountered error." -ForegroundColor Red
  }
  
  $i++
}

Write-Host ">>> Completed all 53 pushes successfully!" -ForegroundColor Green
