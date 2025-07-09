import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const BookingComments = ({ bookingId, onClose, readOnly }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/comments/by-booking/${bookingId}`);
      setComments(res.data);
    } catch (e) {
      console.error('Gagal fetch komentar', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [bookingId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:8000/api/comments', { bookingId, comment: newComment.trim() });
      setNewComment('');
      fetchComments();
    } catch (e) {
      console.error('Gagal tambah komentar', e);
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (e) {
      console.error('Gagal menghapus komentar', e);
      alert('Gagal menghapus komentar');
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
        <Typography variant="h6" ml={1}>
          Komentar Reservasi
        </Typography>
      </Box>

      <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
        {loading ? (
          <Typography>Loading komentar...</Typography>
        ) : comments.length === 0 ? (
          <Typography sx={{ ml: 1 }}>Belum ada komentar.</Typography>
        ) : (
          comments.map((c) => (
            <Paper key={c.id} sx={{ p: 1, mb: 1, position: 'relative' }}>
              {!readOnly && (
                <IconButton
                  size="small"
                  onClick={() => handleDeleteComment(c.id)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    color: 'error.main'
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              <Typography variant="caption" color="text.secondary">
                {new Date(c.created_at).toLocaleString()}
              </Typography>
              <Typography>{c.comment}</Typography>
            </Paper>
          ))
        )}
      </Box>

      {!readOnly && (
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tulis komentar baru..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <Button variant="contained" onClick={handleAddComment} disabled={submitting || !newComment.trim()}>
            Kirim
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default BookingComments;
