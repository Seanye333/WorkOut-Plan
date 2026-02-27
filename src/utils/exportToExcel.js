import * as XLSX from "xlsx";
import { getWeekId } from "./dateHelpers";

/**
 * Exports all workout logs to an Excel file.
 * Each set becomes one row.
 *
 * @param {Array} logs - Array of workout log objects from Firestore
 * @param {Array} exercises - Array of exercises from the user's library (for muscle group lookup)
 */
export function exportWorkoutsToExcel(logs, exercises) {
  // Build a quick lookup: exerciseId -> { muscleGroup }
  const exerciseMap = {};
  exercises.forEach((ex) => {
    exerciseMap[ex.id] = ex;
  });

  const rows = [];

  for (const log of logs) {
    const rawDate = log.loggedAt?.toDate
      ? log.loggedAt.toDate()
      : new Date(log.date ?? log.loggedAt);

    const dateStr = rawDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const weekId = getWeekId(rawDate);

    for (const exercise of log.exercises ?? []) {
      const libEntry = exerciseMap[exercise.exerciseId];
      const muscleGroup = libEntry?.muscleGroup ?? exercise.muscleGroup ?? "";

      for (const set of exercise.sets ?? []) {
        rows.push({
          Date: dateStr,
          Week: weekId,
          "Workout Type": log.name ?? "",
          Exercise: exercise.exerciseName ?? "",
          "Muscle Group": muscleGroup,
          "Set #": set.setNumber ?? "",
          Reps: set.reps ?? "",
          Weight: set.weight ?? "",
          Unit: set.weightUnit ?? "",
          Completed: set.completed ? "Yes" : "No",
          "Duration (min)": log.durationMinutes > 0 ? log.durationMinutes : "",
          Calories: "",   // fill in manually or track in future
          Notes: log.notes ?? "",
        });
      }
    }

    // If a log has no exercises (ad-hoc / cardio), still add a summary row
    if (!log.exercises?.length) {
      rows.push({
        Date: dateStr,
        Week: weekId,
        "Workout Type": log.name ?? "",
        Exercise: "",
        "Muscle Group": "",
        "Set #": "",
        Reps: "",
        Weight: "",
        Unit: "",
        Completed: "Yes",
        "Duration (min)": log.durationMinutes > 0 ? log.durationMinutes : "",
        Calories: "",
        Notes: log.notes ?? "",
      });
    }
  }

  if (rows.length === 0) {
    alert("No workout data to export yet.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-size columns
  const colWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((r) => String(r[key] ?? "").length)
    ) + 2,
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Workout History");

  const fileName = `workout-history-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
