import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export function useExercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = query(
      collection(db, "users", user.uid, "exercises"),
      orderBy("name")
    );
    const unsub = onSnapshot(ref, (snap) => {
      setExercises(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addExercise = (data) =>
    addDoc(collection(db, "users", user.uid, "exercises"), {
      ...data,
      createdAt: serverTimestamp(),
    });

  const updateExercise = (id, data) =>
    updateDoc(doc(db, "users", user.uid, "exercises", id), data);

  const deleteExercise = (id) =>
    deleteDoc(doc(db, "users", user.uid, "exercises", id));

  return { exercises, loading, addExercise, updateExercise, deleteExercise };
}
