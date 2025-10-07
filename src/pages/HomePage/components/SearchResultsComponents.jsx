import React from 'react';
import { Box, Typography, Paper, CardContent, Chip, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';

// NoResults Component
export function NoResults() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        mt: 4,
        color: 'text.secondary',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Không tìm thấy tài liệu nào phù hợp.
      </Typography>
      <Typography variant="body1" align="center">
        Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh các bộ lọc của bạn.
      </Typography>
    </Box>
  );
}

// SearchResultCard Component
export function SearchResultCard({ document }) {
  return (
    <Paper sx={{ mb: 3, ":hover": { boxShadow: 6 } }}>
      <CardContent>
        <Link href={document.documentLink} target="_blank" rel="noopener" underline="hover">
          <Typography variant="h6" component="h2" color="primary">
            {document.title}
          </Typography>
        </Link>
        <Link href={document.documentLink} target="_blank" rel="noopener" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: '0.875rem' }}>
          {document.documentLink}
        </Link>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {document.description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {document.major && (
            <Chip label={document.major} size="small" color="info" />
          )}
          {document.tags && document.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
          {document.createdAt && (
            <Chip label={`Ngày tạo: ${document.createdAt}`} size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>
    </Paper>
  );
}
