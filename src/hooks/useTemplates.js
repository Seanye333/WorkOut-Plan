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

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = query(
      collection(db, "users", user.uid, "templates"),
      orderBy("name")
    );
    const unsub = onSnapshot(ref, (snap) => {
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addTemplate = (data) =>
    addDoc(collection(db, "users", user.uid, "templates"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  const updateTemplate = (id, data) =>
    updateDoc(doc(db, "users", user.uid, "templates", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const deleteTemplate = (id) =>
    deleteDoc(doc(db, "users", user.uid, "templates", id));

  return { templates, loading, addTemplate, updateTemplate, deleteTemplate };
}
