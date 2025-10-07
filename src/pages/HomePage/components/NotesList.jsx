import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { Edit } from '@mui/icons-material';

function NotesList({
  notes,
  notedDocuments,
  handleOpenNote,
}) {
  return (
    <Box sx={{ mt: 3 }}>
      {notes.map((note) => {
        const notedDoc = notedDocuments[note.docId];
        if (!notedDoc) return null;
        return (
          <Paper key={note.id} elevation={1} sx={{ p: 2, mb: 2, ":hover": { boxShadow: 3 } }}>
            <Link href={notedDoc.documentLink} target="_blank" rel="noopener" underline="hover">
              <Typography variant="subtitle1" component="h3" color="primary">
                {notedDoc.title}
              </Typography>
            </Link>
            <Link href={notedDoc.documentLink} target="_blank" rel="noopener" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: '0.875rem' }}>
              {notedDoc.documentLink}
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Ghi chú: {note.content.substring(0, 150)}...
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton onClick={() => handleOpenNote(notedDoc)} size="small">
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

export default NotesList;
