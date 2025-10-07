import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { Bookmark, Edit } from '@mui/icons-material';

function BookmarkGrid({
  bookmarks,
  bookmarkedDocuments,
  handleOpenNote,
  handleBookmarkToggle,
}) {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 3,
      mt: 3,
      justifyItems: 'center',
    }}>
      {bookmarks.map((bookmark) => {
        const bookmarkedDoc = bookmarkedDocuments[bookmark.docId];
        if (!bookmarkedDoc) return null;
        return (
          <Paper key={bookmark.id} elevation={1} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            width: 120,
            height: 120,
            borderRadius: '12px',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'inherit',
            position: 'relative',
            ':hover': { boxShadow: 6 },
          }} component={Link} to={bookmarkedDoc.documentLink} target="_blank" rel="noopener">
            <Box sx={{
              width: 60,
              height: 60,
              background: '#e8eaed',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              mb: 1,
              color: '#5f6368',
            }}>
              {bookmarkedDoc.title.charAt(0).toUpperCase()}
            </Box>
            <Typography variant="caption" sx={{ wordBreak: 'break-word', lineHeight: 1.2 }}>
              {bookmarkedDoc.title}
            </Typography>
            <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
              <IconButton onClick={(e) => { e.preventDefault(); handleOpenNote(bookmarkedDoc); }} size="small" sx={{ p: 0.5 }}>
                <Edit fontSize="inherit" />
              </IconButton>
              <IconButton onClick={(e) => { e.preventDefault(); handleBookmarkToggle(bookmarkedDoc.id); }} size="small" sx={{ p: 0.5 }}>
                <Bookmark color="primary" fontSize="inherit" />
              </IconButton>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

export default BookmarkGrid;
