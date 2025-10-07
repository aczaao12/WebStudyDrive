import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

function HomeSearchBar({ searchInput, onSearchInputChange, onSearchSubmit }) {
  const [isSticky, setIsSticky] = useState(false);
  const searchContainerRef = React.useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (searchContainerRef.current) {
        const { top, height } = searchContainerRef.current.getBoundingClientRect();
        // Make sticky when the top of the search box is near the top of the viewport
        // or when scrolled past a certain point (e.g., half its height)
        if (top <= 0 || window.scrollY > height / 2) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Box ref={searchContainerRef} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box component="form" onSubmit={onSearchSubmit} sx={{
        width: '100%',
        maxWidth: 600,
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #dadce0',
        borderRadius: '24px',
        padding: '8px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s',
        ':focus-within': { boxShadow: '0 2px 6px rgba(0,0,0,0.15)' },
        mb: 4, // Margin bottom for when it's not sticky
        ...(isSticky && {
          position: 'fixed',
          top: 0,
          zIndex: 1100, // AppBar zIndex is 1100, so this should be at least that
          backgroundColor: 'background.paper',
          width: 'calc(100% - 48px)', // Adjust for padding/margin if needed
          maxWidth: 600,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          mt: 0, // Remove top margin when sticky
          pt: 1, pb: 1, // Add some padding when sticky
          borderRadius: 0, // Make it full width when sticky
        }),
      }}>
        <TextField
          fullWidth
          variant="standard"
          placeholder="Tìm kiếm tài liệu..."
          value={searchInput}
          onChange={onSearchInputChange}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <SearchIcon sx={{ color: '#5f6368', mr: 1 }} />
            ),
            endAdornment: searchInput && (
              <IconButton onClick={() => onSearchInputChange({ target: { value: '' } })} size="small">
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{ '& .MuiInputBase-input': { p: 0 } }}
        />
      </Box>
    </Box>
  );
}

export default HomeSearchBar;
