const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/new', isAuthenticated, postController.showNewPostForm);
router.post('/new', isAuthenticated, upload.single('image'), postController.createPost);
router.post('/:id/delete', isAuthenticated, postController.deletePost);
router.post('/:id/like', isAuthenticated, postController.likePost);
router.post('/:id/comment', isAuthenticated, postController.addComment);

module.exports = router; 