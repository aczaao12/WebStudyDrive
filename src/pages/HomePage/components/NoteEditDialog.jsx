import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

function NoteEditDialog({
  open,
  onClose,
  currentNoteDoc,
  noteContent,
  onNoteContentChange,
  onSaveNote,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Ghi chú cho tài liệu: {currentNoteDoc?.title}</DialogTitle>
      <DialogContent>
        <TextField
          label="Nội dung ghi chú"
          multiline
          rows={6}
          fullWidth
          value={noteContent}
          onChange={(e) => onNoteContentChange(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onSaveNote} variant="contained">
          Lưu Ghi chú
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NoteEditDialog;
