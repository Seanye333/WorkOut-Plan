import { useState } from "react";
import WorkoutCard from "./WorkoutCard";
import AddWorkoutModal from "./AddWorkoutModal";
import Modal from "../common/Modal";
import { DAY_LABELS } from "../../utils/constants";
import { isSameDay } from "../../utils/dateHelpers";

export default function DayColumn({ dayKey, date, workouts = [], onAdd, onRemove }) {
  const [showAdd, setShowAdd] = useState(false);
  const isToday = isSameDay(date, new Date());

  return (
    <>
      <div className={`flex flex-col gap-2 min-w-0 ${isToday ? "ring-1 ring-indigo-500 rounded-xl p-2" : ""}`}>
        {/* Day header */}
        <div className="text-center pb-1">
          <p className={`text-xs font-bold uppercase tracking-widest ${isToday ? "text-indigo-400" : "text-gray-500"}`}>
            {DAY_LABELS[dayKey]}
          </p>
          <p className={`text-lg font-bold ${isToday ? "text-indigo-300" : "text-gray-300"}`}>
            {date.getDate()}
          </p>
        </div>

        {/* Workouts */}
        <div className="flex flex-col gap-2 flex-1">
          {workouts.map((w, i) => (
            <WorkoutCard
              key={i}
              workout={w}
              dayKey={dayKey}
              workoutIndex={i}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowAdd(true)}
          className="text-xs text-gray-600 hover:text-indigo-400 border border-dashed border-gray-800 hover:border-indigo-600 rounded-lg py-2 transition-colors mt-1"
        >
          + Add
        </button>
      </div>

      {showAdd && (
        <Modal title={`Add workout — ${DAY_LABELS[dayKey]}, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`} onClose={() => setShowAdd(false)}>
          <AddWorkoutModal
            onAdd={(w) => onAdd(dayKey, w)}
            onClose={() => setShowAdd(false)}
          />
        </Modal>
      )}
    </>
  );
}
