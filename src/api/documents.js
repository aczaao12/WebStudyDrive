import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, where, documentId } from 'firebase/firestore';

export const fetchMajors = async () => {
  const majorsCol = collection(db, 'majors');
  const majorSnapshot = await getDocs(majorsCol);
  return majorSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
};

export const fetchTags = async () => {
  const tagsCol = collection(db, 'tags');
  const tagSnapshot = await getDocs(tagsCol);
  return tagSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
};

// Helper to fetch documents by a list of IDs, handling Firestore's 'in' query limit
export const fetchDocumentsByIds = async (ids) => {
  if (ids.length === 0) return {};

  const documentsMap = {};
  const chunkSize = 10; // Firestore 'in' query limit
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const q = query(collection(db, 'documents'), where(documentId(), 'in', chunk));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach(doc => {
      documentsMap[doc.id] = { id: doc.id, ...doc.data() };
    });
  }
  return documentsMap;
};

export const fetchDocuments = async (searchTerm, major, tags, sortBy, lastDoc, limitCount = 10) => {
  let q = collection(db, 'documents');
  const queryConstraints = [];

  if (major) {
    queryConstraints.push(where('major', '==', major));
  }

  if (tags && tags.length > 0) {
    queryConstraints.push(where('tags', 'array-contains-any', tags));
  }

  if (sortBy === 'newest') {
    queryConstraints.push(orderBy('createdAt', 'desc'));
  } else if (sortBy === 'oldest') {
    queryConstraints.push(orderBy('createdAt', 'asc'));
  } else {
    queryConstraints.push(orderBy('createdAt', 'desc')); // Default sort
  }

  queryConstraints.push(limit(limitCount));

  if (lastDoc) {
    queryConstraints.push(startAfter(lastDoc));
  }

  q = query(q, ...queryConstraints);

  const documentSnapshot = await getDocs(q);
  const documents = documentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toLocaleDateString(), // Format date for display
  }));

  // Client-side filtering for searchTerm if present
  const filteredDocuments = searchTerm
    ? documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : documents;

  return { documents: filteredDocuments, lastDoc: documentSnapshot.docs[documentSnapshot.docs.length - 1] };
};