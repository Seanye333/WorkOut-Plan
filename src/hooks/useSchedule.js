import { useEffect, useState, useCallback } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { getWeekId, getWeekStart } from "../utils/dateHelpers";
import { DAYS_OF_WEEK } from "../utils/constants";

function emptyWeek(weekStart) {
  const days = {};
  DAYS_OF_WEEK.forEach((d) => (days[d] = { workouts: [] }));
  return { weekStart: weekStart.toISOString(), days };
}

export function useSchedule(referenceDate) {
  const { user } = useAuth();
  const weekStart = getWeekStart(referenceDate ?? new Date());
  const weekId = getWeekId(weekStart);

  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "schedule", weekId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setWeekData({ id: snap.id, ...snap.data() });
      } else {
        setWeekData(emptyWeek(weekStart));
      }
      setLoading(false);
    });
    return unsub;
  }, [user, weekId]);

  const saveDay = useCallback(
    async (dayKey, workouts) => {
      const ref = doc(db, "users", user.uid, "schedule", weekId);
      if (weekData && weekData.id) {
        await updateDoc(ref, {
          [`days.${dayKey}.workouts`]: workouts,
          updatedAt: serverTimestamp(),
        });
      } else {
        const data = emptyWeek(weekStart);
        data.days[dayKey].workouts = workouts;
        await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
      }
    },
    [user, weekId, weekData, weekStart]
  );

  const addWorkoutToDay = useCallback(
    async (dayKey, workout) => {
      const currentWorkouts = weekData?.days?.[dayKey]?.workouts ?? [];
      await saveDay(dayKey, [...currentWorkouts, workout]);
    },
    [weekData, saveDay]
  );

  const updateWorkoutInDay = useCallback(
    async (dayKey, workoutIndex, updates) => {
      const currentWorkouts = [...(weekData?.days?.[dayKey]?.workouts ?? [])];
      currentWorkouts[workoutIndex] = { ...currentWorkouts[workoutIndex], ...updates };
      await saveDay(dayKey, currentWorkouts);
    },
    [weekData, saveDay]
  );

  const removeWorkoutFromDay = useCallback(
    async (dayKey, workoutIndex) => {
      const currentWorkouts = [...(weekData?.days?.[dayKey]?.workouts ?? [])];
      currentWorkouts.splice(workoutIndex, 1);
      await saveDay(dayKey, currentWorkouts);
    },
    [weekData, saveDay]
  );

  return {
    weekData,
    loading,
    weekId,
    weekStart,
    addWorkoutToDay,
    updateWorkoutInDay,
    removeWorkoutFromDay,
  };
}
