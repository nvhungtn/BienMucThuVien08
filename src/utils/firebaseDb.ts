import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy 
} from "firebase/firestore";
import { app } from "./firebaseAuth";
import { BookRecord } from "../types";

export const db = getFirestore(app);

const BOOKS_COLLECTION = "books";

/**
 * Saves a single BookRecord to Firestore. Generates an ID if not present.
 */
export async function saveBookToFirestore(record: BookRecord): Promise<BookRecord> {
  const booksRef = collection(db, BOOKS_COLLECTION);
  const docId = record.id || doc(booksRef).id;
  
  const updatedRecord: BookRecord = {
    ...record,
    id: docId,
    createdAt: record.createdAt || new Date().toISOString(),
  };
  
  const docRef = doc(db, BOOKS_COLLECTION, docId);
  await setDoc(docRef, updatedRecord);
  return updatedRecord;
}

/**
 * Deletes a single BookRecord from Firestore by ID.
 */
export async function deleteBookFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, BOOKS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Fetches all BookRecords from Firestore sorted by createdAt descending.
 */
export async function getBooksFromFirestore(): Promise<BookRecord[]> {
  try {
    const booksRef = collection(db, BOOKS_COLLECTION);
    const q = query(booksRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const records: BookRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push(docSnap.data() as BookRecord);
    });
    return records;
  } catch (error) {
    console.error("Error fetching books from Firestore:", error);
    // Fallback if query failed or index is not yet built
    const booksRef = collection(db, BOOKS_COLLECTION);
    const snapshot = await getDocs(booksRef);
    const records: BookRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push(docSnap.data() as BookRecord);
    });
    // Manual sort
    return records.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
}

/**
 * Saves multiple BookRecords to Firestore.
 */
export async function bulkSaveBooksToFirestore(records: BookRecord[]): Promise<void> {
  for (const record of records) {
    await saveBookToFirestore(record);
  }
}
