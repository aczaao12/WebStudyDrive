import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Bookmark, BookmarkBorder, Edit, Delete, Visibility } from '@mui/icons-material';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  onSnapshot,
  orderBy,
  limit,
  getDoc,
} from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard({ currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [allDocsMap, setAllDocsMap] = useState({}); // Map to store doc details by ID
  const [loading, setLoading] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [currentNoteDoc, setCurrentNoteDoc] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  // Fetch documents based on search
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'documents'));
      if (searchTerm) {
        // Improved search: Assume major is string in documents, search by partial match isn't native, so fetch all and filter client-side for simplicity
        // For better: Use tags array-contains or major ==
        q = query(collection(db, 'documents'), where('tags', 'array-contains', searchTerm)); // Example: search by tag
        // Or add where('major', '==', searchTerm) if exact major
      }
      const querySnapshot = await getDocs(q);
      const docsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocuments(docsList);

      // Update allDocsMap
      const newMap = { ...allDocsMap };
      docsList.forEach(d => newMap[d.id] = d);
      setAllDocsMap(newMap);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Lỗi khi tìm kiếm tài liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookmarks and notes, and load referenced docs
  useEffect(() => {
    if (!currentUser) return;

    const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
    const notesRef = collection(db, `users/${currentUser.uid}/notes`);

    const unsubscribeBookmarks = onSnapshot(bookmarksRef, (snapshot) => {
      const bmList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookmarks(bmList);
      loadReferencedDocs(bmList.map(b => b.docId));
    });

    const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
      const nList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(nList);
      loadReferencedDocs(nList.map(n => n.docId));
    });

    return () => {
      unsubscribeBookmarks();
      unsubscribeNotes();
    };
  }, [currentUser]);

  // Function to load specific doc details if not in map
  const loadReferencedDocs = async (docIds) => {
    const newMap = { ...allDocsMap };
    for (const id of docIds) {
      if (!newMap[id]) {
        const docRef = doc(db, 'documents', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          newMap[id] = { id: docSnap.id, ...docSnap.data() };
        }
      }
    }
    setAllDocsMap(newMap);
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchDocuments();
  };

  const isBookmarked = (docId) => bookmarks.some(b => b.docId === docId);

  const handleBookmarkToggle = async (docId) => {
    if (!currentUser) {
      toast.error('Bạn cần đăng nhập để đánh dấu tài liệu.');
      return;
    }
    const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks`, docId);
    if (isBookmarked(docId)) {
      await deleteDoc(bookmarkRef);
      toast.info('Đã xóa khỏi danh sách yêu thích.');
    } else {
      await setDoc(bookmarkRef, { docId, addedAt: new Date() });
      toast.success('Đã thêm vào danh sách yêu thích!');
    }
  };

  const handleOpenNote = (docId) => {
    const docData = allDocsMap[docId];
    if (!docData) return;
    setCurrentNoteDoc(docData);
    const existingNote = notes.find(n => n.docId === docId);
    setNoteContent(existingNote ? existingNote.content : '');
    setOpenNoteDialog(true);
  };

  const handleSaveNote = async () => {
    if (!currentUser || !currentNoteDoc) return;

    const noteRef = doc(db, `users/${currentUser.uid}/notes`, currentNoteDoc.id);
    try {
      await setDoc(noteRef, { docId: currentNoteDoc.id, content: noteContent, updatedAt: new Date() }, { merge: true });
      toast.success('Ghi chú đã được lưu!');
      setOpenNoteDialog(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Lỗi khi lưu ghi chú: ' + error.message);
    }
  };

  const handleCloseNoteDialog = () => {
    setOpenNoteDialog(false);
    setCurrentNoteDoc(null);
    setNoteContent('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard của bạn</Typography>

      {/* Search Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Tìm kiếm tài liệu</Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Tìm kiếm tài liệu"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Tìm kiếm'}
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : documents.length > 0 && (
          <List>
            {documents.map((doc) => (
              <ListItem key={doc.id} divider>
                <ListItemText
                  primary={doc.major + ' - ' + doc.description.substring(0, 50) + '...'}
                  secondary={
                    <>
                      Tags: {doc.tags.join(', ')}
                      <br />
                      Link: <a href={doc.link} target="_blank" rel="noopener noreferrer">{doc.link}</a>
                    </>
                  }
                />
                <IconButton onClick={() => handleBookmarkToggle(doc.id)}>
                  {isBookmarked(doc.id) ? <Bookmark color="primary" /> : <BookmarkBorder />}
                </IconButton>
                <IconButton onClick={() => handleOpenNote(doc.id)}>
                  <Edit />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Bookmarks Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Tài liệu yêu thích của bạn</Typography>
        {bookmarks.length === 0 ? (
          <Typography>Bạn chưa có tài liệu yêu thích nào.</Typography>
        ) : (
          <List>
            {bookmarks.map((bookmark) => {
              const bookmarkedDoc = allDocsMap[bookmark.docId];
              if (!bookmarkedDoc) return null;
              return (
                <ListItem key={bookmark.id} divider>
                  <ListItemText
                    primary={bookmarkedDoc.major + ' - ' + bookmarkedDoc.description.substring(0, 50) + '...'}
                  secondary={
                    <>
                      Tags: {bookmarkedDoc.tags.join(', ')}
                      <br />
                      Link: <a href={bookmarkedDoc.link} target="_blank" rel="noopener noreferrer">{bookmarkedDoc.link}</a>
                    </>
                  }
                />
                <IconButton onClick={() => handleOpenNote(bookmark.docId)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleBookmarkToggle(bookmarkedDoc.id)}>
                  <Bookmark color="primary" />
                </IconButton>
              </ListItem>
            );
          })}
          </List>
        )}
      </Paper>

      {/* Notes Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Ghi chú của bạn</Typography>
        {notes.length === 0 ? (
          <Typography>Bạn chưa có ghi chú nào.</Typography>
        ) : (
          <List>
            {notes.map((note) => {
              const notedDoc = allDocsMap[note.docId];
              if (!notedDoc) return null;
              return (
                <ListItem key={note.id} divider>
                  <ListItemText
                    primary={notedDoc.major + ' - ' + notedDoc.description.substring(0, 50) + '...'}
                    secondary={
                      <>
                        Ghi chú: {note.content.substring(0, 100)}...
                        <br />
                        Link: <a href={notedDoc.link} target="_blank" rel="noopener noreferrer">{notedDoc.link}</a>
                      </>
                    }
                  />
                  <IconButton onClick={() => handleOpenNote(note.docId)}>
                    <Edit />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Note Edit Dialog */}
      <Dialog open={openNoteDialog} onClose={handleCloseNoteDialog} fullWidth maxWidth="sm">
        <DialogTitle>Ghi chú cho tài liệu: {currentNoteDoc?.description.substring(0, 50)}...</DialogTitle>
        <DialogContent>
          <TextField
            label="Nội dung ghi chú"
            multiline
            rows={6}
            fullWidth
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>Hủy</Button>
          <Button onClick={handleSaveNote} variant="contained">
            Lưu Ghi chú
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="bottom-right" />
    </Box>
  );
}

export default Dashboard;