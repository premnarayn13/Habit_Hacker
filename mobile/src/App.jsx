import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarDrawer from './components/SidebarDrawer';
import WidgetsHubView from './components/WidgetsHubView';
import TodayDashboard from './components/TodayDashboard';
import TaskSubtaskView from './components/TaskSubtaskView';
import TaskDedicatedPageView from './components/TaskDedicatedPageView';
import CapacityPlannerView from './components/CapacityPlannerView';
import MultiViewCalendar from './components/MultiViewCalendar';
import HeatmapsHubView from './components/HeatmapsHubView';
import BarGraphAnalyticsView from './components/BarGraphAnalyticsView';
import FocusTimerView from './components/FocusTimerView';
import DiaryReflectionView from './components/DiaryReflectionView';
import GoalsManagementView from './components/GoalsManagementView';
import ProjectsKanbanView from './components/ProjectsKanbanView';
import RoutinesTemplatesView from './components/RoutinesTemplatesView';
import SettingsProfileView from './components/SettingsProfileView';
import NotificationAlertManager from './components/NotificationAlertManager';
import QuickAddModal from './components/QuickAddModal';
import TaskDetailModal from './components/TaskDetailModal';
import TaskEditModal from './components/TaskEditModal';
import DateDurationPickerModal from './components/DateDurationPickerModal';
import AuthLandingPage from './components/AuthLandingPage';
import { supabase } from './lib/supabaseClient';
import { Flame } from 'lucide-react';

const INITIAL_DEFAULT_TASKS = [
  {
    id: 't-default-1',
    user_id: 'default-user',
    title: 'Learning Java',
    description: 'Master core Java concurrency, Spring Boot microservices, and backend architecture.',
    collab: 'Dev Team',
    priority: 'HIGH',
    isOptional: false,
    hasMeasureTracking: false,
    measureUnit: 'units',
    measureTarget: 0,
    progressPercent: 0,
    plannedStart: '2026-08-22',
    plannedEnd: '2026-10-10',
    deadline: '2026-10-10',
    estimatedMinutes: 60,
    reminderTime: '09:00 AM',
    actualMinutes: 0,
    category: 'Coding',
    section: 'Backend',
    trackingMode: 'count_days',
    targetCount: 45,
    currentCount: 0,
    repeatRule: 'DAILY',
    parentTaskId: '',
    attachmentName: '',
    isArchived: false,
    archivedAt: null,
    isDoneToday: false,
    skipReason: ''
  },
  {
    id: 't-default-2',
    user_id: 'default-user',
    title: 'Morning Jogging',
    description: 'Daily jogging routine with custom rounds performance measure tracking.',
    collab: '',
    priority: 'HIGH',
    isOptional: false,
    hasMeasureTracking: true,
    measureUnit: 'rounds',
    measureTarget: 10,
    progressPercent: 0,
    plannedStart: '2026-08-22',
    plannedEnd: '2026-10-10',
    deadline: '2026-10-10',
    estimatedMinutes: 30,
    reminderTime: '06:30 AM',
    actualMinutes: 0,
    category: 'Health',
    section: 'Fitness',
    trackingMode: 'count_days',
    targetCount: 30,
    currentCount: 0,
    repeatRule: 'DAILY',
    parentTaskId: '',
    attachmentName: '',
    isArchived: false,
    archivedAt: null,
    isDoneToday: false,
    skipReason: ''
  },
  {
    id: 't-default-3',
    user_id: 'default-user',
    title: 'hiii',
    description: 'Optional subtask reading entity.',
    collab: '',
    priority: 'HIGH',
    isOptional: true,
    hasMeasureTracking: false,
    measureUnit: 'pages',
    measureTarget: 5,
    progressPercent: 0,
    plannedStart: '2026-08-22',
    plannedEnd: '2026-10-10',
    deadline: '2026-10-10',
    estimatedMinutes: 20,
    reminderTime: '07:00 PM',
    actualMinutes: 0,
    category: 'Education',
    section: 'General',
    trackingMode: 'count_days',
    targetCount: 45,
    currentCount: 0,
    repeatRule: 'DAILY',
    parentTaskId: 't-default-1',
    attachmentName: '',
    isArchived: false,
    archivedAt: null,
    isDoneToday: false,
    skipReason: ''
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('widgets');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedTaskForPicker, setSelectedTaskForPicker] = useState(null);
  const [isLoadingView, setIsLoadingView] = useState(false);

  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [selectedEditItem, setSelectedEditItem] = useState(null);
  const [dedicatedTaskPageItem, setDedicatedTaskPageItem] = useState(null);
  const [showArchivedVault, setShowArchivedVault] = useState(false);

  const [availableCapacityMinutes, setAvailableCapacityMinutes] = useState(480);

  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchUserData(session.user.id, session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchUserData(session.user.id, session.user.email);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // SUBTASK LIFECYCLE EVALUATOR & AUTOMATED PARENT TURN COMPLETION
  const processSubtaskLifecycles = (rawTasks) => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Lifecycle Unmapping
    let updatedTasks = rawTasks.map(task => {
      if (!task.parentTaskId) return task;

      const parentObj = rawTasks.find(p => p.id === task.parentTaskId);

      // Rule B: Parent ends/archived before child -> Unmap to solo task!
      if (!parentObj || parentObj.isArchived || (parentObj.plannedEnd && parentObj.plannedEnd < todayStr && parentObj.progressPercent >= 100)) {
        return { ...task, parentTaskId: '' };
      }

      // Rule A: Subtask ends before parent (subtask plannedEnd < today) -> Unmap naturally!
      if (task.plannedEnd && task.plannedEnd < todayStr && parentObj.plannedEnd >= todayStr) {
        return { ...task, parentTaskId: '' };
      }

      return task;
    });

    // 2. Automated Parent Completion Driven by Child Subtasks
    updatedTasks = updatedTasks.map(task => {
      const childSubtasks = updatedTasks.filter(t => t.parentTaskId === task.id);
      if (childSubtasks.length > 0) {
        const completedCount = childSubtasks.filter(c => c.isDoneToday || c.progressPercent >= 100).length;
        const totalCount = childSubtasks.length;
        const allSubtasksCompleted = completedCount === totalCount;
        const subtaskProg = Math.round((completedCount / totalCount) * 100);

        const targetMax = task.targetCount || task.targetDayCount || task.targetEventCount || 45;
        let parentCurrent = task.currentCount || 0;
        let parentDoneToday = task.isDoneToday;

        if (allSubtasksCompleted) {
          parentDoneToday = true;
          if (parentCurrent === 0) parentCurrent = 1;
        } else {
          parentDoneToday = false;
          if (parentCurrent === 1 && completedCount === 0) parentCurrent = 0;
        }

        const parentDayProg = Math.round((parentCurrent / targetMax) * 100);

        return {
          ...task,
          subtaskRatioStr: `${completedCount}:${totalCount} Completed`,
          subtaskProgPercent: subtaskProg,
          subtaskCompletedCount: completedCount,
          subtaskTotalCount: totalCount,
          isDoneToday: parentDoneToday,
          currentCount: parentCurrent,
          currentDayCount: parentCurrent,
          currentEventCount: parentCurrent,
          progressPercent: parentDayProg
        };
      }
      return task;
    });

    return updatedTasks;
  };

  // Helper to persist tasks state locally under global & user keys
  const updateTasksState = (newTasks, userEmail = currentUser?.email) => {
    const processed = processSubtaskLifecycles(newTasks);
    localStorage.setItem('habit_hacker_tasks_global_v2', JSON.stringify(processed));
    if (userEmail) {
      localStorage.setItem('habit_hacker_tasks_' + userEmail.toLowerCase(), JSON.stringify(processed));
    }
    setTasks(processed);
  };

  const fetchUserData = async (userId, userEmail = '') => {
    try {
      const globalCached = localStorage.getItem('habit_hacker_tasks_global_v2');
      const emailCached = userEmail ? localStorage.getItem('habit_hacker_tasks_' + userEmail.toLowerCase()) : null;

      let cachedTasks = [];
      if (emailCached) {
        cachedTasks = JSON.parse(emailCached);
      } else if (globalCached) {
        cachedTasks = JSON.parse(globalCached);
      }

      const { data: dbTasks } = await supabase
        .from('tasks')
        .select('*');

      if (dbTasks && dbTasks.length > 0) {
        const mapped = dbTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          collab: t.collab || '',
          priority: t.priority || 'MEDIUM',
          isOptional: t.is_optional || false,
          hasMeasureTracking: t.has_measure_tracking || false,
          measureUnit: t.measure_unit || 'units',
          measureTarget: t.measure_target || 0,
          progressPercent: t.progress_percent || 0,
          plannedStart: t.start_date || t.planned_start || '2026-08-22',
          plannedEnd: t.end_date || t.planned_end || '2026-10-10',
          deadline: t.end_date || t.deadline || '2026-10-10',
          estimatedMinutes: t.estimated_minutes || 30,
          actualMinutes: t.actual_minutes || 0,
          category: t.category || 'General',
          section: t.section || 'General',
          trackingMode: t.tracking_mode || 'end_date',
          targetCount: t.target_count || t.target_day_count || 50,
          currentCount: t.current_count || t.current_day_count || 0,
          repeatRule: t.repeat_rule || 'DAILY',
          parentTaskId: t.parent_task_id || t.parent_id || '',
          attachmentName: t.attachment_name || '',
          isArchived: t.is_archived || false,
          archivedAt: t.archived_at || null,
          isDoneToday: t.is_done_today || false,
          skipReason: ''
        }));

        const combined = [...mapped];
        cachedTasks.forEach(ct => {
          if (!combined.some(dt => dt.id === ct.id)) {
            combined.push(ct);
          }
        });

        updateTasksState(combined, userEmail);
      } else if (cachedTasks && cachedTasks.length > 0) {
        updateTasksState(cachedTasks, userEmail);
      } else {
        updateTasksState(INITIAL_DEFAULT_TASKS, userEmail);
      }

    } catch (err) {
      console.warn('Supabase fetch notice:', err.message);
      const globalCached = localStorage.getItem('habit_hacker_tasks_global_v2');
      if (globalCached) {
        updateTasksState(JSON.parse(globalCached), userEmail);
      } else {
        updateTasksState(INITIAL_DEFAULT_TASKS, userEmail);
      }
    }
  };

  const handleTabSwitch = (newTab) => {
    if (newTab === activeTab) return;
    setIsLoadingView(true);
    setDedicatedTaskPageItem(null);
    setActiveTab(newTab);
    setTimeout(() => setIsLoadingView(false), 200);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('sb-access-token');
    setCurrentUser(null);
  };

  const handleArchiveTask = async (taskId) => {
    let updatedTask = null;

    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        if (t.isArchived) {
          const archiveTime = t.archivedAt ? new Date(t.archivedAt).getTime() : Date.now() - 86400000 * 5;
          const daysArchived = Math.max(1, Math.round((Date.now() - archiveTime) / (1000 * 60 * 60 * 24)));
          
          const currentEndDate = new Date(t.plannedEnd || Date.now());
          currentEndDate.setDate(currentEndDate.getDate() + daysArchived);
          const newEndDateStr = currentEndDate.toISOString().split('T')[0];

          updatedTask = {
            ...t,
            isArchived: false,
            archivedAt: null,
            plannedEnd: newEndDateStr,
            deadline: newEndDateStr
          };
          return updatedTask;
        } else {
          updatedTask = {
            ...t,
            isArchived: true,
            archivedAt: new Date().toISOString()
          };
          return updatedTask;
        }
      }
      return t;
    });

    updateTasksState(newTasks);

    if (currentUser && updatedTask) {
      await supabase.from('tasks').update({
        is_archived: updatedTask.isArchived,
        archived_at: updatedTask.archivedAt,
        end_date: updatedTask.plannedEnd,
        deadline: updatedTask.deadline
      }).eq('id', taskId);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    updateTasksState(newTasks);
    setSubtasks(prev => prev.filter(s => s.parentTaskId !== taskId));

    if (currentUser) {
      await supabase.from('tasks').delete().eq('id', taskId);
    }
  };

  const handleMapTaskParent = async (taskId, newParentId) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, parentTaskId: newParentId } : t);
    updateTasksState(newTasks);

    if (currentUser) {
      await supabase.from('tasks').update({ parent_id: newParentId || null, parent_task_id: newParentId || null }).eq('id', taskId);
    }
  };

  const handleUnmapSubtask = async (taskId) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, parentTaskId: '' } : t);
    updateTasksState(newTasks);

    if (currentUser) {
      await supabase.from('tasks').update({ parent_id: null, parent_task_id: null }).eq('id', taskId);
    }
  };

  const handleOpenDatePickerForTask = (task) => {
    setSelectedTaskForPicker(task);
    setIsDatePickerOpen(true);
  };

  const handleApplyScheduleToTask = (schedule) => {
    if (selectedTaskForPicker) {
      const newTasks = tasks.map(t => t.id === selectedTaskForPicker.id ? { 
        ...t, 
        plannedStart: schedule.date,
        repeatRule: schedule.repeatRule
      } : t);
      updateTasksState(newTasks);
    }
    setIsDatePickerOpen(false);
  };

  const activeTasks = tasks.filter(t => !t.isArchived);
  const plannedTaskMinutes = activeTasks.reduce((sum, t) => sum + (t.progressPercent < 100 ? t.estimatedMinutes : 0), 0);
  const plannedSubtaskMinutes = subtasks.reduce((sum, s) => sum + (s.status !== 'COMPLETED' ? s.estimatedMinutes : 0), 0);
  const totalPlannedMinutes = plannedTaskMinutes + plannedSubtaskMinutes;
  const overloadMinutes = Math.max(0, totalPlannedMinutes - availableCapacityMinutes);
  const isOverloaded = overloadMinutes > 0;

  const capacityData = {
    availableCapacityMinutes,
    availableHours: (availableCapacityMinutes / 60).toFixed(1),
    plannedMinutes: totalPlannedMinutes,
    plannedHours: (totalPlannedMinutes / 60).toFixed(1),
    overloadMinutes,
    overloadHours: (overloadMinutes / 60).toFixed(1),
    isOverloaded,
    workloadPercentage: Math.round((totalPlannedMinutes / availableCapacityMinutes) * 100),
    warningMessage: isOverloaded 
      ? `You have planned ${(totalPlannedMinutes/60).toFixed(1)}h of work today, exceeding your ${(availableCapacityMinutes/60).toFixed(1)}h capacity by ${overloadMinutes} minutes (${(overloadMinutes/60).toFixed(1)}h).`
      : null
  };

  const disciplineScore = {
    disciplineScore: activeTasks.length > 0 ? Math.round((activeTasks.filter(t => t.progressPercent === 100).length / activeTasks.length) * 100) : 100,
    grade: 'EXCELLENT',
    taskCompletionRate: activeTasks.length > 0 ? Math.round((activeTasks.filter(t => t.progressPercent === 100).length / activeTasks.length) * 100) : 100,
    onTimeRate: 100,
    habitConsistencyRate: 100,
    planAdherenceRate: 100
  };

  const handleToggleTask = async (taskId, customMeasureValue = null) => {
    let updatedTask = null;

    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        const target = t.targetCount || t.targetDayCount || t.targetEventCount || 50;
        const isDoneCurrently = t.isDoneToday || t.progressPercent >= 100;
        
        let nextCount = t.currentCount || 0;
        let nextIsDone = false;

        if (isDoneCurrently) {
          nextCount = Math.max(0, nextCount - 1);
          nextIsDone = false;
        } else {
          nextCount = Math.min(target, nextCount + 1);
          nextIsDone = true;
        }

        const nextProg = Math.round((nextCount / target) * 100);

        updatedTask = {
          ...t,
          currentCount: nextCount,
          currentDayCount: nextCount,
          currentEventCount: nextCount,
          progressPercent: nextProg,
          isDoneToday: nextIsDone,
          lastMeasuredValue: customMeasureValue !== null ? customMeasureValue : t.lastMeasuredValue
        };
        return updatedTask;
      }
      return t;
    });

    updateTasksState(newTasks);

    if (currentUser && updatedTask) {
      await supabase.from('tasks').update({
        current_count: updatedTask.currentCount,
        progress_percent: updatedTask.progressPercent
      }).eq('id', taskId);

      if (updatedTask.isDoneToday) {
        await supabase.from('task_logs').insert([{
          task_id: taskId,
          user_id: currentUser.id,
          logged_at: new Date().toISOString(),
          increment_value: 1,
          measured_value: customMeasureValue !== null ? customMeasureValue : 0
        }]);
      }
    }
  };

  const handleUndoTask = async (taskId) => {
    let updatedTask = null;

    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        let prevCount = Math.max(0, (t.currentCount || 1) - 1);
        const target = t.targetCount || 50;
        const prevProg = Math.round((prevCount / target) * 100);

        updatedTask = {
          ...t,
          currentCount: prevCount,
          currentDayCount: prevCount,
          currentEventCount: prevCount,
          progressPercent: prevProg,
          isDoneToday: false
        };
        return updatedTask;
      }
      return t;
    });

    updateTasksState(newTasks);

    if (currentUser && updatedTask) {
      await supabase.from('tasks').update({
        current_count: updatedTask.currentCount,
        progress_percent: updatedTask.progressPercent
      }).eq('id', taskId);

      await supabase.from('task_logs').delete().eq('task_id', taskId).order('logged_at', { ascending: false }).limit(1);
    }
  };

  const handleLogEventCount = async (taskId) => {
    let updatedTask = null;

    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        const target = t.targetCount || 50;
        const nextCount = (t.currentCount || 0) + 1;
        const nextProg = Math.round((nextCount / target) * 100);
        updatedTask = {
          ...t,
          currentCount: nextCount,
          currentEventCount: nextCount,
          progressPercent: nextProg,
          isDoneToday: nextCount >= target
        };
        return updatedTask;
      }
      return t;
    });

    updateTasksState(newTasks);

    if (currentUser && updatedTask) {
      await supabase.from('tasks').update({
        current_count: updatedTask.currentCount,
        progress_percent: updatedTask.progressPercent
      }).eq('id', taskId);

      await supabase.from('task_logs').insert([{
        task_id: taskId,
        user_id: currentUser.id,
        logged_at: new Date().toISOString(),
        increment_value: 1
      }]);
    }
  };

  const handleToggleSubtask = (subtaskId) => {
    setSubtasks(prev => prev.map(s => {
      if (s.id === subtaskId) {
        const nextStatus = s.status === 'COMPLETED' ? 'PLANNED' : 'COMPLETED';
        return { ...s, status: nextStatus, completedValue: nextStatus === 'COMPLETED' ? s.targetValue : 0 };
      }
      return s;
    }));
  };

  const handleUpdateSubtaskCount = (subtaskId, delta) => {
    setSubtasks(prev => prev.map(s => {
      if (s.id === subtaskId) {
        const newVal = Math.max(0, Math.min(s.targetValue, s.completedValue + delta));
        return { ...s, completedValue: newVal, status: newVal >= s.targetValue ? 'COMPLETED' : 'IN_PROGRESS' };
      }
      return s;
    }));
  };

  const handleAddTask = async (newTaskData) => {
    const parentId = `t-${Date.now()}`;

    const newTask = {
      id: parentId,
      user_id: currentUser?.id || 'demo-user-123',
      title: newTaskData.title,
      description: newTaskData.description || '',
      collab: newTaskData.collab || '',
      priority: newTaskData.priority || 'MEDIUM',
      isOptional: newTaskData.isOptional || false,
      hasMeasureTracking: newTaskData.hasMeasureTracking || false,
      measureUnit: newTaskData.measureUnit || 'units',
      measureTarget: newTaskData.measureTarget || 0,
      progressPercent: 0,
      plannedStart: newTaskData.startDate || '2026-08-22',
      plannedEnd: newTaskData.endDate || '2026-10-10',
      deadline: newTaskData.endDate || '2026-10-10',
      estimatedMinutes: newTaskData.estimatedMinutes || 30,
      reminderTime: newTaskData.reminderTime || '09:00 AM',
      actualMinutes: 0,
      category: newTaskData.category || 'General',
      section: newTaskData.section || 'General',
      trackingMode: newTaskData.trackingMode || 'end_date',
      targetCount: newTaskData.targetCount || 50,
      targetDayCount: newTaskData.targetDayCount || 50,
      targetEventCount: newTaskData.targetEventCount || 50,
      currentCount: 0,
      currentDayCount: 0,
      currentEventCount: 0,
      repeatRule: newTaskData.repeatRule || 'DAILY',
      parentTaskId: newTaskData.parentTaskId || '',
      attachmentName: newTaskData.attachmentName || '',
      isArchived: false,
      archivedAt: null,
      isDoneToday: false,
      skipReason: ''
    };

    const newTasks = [newTask, ...tasks];
    updateTasksState(newTasks);

    if (currentUser) {
      await supabase.from('tasks').insert([{
        id: parentId,
        user_id: currentUser.id,
        title: newTask.title,
        description: newTask.description,
        collab: newTask.collab,
        priority: newTask.priority,
        is_optional: newTask.isOptional,
        has_measure_tracking: newTask.hasMeasureTracking,
        measure_unit: newTask.measureUnit,
        measure_target: newTask.measureTarget,
        start_date: newTask.plannedStart,
        end_date: newTask.plannedEnd,
        planned_start: newTask.plannedStart,
        planned_end: newTask.plannedEnd,
        deadline: newTask.deadline,
        estimated_minutes: newTask.estimatedMinutes,
        tracking_mode: newTask.trackingMode,
        target_count: newTask.targetCount,
        current_count: 0,
        parent_id: newTask.parentTaskId || null,
        parent_task_id: newTask.parentTaskId || null,
        attachment_name: newTask.attachmentName
      }]);
    }
  };

  const handleAddSubtask = (parentTaskId) => {
    handleOpenQuickAddForSubtask(parentTaskId);
  };

  const handleSaveTaskEdit = async (taskId, updatedData) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, ...updatedData } : t);
    updateTasksState(newTasks);

    if (currentUser) {
      await supabase.from('tasks').update({
        title: updatedData.title,
        description: updatedData.description,
        category: updatedData.category,
        priority: updatedData.priority,
        is_optional: updatedData.isOptional,
        has_measure_tracking: updatedData.hasMeasureTracking,
        measure_unit: updatedData.measureUnit,
        measure_target: updatedData.measureTarget,
        estimated_minutes: updatedData.estimatedMinutes,
        start_date: updatedData.plannedStart,
        end_date: updatedData.plannedEnd,
        deadline: updatedData.deadline,
        attachment_name: updatedData.attachmentName
      }).eq('id', taskId);
    }
  };

  const handleLogSkipReason = (taskId, reason) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, skipReason: reason } : t);
    updateTasksState(newTasks);
  };

  const [preselectedParentTaskId, setPreselectedParentTaskId] = useState('');

  const handleOpenQuickAddForSubtask = (parentTaskId) => {
    setPreselectedParentTaskId(parentTaskId);
    setIsQuickAddOpen(true);
  };

  const handleOpenGeneralQuickAdd = () => {
    setPreselectedParentTaskId('');
    setIsQuickAddOpen(true);
  };

  if (!currentUser) {
    return <AuthLandingPage onAuthSuccess={(user) => { setCurrentUser(user); fetchUserData(user.id, user.email); }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '40px' }}>
      
      {/* Top Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={handleTabSwitch}
        capacityData={capacityData}
        currentUser={currentUser}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onTriggerAlertPreview={() => setIsReminderOpen(true)}
        onOpenQuickAdd={handleOpenGeneralQuickAdd}
        onOpenAuth={() => handleTabSwitch('settings')}
        showArchivedVault={showArchivedVault}
        onToggleArchivedVault={() => setShowArchivedVault(prev => !prev)}
      />

      {/* Sidebar Drawer */}
      <SidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        setActiveTab={handleTabSwitch}
      />

      {/* ANIMATIVE VIEW LOADING SPINNER */}
      {isLoadingView ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #DC2626, #F59E0B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spinLoader 0.6s linear infinite'
          }}>
            <Flame size={24} color="#FFF" />
          </div>
          <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: 700 }}>Loading View...</div>
        </div>
      ) : (
        /* Main View Switcher */
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 12px' }}>
          
          {/* DEDICATED FULL-SCREEN TASK PAGE ON DOUBLE CLICK */}
          {dedicatedTaskPageItem ? (
            <TaskDedicatedPageView 
              task={dedicatedTaskPageItem}
              childSubtasks={tasks.filter(t => t.parentTaskId === dedicatedTaskPageItem.id)}
              onBack={() => setDedicatedTaskPageItem(null)}
              onEditTask={(t) => setSelectedEditItem(t)}
              onToggleTask={handleToggleTask}
              onArchiveTask={handleArchiveTask}
              onDeleteTask={(id) => { handleDeleteTask(id); setDedicatedTaskPageItem(null); }}
            />
          ) : (
            <>
              {activeTab === 'widgets' && (
                <WidgetsHubView 
                  tasks={activeTasks}
                  habits={habits}
                  onOpenQuickAdd={handleOpenGeneralQuickAdd}
                />
              )}

              {activeTab === 'today' && (
                <TodayDashboard 
                  capacityData={capacityData}
                  tasks={activeTasks}
                  habits={habits}
                  disciplineScore={disciplineScore}
                  onToggleTask={handleToggleTask}
                  onHabitCheckIn={(id) => setHabits(prev => prev.map(h => h.id === id ? { ...h, actualValue: h.targetValue } : h))}
                  onUpdateTaskProgress={(id, prog) => {
                    const updated = tasks.map(t => t.id === id ? { ...t, progressPercent: prog } : t);
                    updateTasksState(updated);
                  }}
                  onOpenQuickAdd={handleOpenGeneralQuickAdd}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskSubtaskView 
                  tasks={tasks}
                  subtasks={subtasks}
                  onToggleTask={handleToggleTask}
                  onUndoTask={handleUndoTask}
                  onLogEventCount={handleLogEventCount}
                  onToggleSubtask={handleToggleSubtask}
                  onUpdateSubtaskCount={handleUpdateSubtaskCount}
                  onAddSubtask={handleAddSubtask}
                  onOpenTaskDetail={(item) => setSelectedDetailItem(item)}
                  onOpenQuickAdd={handleOpenGeneralQuickAdd}
                  onOpenQuickAddForSubtask={handleOpenQuickAddForSubtask}
                  onArchiveTask={handleArchiveTask}
                  onDeleteTask={handleDeleteTask}
                  onMapTaskParent={handleMapTaskParent}
                  onUnmapSubtask={handleUnmapSubtask}
                  onOpenDedicatedTaskPage={(task) => setDedicatedTaskPageItem(task)}
                  onEditTask={(task) => setSelectedEditItem(task)}
                />
              )}

              {activeTab === 'planner' && (
                <CapacityPlannerView 
                  capacityData={capacityData}
                  onUpdateCapacity={(mins) => setAvailableCapacityMinutes(mins)}
                  onRescheduleTask={(taskId) => {
                    const updated = tasks.map(t => t.id === taskId ? { ...t, plannedStart: '2026-08-22', plannedEnd: '2026-08-22' } : t);
                    updateTasksState(updated);
                  }}
                />
              )}

              {activeTab === 'calendar' && (
                <MultiViewCalendar 
                  calendarData={{ tasks: activeTasks, subtasks, habits }}
                  onSelectDate={(date) => console.log('Selected Date:', date)}
                />
              )}

              {activeTab === 'heatmaps' && (
                <HeatmapsHubView 
                  heatmapData={{ tasks: activeTasks, subtasks, habits }}
                  onSelectDay={(day) => console.log('Heatmap day clicked:', day)}
                />
              )}

              {activeTab === 'analytics' && (
                <BarGraphAnalyticsView tasks={activeTasks} subtasks={subtasks} />
              )}

              {activeTab === 'focus' && (
                <FocusTimerView tasks={activeTasks} subtasks={subtasks} />
              )}

              {activeTab === 'diary' && (
                <DiaryReflectionView />
              )}

              {activeTab === 'goals' && (
                <GoalsManagementView />
              )}

              {activeTab === 'projects' && (
                <ProjectsKanbanView tasks={activeTasks} />
              )}

              {activeTab === 'routines' && (
                <RoutinesTemplatesView />
              )}

              {activeTab === 'settings' && (
                <SettingsProfileView 
                  currentUser={currentUser}
                  onLogout={handleSignOut}
                  onOpenAuth={() => setCurrentUser(null)}
                />
              )}
            </>
          )}

        </main>
      )}

      {/* Modals & Overlay Windows */}
      <NotificationAlertManager 
        isOpen={isReminderOpen} 
        onClose={() => setIsReminderOpen(false)} 
      />

      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => { setIsQuickAddOpen(false); setPreselectedParentTaskId(''); }} 
        onAddTask={handleAddTask} 
        existingTasks={tasks}
        preselectedParentTaskId={preselectedParentTaskId}
      />

      <TaskDetailModal 
        item={selectedDetailItem}
        subtasks={subtasks}
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onEditItem={(item) => {
          setSelectedDetailItem(null);
          setSelectedEditItem(item);
        }}
        onOpenDatePicker={handleOpenDatePickerForTask}
        onLogSkipReason={handleLogSkipReason}
      />

      <TaskEditModal 
        item={selectedEditItem}
        isOpen={!!selectedEditItem}
        onClose={() => setSelectedEditItem(null)}
        onSaveTask={handleSaveTaskEdit}
      />

      <DateDurationPickerModal 
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectSchedule={handleApplyScheduleToTask}
      />

    </div>
  );
}

// Push commit iteration 1
