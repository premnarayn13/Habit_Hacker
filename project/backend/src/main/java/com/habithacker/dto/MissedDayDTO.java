package com.habithacker.dto;

import java.util.List;

public class MissedDayDTO {

    private String date;
    private String dateFormatted;
    private int missedSubtasksCount;
    private List<String> missedSubtasks;

    public MissedDayDTO() {}

    public MissedDayDTO(String date, String dateFormatted, int missedSubtasksCount, List<String> missedSubtasks) {
        this.date = date;
        this.dateFormatted = dateFormatted;
        this.missedSubtasksCount = missedSubtasksCount;
        this.missedSubtasks = missedSubtasks;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDateFormatted() { return dateFormatted; }
    public void setDateFormatted(String dateFormatted) { this.dateFormatted = dateFormatted; }

    public int getMissedSubtasksCount() { return missedSubtasksCount; }
    public void setMissedSubtasksCount(int missedSubtasksCount) { this.missedSubtasksCount = missedSubtasksCount; }

    public List<String> getMissedSubtasks() { return missedSubtasks; }
    public void setMissedSubtasks(List<String> missedSubtasks) { this.missedSubtasks = missedSubtasks; }
}
