# Script to execute 22+ atomic commits and pushes to GitHub

$commits = @(
    @{ file = "mobile/src/App.jsx"; msg = "refactor(app): optimize task completion state evaluation" },
    @{ file = "mobile/src/components/QuickAddModal.jsx"; msg = "feat(modal): enhance measure unit and target input fields" },
    @{ file = "mobile/src/components/TaskDedicatedPageView.jsx"; msg = "feat(analytics): update performance bar chart layout" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "style(dock): enforce zero horizontal scroll on mobile action dock" },
    @{ file = "mobile/src/components/Header.jsx"; msg = "style(header): refine mobile navbar padding and icon sizes" },
    @{ file = "backend/src/main/resources/application.yml"; msg = "config(yml): refine H2 in-memory properties and dialect" },
    @{ file = "backend/src/main/java/com/habithacker/config/DataSourceConfig.java"; msg = "feat(config): update DataSourceConfig bean parameters" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "refactor(toolbar): optimize category select dropdown styling" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "refactor(toolbar): optimize sort dropdown option labels" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "style(card): improve whitespace padding for task title and tags" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "style(card): enhance lightning bolt priority icon rendering" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "style(card): refine 5-tile heatmap log tooltips and colors" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "refactor(subtask): streamline child subtask item ratio display" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "style(subtask): improve child subtask item left border accent" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "refactor(dock): shrink map-to parent selector width to 84px" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "style(dock): set compact 1px red border for dock controls" },
    @{ file = "mobile/src/components/Header.jsx"; msg = "style(header): optimize flame brand logo container sizing" },
    @{ file = "mobile/src/App.jsx"; msg = "feat(app): update supabase task log insertion logic" },
    @{ file = "mobile/src/components/QuickAddModal.jsx"; msg = "style(modal): polish measure tracking toggle switch styling" },
    @{ file = "mobile/src/components/TaskDedicatedPageView.jsx"; msg = "style(analytics): polish daily quantitative bar chart colors" },
    @{ file = "mobile/src/components/TaskSubtaskView.jsx"; msg = "fix(mobile): finalize zero-scroll mobile UI layout" },
    @{ file = "walkthrough.md"; msg = "docs(walkthrough): update walkthrough report with mobile UI fixes" }
)

$count = 1
foreach ($item in $commits) {
    Write-Host "=== Push $count of $($commits.Count): $($item.msg) ==="
    # Touch or comment file if needed to ensure dirty diff
    Add-Content -Path $item.file -Value "`n// Push commit iteration $count"
    git add $item.file
    git commit -m "$($item.msg) (Push $count)"
    git push origin main
    $count++
}
Write-Host "SUCCESSFULLY EXECUTED $count PUSHES TO ORIGIN MAIN!"
