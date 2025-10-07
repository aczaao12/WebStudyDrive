import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactSelect from 'react-select/creatable';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  title: yup.string().required('Tiêu đề là bắt buộc').min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  major: yup.string().required('Chuyên ngành là bắt buộc'),
  description: yup.string().required('Mô tả là bắt buộc').min(50, 'Mô tả phải có ít nhất 50 ký tự').max(2000, 'Mô tả không được vượt quá 2000 ký tự'),
  tags: yup.array().min(1, 'Cần ít nhất một tag').required('Tags là bắt buộc'),
  documentLink: yup.string().url('Link tài liệu phải là một URL hợp lệ').required('Link tài liệu là bắt buộc'),
});

function EditDocument() {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [majors, setMajors] = useState([]);
  const [tags, setTags] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      major: '',
      description: '',
      tags: [],
      documentLink: '',
    },
  });

  const fetchMajorsAndTags = async () => {
    const majorsCol = collection(db, 'majors');
    const majorSnapshot = await getDocs(majorsCol);
    const majorList = majorSnapshot.docs.map(doc => ({ value: doc.id, label: doc.data().name }));
    setMajors(majorList);

    const tagsCol = collection(db, 'tags');
    const tagsQuery = query(tagsCol, orderBy('count', 'desc'), limit(20));
    const tagSnapshot = await getDocs(tagsQuery);
    const tagList = tagSnapshot.docs.map(doc => ({ value: doc.id, label: doc.data().name }));
    setTags(tagList);
  };

  useEffect(() => {
    fetchMajorsAndTags();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let q = collection(db, 'documents');
      if (searchTerm) {
        const majorQuery = query(collection(db, 'majors'), where('name', '==', searchTerm));
        const majorSnapshot = await getDocs(majorQuery);
        const majorIds = majorSnapshot.docs.map(doc => doc.id);

        if (majorIds.length > 0) {
          q = query(q, where('major', 'in', majorIds));
        } else {
          const allDocsSnapshot = await getDocs(collection(db, 'documents'));
          const filteredDocs = allDocsSnapshot.docs.filter(doc =>
            doc.data().description.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(doc => ({ id: doc.id, ...doc.data() }));
          setDocuments(filteredDocs);
          setLoading(false);
          return;
        }
      }
      const querySnapshot = await getDocs(q);
      const docsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const docsWithMajorNames = await Promise.all(docsList.map(async (doc) => {
        const majorName = majors.find(m => m.value === doc.major)?.label || doc.major;
        return { ...doc, majorName };
      }));

      setDocuments(docsWithMajorNames);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Lỗi khi tìm kiếm tài liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (majors.length > 0 || searchTerm === '') {
      fetchDocuments();
    }
  }, [majors, searchTerm]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchDocuments();
  };

  const handleViewEditClick = (doc) => {
    setCurrentDoc(doc);
    setOpenEditDialog(true);
    setIsEditing(false); // Start in view mode
    reset({
      title: doc.title,
      major: doc.major,
      description: doc.description,
      tags: doc.tags.map(tag => ({ value: tag, label: tag })),
      documentLink: doc.documentLink,
    });
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentDoc(null);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const onUpdate = async (data) => {
    if (!currentDoc) return;

    try {
      await updateDoc(doc(db, 'documents', currentDoc.id), {
        title: data.title,
        major: data.major,
        description: data.description,
        tags: data.tags.map(tag => tag.value), // Store only tag values
        documentLink: data.documentLink,
      });
      toast.success('Tài liệu đã được cập nhật thành công!');
      handleCloseEditDialog();
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Lỗi khi cập nhật tài liệu: ' + error.message);
    }
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (docToDelete) {
      try {
        await deleteDoc(doc(db, 'documents', docToDelete.id));
        toast.success('Tài liệu đã được xóa thành công!');
        fetchDocuments(); // Refresh the list
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Lỗi khi xóa tài liệu: ' + error.message);
      } finally {
        setOpenDeleteDialog(false);
        setDocToDelete(null);
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDocToDelete(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Chỉnh Sửa Tài Liệu
      </Typography>
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Tìm kiếm theo chuyên ngành hoặc mô tả"
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
          Không tìm thấy tài liệu nào.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Chuyên ngành</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Link</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.majorName}</TableCell>
                  <TableCell>{doc.description.substring(0, 100)}...</TableCell>
                  <TableCell>{doc.tags.join(', ')}</TableCell>
                  <TableCell><a href={doc.documentLink} target="_blank" rel="noopener noreferrer">Link</a></TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" size="small" onClick={() => handleViewEditClick(doc)}>
                      <Visibility />
                    </IconButton>
                    <IconButton color="secondary" size="small" onClick={() => { handleViewEditClick(doc); setIsEditing(true); }}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDeleteClick(doc)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Chỉnh Sửa Tài Liệu' : 'Xem Tài Liệu'}</DialogTitle>
        <DialogContent>
          {currentDoc && (
            <Box component="form" onSubmit={handleSubmit(onUpdate)} sx={{ mt: 1 }}>
              {/* Title */}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    fullWidth
                    label="Tiêu đề tài liệu"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    InputProps={{
                      readOnly: !isEditing,
                    }}
                  />
                )}
              />

              {/* Major */}
              <Controller
                name="major"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal" error={!!errors.major}>
                    <Typography variant="subtitle1" gutterBottom>Chuyên ngành</Typography>
                    <ReactSelect
                      {...field}
                      options={majors}
                      classNamePrefix="react-select"
                      placeholder="Chọn hoặc tạo chuyên ngành mới..."
                      onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                      onBlur={field.onBlur}
                      value={majors.find(option => option.value === field.value) || null}
                      isDisabled={!isEditing}
                      onCreateOption={async (inputValue) => {
                        const newMajorRef = await addDoc(collection(db, 'majors'), { name: inputValue });
                        const newMajor = { value: newMajorRef.id, label: inputValue };
                        setMajors((prev) => [...prev, newMajor]);
                        field.onChange(newMajor.value);
                      }}
                    />
                    <FormHelperText>{errors.major?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              {/* Description */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Mô tả</Typography>
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Nhập mô tả tài liệu..."
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      InputProps={{
                        readOnly: !isEditing,
                      }}
                    />
                  </Box>
                )}
              />

              {/* Tags */}
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal" error={!!errors.tags}>
                    <Typography variant="subtitle1" gutterBottom>Tags</Typography>
                    <ReactSelect
                      {...field}
                      isMulti
                      options={tags}
                      classNamePrefix="react-select"
                      placeholder="Chọn hoặc tạo tags mới..."
                      onChange={(selectedOptions) => field.onChange(selectedOptions || [])}
                      onBlur={field.onBlur}
                      value={field.value}
                      isDisabled={!isEditing}
                      onCreateOption={async (inputValue) => {
                        const newTagRef = await addDoc(collection(db, 'tags'), { name: inputValue, count: 1 });
                        const newTag = { value: newTagRef.id, label: inputValue };
                        setTags((prev) => [...prev, newTag]);
                        field.onChange([...field.value, newTag]);
                      }}
                    />
                    <FormHelperText>{errors.tags?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              {/* Document Link */}
              <Controller
                name="documentLink"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    fullWidth
                    label="Link đến tài liệu (URL)"
                    error={!!errors.documentLink}
                    helperText={errors.documentLink?.message}
                    InputProps={{
                      readOnly: !isEditing,
                    }}
                  />
                )}
              />

              <DialogActions>
                <Button onClick={handleCloseEditDialog}>Đóng</Button>
                {!isEditing && (
                  <Button onClick={handleEditToggle} variant="contained">
                    Chỉnh Sửa
                  </Button>
                )}
                {isEditing && (
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Lưu Thay Đổi'}
                  </Button>
                )}
              </DialogActions>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Xác nhận xóa tài liệu?"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            Bạn có chắc chắn muốn xóa tài liệu "{docToDelete?.majorName} - {docToDelete?.description.substring(0, 50)}..." không? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} autoFocus color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="bottom-right" />
    </Paper>
  );
}

export default EditDocument;
