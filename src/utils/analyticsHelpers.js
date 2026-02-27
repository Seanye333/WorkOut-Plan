import { getWeekId } from "./dateHelpers";

/**
 * Returns array of { week, count } sorted ascending — workouts per week.
 */
export function getWeeklyFrequency(logs) {
  const map = {};
  for (const log of logs) {
    const date = log.loggedAt?.toDate
      ? log.loggedAt.toDate()
      : new Date(log.date ?? log.loggedAt);
    const week = getWeekId(date);
    map[week] = (map[week] ?? 0) + 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));
}

/**
 * Returns array of { date, volume } — total volume (sets × reps × weight) per workout session.
 */
export function getVolumeOverTime(logs) {
  return logs
    .map((log) => {
      const date = log.loggedAt?.toDate
        ? log.loggedAt.toDate()
        : new Date(log.date ?? log.loggedAt);
      let volume = 0;
      for (const ex of log.exercises ?? []) {
        for (const s of ex.sets ?? []) {
          if (s.completed && s.weight > 0) {
            volume += (s.reps ?? 0) * (s.weight ?? 0);
          }
        }
      }
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        volume: Math.round(volume),
        name: log.name,
      };
    })
    .filter((d) => d.volume > 0)
    .reverse(); // oldest first
}

/**
 * Returns array of { muscleGroup, count } for pie chart.
 */
export function getMuscleGroupDistribution(logs, exerciseMap) {
  const map = {};
  for (const log of logs) {
    for (const ex of log.exercises ?? []) {
      const muscle =
        exerciseMap[ex.exerciseId]?.muscleGroup ?? ex.muscleGroup ?? "Other";
      map[muscle] = (map[muscle] ?? 0) + 1;
    }
  }
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([muscleGroup, count]) => ({ muscleGroup, count }));
}

/**
 * Returns array of { date, maxWeight } for a specific exercise — progress over time.
 */
export function getExerciseProgress(logs, exerciseName) {
  const result = [];
  for (const log of [...logs].reverse()) {
    const ex = log.exercises?.find(
      (e) => e.exerciseName?.toLowerCase() === exerciseName.toLowerCase()
    );
    if (!ex) continue;
    const date = log.loggedAt?.toDate
      ? log.loggedAt.toDate()
      : new Date(log.date ?? log.loggedAt);
    const maxWeight = Math.max(
      0,
      ...(ex.sets ?? []).filter((s) => s.completed).map((s) => s.weight ?? 0)
    );
    if (maxWeight > 0) {
      result.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        maxWeight,
        unit: ex.sets?.[0]?.weightUnit ?? "kg",
      });
    }
  }
  return result;
}

/**
 * Returns array of { date, duration } for duration trend.
 */
export function getDurationTrend(logs) {
  return logs
    .filter((log) => log.durationMinutes > 0)
    .map((log) => {
      const date = log.loggedAt?.toDate
        ? log.loggedAt.toDate()
        : new Date(log.date ?? log.loggedAt);
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        duration: log.durationMinutes,
        name: log.name,
      };
    })
    .reverse();
}

/**
 * Summary stats: total workouts, total volume, total duration, most trained muscle.
 */
export function getSummaryStats(logs, exerciseMap) {
  let totalVolume = 0;
  let totalDuration = 0;
  const muscleCounts = {};

  for (const log of logs) {
    totalDuration += log.durationMinutes ?? 0;
    for (const ex of log.exercises ?? []) {
      for (const s of ex.sets ?? []) {
        if (s.completed && s.weight > 0) {
          totalVolume += (s.reps ?? 0) * (s.weight ?? 0);
        }
      }
      const muscle =
        exerciseMap[ex.exerciseId]?.muscleGroup ?? ex.muscleGroup ?? "Other";
      muscleCounts[muscle] = (muscleCounts[muscle] ?? 0) + 1;
    }
  }

  const topMuscle =
    Object.entries(muscleCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";

  return {
    totalWorkouts: logs.length,
    totalVolume: Math.round(totalVolume),
    totalDuration,
    topMuscle,
  };
}
