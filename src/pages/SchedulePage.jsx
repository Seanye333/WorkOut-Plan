import { useState } from "react";
import { useSchedule } from "../hooks/useSchedule";
import DayColumn from "../components/schedule/DayColumn";
import Spinner from "../components/common/Spinner";
import { DAYS_OF_WEEK } from "../utils/constants";
import { getDaysOfWeek, formatWeekRange } from "../utils/dateHelpers";

export default function SchedulePage() {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const { weekData, loading, weekStart, addWorkoutToDay, removeWorkoutFromDay } =
    useSchedule(referenceDate);

  const days = getDaysOfWeek(weekStart);

  function prevWeek() {
    setReferenceDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 7);
      return nd;
    });
  }

  function nextWeek() {
    setReferenceDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 7);
      return nd;
    });
  }

  function goToday() {
    setReferenceDate(new Date());
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Weekly Schedule</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm py-1 px-3" onClick={prevWeek}>← Prev</button>
          <button className="btn-secondary text-sm py-1 px-3" onClick={goToday}>Today</button>
          <button className="btn-secondary text-sm py-1 px-3" onClick={nextWeek}>Next →</button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4">{formatWeekRange(weekStart)}</p>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Desktop: 7-column grid */}
          <div className="hidden md:grid grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((dayKey, i) => (
              <DayColumn
                key={dayKey}
                dayKey={dayKey}
                date={days[i]}
                workouts={weekData?.days?.[dayKey]?.workouts ?? []}
                onAdd={addWorkoutToDay}
                onRemove={(idx) => removeWorkoutFromDay(dayKey, idx)}
              />
            ))}
          </div>

          {/* Mobile: vertical list */}
          <div className="flex flex-col gap-4 md:hidden">
            {DAYS_OF_WEEK.map((dayKey, i) => (
              <div key={dayKey} className="card">
                <DayColumn
                  dayKey={dayKey}
                  date={days[i]}
                  workouts={weekData?.days?.[dayKey]?.workouts ?? []}
                  onAdd={addWorkoutToDay}
                  onRemove={(idx) => removeWorkoutFromDay(dayKey, idx)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
