import { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 20;

export function useWorkoutLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  const createLog = useCallback(
    async (logData) => {
      const ref = collection(db, "users", user.uid, "workoutLogs");
      const docRef = await addDoc(ref, {
        ...logData,
        loggedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    [user]
  );

  const fetchLogs = useCallback(
    async (reset = false) => {
      if (!user) return;
      setLoading(true);
      try {
        const ref = collection(db, "users", user.uid, "workoutLogs");
        let q = query(ref, orderBy("loggedAt", "desc"), limit(PAGE_SIZE));
        if (!reset && lastDoc) {
          q = query(ref, orderBy("loggedAt", "desc"), startAfter(lastDoc), limit(PAGE_SIZE));
        }
        const snap = await getDocs(q);
        const newLogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLogs((prev) => (reset ? newLogs : [...prev, ...newLogs]));
        setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
        setHasMore(snap.docs.length === PAGE_SIZE);
      } finally {
        setLoading(false);
      }
    },
    [user, lastDoc]
  );

  const loadMore = useCallback(() => fetchLogs(false), [fetchLogs]);
  const refresh = useCallback(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchLogs(true);
  }, [fetchLogs]);

  const fetchAllLogs = useCallback(async () => {
    if (!user) return [];
    const ref = collection(db, "users", user.uid, "workoutLogs");
    const q = query(ref, orderBy("loggedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }, [user]);

  return { logs, loading, hasMore, createLog, loadMore, refresh, fetchAllLogs };
}
