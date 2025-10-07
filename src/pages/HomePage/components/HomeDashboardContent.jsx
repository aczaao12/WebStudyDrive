import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import BookmarkGrid from './BookmarkGrid';
import NotesList from './NotesList';

// Helper for TabPanel
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

function HomeDashboardContent({
  bookmarks,
  bookmarkedDocuments,
  handleOpenNote,
  handleBookmarkToggle,
  notes,
  notedDocuments,
}) {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleChange} aria-label="dashboard sections" centered>
          <Tab label="Tài liệu yêu thích" {...a11yProps(0)} />
          <Tab label="Ghi chú của bạn" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Bookmarks Section - Chrome New Tab Style */}
        {bookmarks.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>Bạn chưa có tài liệu yêu thích nào.</Typography>
        ) : (
          <BookmarkGrid
            bookmarks={bookmarks}
            bookmarkedDocuments={bookmarkedDocuments}
            handleOpenNote={handleOpenNote}
            handleBookmarkToggle={handleBookmarkToggle}
          />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Notes Section - List/Card Style */}
        {notes.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>Bạn chưa có ghi chú nào.</Typography>
        ) : (
          <NotesList
            notes={notes}
            notedDocuments={notedDocuments}
            handleOpenNote={handleOpenNote}
          />
        )}
      </TabPanel>
    </Box>
  );
}

export default HomeDashboardContent;
