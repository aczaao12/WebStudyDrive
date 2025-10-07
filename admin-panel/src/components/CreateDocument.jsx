import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
} from '@mui/material';

import ReactSelect from 'react-select/creatable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const schema = yup.object().shape({
  title: yup.string().required('Tiêu đề là bắt buộc').min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  major: yup.string().required('Chuyên ngành là bắt buộc'),
  description: yup.string().required('Mô tả là bắt buộc').min(50, 'Mô tả phải có ít nhất 50 ký tự').max(2000, 'Mô tả không được vượt quá 2000 ký tự'),
  tags: yup.array().min(1, 'Cần ít nhất một tag').required('Tags là bắt buộc'),
  documentLink: yup.string().url('Link tài liệu phải là một URL hợp lệ').required('Link tài liệu là bắt buộc'),
});

function CreateDocument() {
  const {
    control,
    handleSubmit,
    reset,
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

  const [majors, setMajors] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
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

    fetchMajorsAndTags();
  }, []);

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, 'documents'), {
        title: data.title,
        major: data.major,
        description: data.description,
        tags: data.tags.map(tag => tag.value), // Store only tag values
        documentLink: data.documentLink,
        createdAt: new Date(),
      });
      toast.success('Tài liệu đã được tạo thành công!');
      reset();
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Lỗi khi tạo tài liệu: ' + error.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Tạo Mới Tài Liệu
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
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
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Tạo Tài Liệu'}
        </Button>
      </Box>
      <ToastContainer position="bottom-right" />
    </Paper>
  );
}

export default CreateDocument;