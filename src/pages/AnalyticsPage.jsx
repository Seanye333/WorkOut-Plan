import { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useWorkoutLog } from "../hooks/useWorkoutLog";
import { useExercises } from "../hooks/useExercises";
import Spinner from "../components/common/Spinner";
import {
  getWeeklyFrequency,
  getVolumeOverTime,
  getMuscleGroupDistribution,
  getExerciseProgress,
  getDurationTrend,
  getSummaryStats,
} from "../utils/analyticsHelpers";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  "#f97316", "#84cc16",
];

function StatCard({ label, value, sub }) {
  return (
    <div className="card text-center">
      <p className="text-3xl font-bold text-indigo-400">{value}</p>
      <p className="text-white font-medium mt-1">{label}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <h3 className="font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#f9fafb",
};

export default function AnalyticsPage() {
  const { fetchAllLogs } = useWorkoutLog();
  const { exercises } = useExercises();
  const [logs, setLogs] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    fetchAllLogs().then(setLogs);
  }, []);

  const exerciseMap = useMemo(() => {
    const m = {};
    exercises.forEach((ex) => (m[ex.id] = ex));
    return m;
  }, [exercises]);

  // Unique exercise names that appear in logs
  const loggedExerciseNames = useMemo(() => {
    if (!logs) return [];
    const names = new Set();
    logs.forEach((log) =>
      log.exercises?.forEach((ex) => ex.exerciseName && names.add(ex.exerciseName))
    );
    return [...names].sort();
  }, [logs]);

  useEffect(() => {
    if (loggedExerciseNames.length > 0 && !selectedExercise) {
      setSelectedExercise(loggedExerciseNames[0]);
    }
  }, [loggedExerciseNames]);

  if (logs === null) return <Spinner />;

  if (logs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">📈</p>
        <p className="text-lg font-medium text-gray-400">No data yet</p>
        <p className="text-sm mt-1">Log some workouts to see your analytics.</p>
      </div>
    );
  }

  const stats = getSummaryStats(logs, exerciseMap);
  const weeklyFreq = getWeeklyFrequency(logs);
  const volumeData = getVolumeOverTime(logs);
  const muscleData = getMuscleGroupDistribution(logs, exerciseMap);
  const durationData = getDurationTrend(logs);
  const progressData = getExerciseProgress(logs, selectedExercise);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Workouts" value={stats.totalWorkouts} />
        <StatCard
          label="Total Volume"
          value={stats.totalVolume.toLocaleString()}
          sub="kg × reps lifted"
        />
        <StatCard
          label="Total Time"
          value={`${Math.round(stats.totalDuration / 60)}h`}
          sub={`${stats.totalDuration} min`}
        />
        <StatCard label="Top Muscle" value={stats.topMuscle} sub="most trained" />
      </div>

      {/* Row 1: Weekly frequency + Muscle distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Workouts Per Week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyFreq} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Workouts" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Muscle Group Distribution">
          {muscleData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No muscle data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={muscleData}
                  dataKey="count"
                  nameKey="muscleGroup"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ muscleGroup, percent }) =>
                    `${muscleGroup} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {muscleData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 2: Volume over time + Duration trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Total Volume Per Session (kg × reps)">
          {volumeData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No volume data — log workouts with weight to see this chart.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={volumeData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#6366f1" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Workout Duration (min)">
          {durationData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No duration data — duration is recorded automatically when you log workouts.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={durationData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="duration"
                  name="Minutes"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 3: Exercise progress tracker */}
      <ChartCard title="Exercise Progress — Max Weight Over Time">
        {loggedExerciseNames.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No exercise data yet.
          </p>
        ) : (
          <>
            <div className="mb-4">
              <select
                className="input sm:max-w-xs"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                {loggedExerciseNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            {progressData.length < 2 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                Not enough data yet — log this exercise at least twice to see progress.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={progressData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} unit={` ${progressData[0]?.unit ?? "kg"}`} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`${v} ${progressData[0]?.unit ?? "kg"}`, "Max Weight"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    name="Max Weight"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#f59e0b" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </ChartCard>
    </div>
  );
}
