import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import CreateDocument from './CreateDocument';
import EditDocument from './EditDocument';

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

function DocumentManager() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="document manager tabs">
          <Tab label="Nhập Liệu Mới" {...a11yProps(0)} />
          <Tab label="Chỉnh Sửa Bài Đã Nhập" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <CreateDocument />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <EditDocument />
      </TabPanel>
    </Box>
  );
}

export default DocumentManager;
