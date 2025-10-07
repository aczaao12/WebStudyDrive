import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab,
} from '@mui/material';
import { Bookmark, BookmarkBorder, Edit } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, onSnapshot, documentId } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CardContent, Chip } from '@mui/material';

// Import search-related hooks and components
import useSearch from '../../hooks/useSearch';
import { NoResults, SearchResultCard } from './components/SearchResultsComponents';
import HomeSearchBar from './components/HomeSearchBar';
import BookmarkGrid from './components/BookmarkGrid';
import HomeDashboardContent from './components/HomeDashboardContent';


// Helper for TabPanel (copied from Dashboard.jsx)
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Helper for fetching documents by IDs (from api/documents.js)
import { fetchDocumentsByIds } from '../../api/documents';

function HomePage({ currentUser }) {
  const navigate = useNavigate(); // For search redirection

  // Dashboard states and handlers
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [currentNoteDoc, setCurrentNoteDoc] = useState(null);
  const [noteContent, setNoteContent] = ('');
  const [bookmarkedDocuments, setBookmarkedDocuments] = useState({});
  const [notedDocuments, setNotedDocuments] = useState({});
  const [tabValue, setTabValue] = useState(0); // For tab control

  // Search states and handlers from useSearch hook
  const {
    searchTerm,
    setSearchTerm, // Debounced setter
    majorFilter, // Not directly used in UI, but part of search logic
    setMajorFilter,
    tagFilters, // Not directly used in UI, but part of search logic
    setTagFilters,
    sortBy, // Not directly used in UI, but part of search logic
    setSortBy,
    documents: searchDocuments, // Renamed to avoid conflict with bookmarkedDocuments
    majors,
    tags,
    loading: searchLoading,
    error: searchError,
    hasMore: searchHasMore,
    handleLoadMore: handleSearchLoadMore,
  } = useSearch();

  // ... useEffect for fetching bookmarks and notes (adapted from Dashboard.jsx)
  useEffect(() => {
    if (!currentUser) return;

    const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
    const notesRef = collection(db, `users/${currentUser.uid}/notes`);

    const unsubscribeBookmarks = onSnapshot(bookmarksRef, async (snapshot) => {
      const fetchedBookmarks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookmarks(fetchedBookmarks);
      const docIds = fetchedBookmarks.map(b => b.docId);
      const docsMap = await fetchDocumentsByIds(docIds);
      setBookmarkedDocuments(docsMap);
    });

    const unsubscribeNotes = onSnapshot(notesRef, async (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(fetchedNotes);
      const docIds = fetchedNotes.map(n => n.docId);
      const docsMap = await fetchDocumentsByIds(docIds);
      setNotedDocuments(docsMap);
    });

    return () => {
      unsubscribeBookmarks();
      unsubscribeNotes();
    };
  }, [currentUser]);


  // ... Bookmark and Note handlers (adapted from Dashboard.jsx)
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

  const handleOpenNote = (doc) => {
    setCurrentNoteDoc(doc);
    const existingNote = notes.find(n => n.docId === doc.id);
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

  // Search bar input state and handler
  const [searchInput, setSearchInput] = useState('');

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);
    setSearchTerm(value); // Use the debounced setter from useSearch
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // The useSearch hook already handles the actual search based on searchTerm changes
    // If we want to navigate to a dedicated search results page, we could do it here.
    // For now, results will display on this page.
  };

  // UI for the combined page
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', pt: 4, pb: 4 }}>
      {/* Top Bar (simplified) */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 3, mb: 2 }}>
        {/* Add user info or settings icons here if needed */}
        {currentUser && (
          <Typography variant="body2" color="text.secondary">
            Xin chào, {currentUser.email}
          </Typography>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 800 }}>
        <Typography variant="h3" component="div" sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
          Ebook Hub CEFT
        </Typography>

        {/* Search Box */}
        <HomeSearchBar
          searchInput={searchInput}
          onSearchInputChange={handleSearchInputChange}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Conditional Display: Search Results or Dashboard Content */}
        {searchTerm ? (
          <Box sx={{ mt: 4, width: '100%' }}>
            {searchLoading && searchDocuments.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : searchError ? (
              <Box sx={{ mt: 4, textAlign: 'center', color: 'error.main' }}>
                <Typography variant="h6">Lỗi: {searchError}</Typography>
                <Typography variant="body1">Vui lòng thử lại sau.</Typography>
              </Box>
            ) : searchDocuments.length === 0 ? (
              <NoResults />
            ) : (
              <Box>
                {searchDocuments.map((doc) => (
                  <SearchResultCard key={doc.id} document={doc} />
                ))}
                {searchHasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button variant="outlined" onClick={handleSearchLoadMore} disabled={searchLoading}>
                      {searchLoading ? <CircularProgress size={24} /> : 'Tải thêm'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ) : (
          // Dashboard Content (Bookmarks and Notes)
          <HomeDashboardContent
            bookmarks={bookmarks}
            bookmarkedDocuments={bookmarkedDocuments}
            handleOpenNote={handleOpenNote}
            handleBookmarkToggle={handleBookmarkToggle}
            notes={notes}
            notedDocuments={notedDocuments}
          />
        )}
      </Box>

      {/* Note Edit Dialog */}
      <Dialog open={openNoteDialog} onClose={handleCloseNoteDialog} fullWidth maxWidth="sm">
        <DialogTitle>Ghi chú cho tài liệu: {currentNoteDoc?.title}</DialogTitle>
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

export default HomePage;