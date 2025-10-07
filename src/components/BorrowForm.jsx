import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';

function BorrowForm({ user }) {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [borrowPeriod, setBorrowPeriod] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDocument = async () => {
      try {
        const docRef = doc(db, 'documents', documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDocument({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Tài liệu không tồn tại.');
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError('Không thể tải thông tin tài liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitSuccess(false);

    if (!user) {
      setError('Bạn cần đăng nhập để gửi yêu cầu mượn.');
      return;
    }

    try {
      await addDoc(collection(db, 'borrowRequests'), {
        documentId: document.id,
        documentTitle: document.title,
        userId: user.uid,
        userEmail: user.email,
        reason,
        borrowPeriod,
        status: 'pending', // pending, approved, rejected
        timestamp: serverTimestamp(),
      });
      setSubmitSuccess(true);
      setReason('');
      setBorrowPeriod('');
    } catch (err) {
      console.error("Error submitting borrow request:", err);
      setError('Không thể gửi yêu cầu mượn. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Tài liệu không tìm thấy hoặc đã xảy ra lỗi.</Alert>
      </Container>
    );
  }

  return (
    <Container component={Paper} elevation={3} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Yêu cầu mượn tài liệu
      </Typography>
      <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
        {document.title}
      </Typography>

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Yêu cầu mượn của bạn đã được gửi thành công! Vui lòng chờ phê duyệt.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="reason"
          label="Lý do mượn"
          name="reason"
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="borrowPeriod"
          label="Thời gian mượn (ví dụ: 1 tuần, 1 tháng)"
          name="borrowPeriod"
          value={borrowPeriod}
          onChange={(e) => setBorrowPeriod(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
          disabled={!user}
        >
          Gửi yêu cầu mượn
        </Button>
        {!user && (
          <Alert severity="info">Bạn cần đăng nhập để gửi yêu cầu mượn.</Alert>
        )}
      </Box>
    </Container>
  );
}

export default BorrowForm;
