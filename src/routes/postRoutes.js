const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Post = require('../models/Post');
const User = require('../models/User');

router.get('/new', isAuthenticated, postController.showNewPostForm);
router.post('/new', isAuthenticated, upload.single('image'), postController.createPost);
router.post('/:id/delete', isAuthenticated, postController.deletePost);
router.post('/:id/like', isAuthenticated, postController.likePost);
router.post('/:id/comment', isAuthenticated, postController.addComment);
router.post('/:id/comment/:commentId/reply', isAuthenticated, async (req, res) => {
    try {
        const content = req.body.content ? req.body.content.trim() : '';
        if (!content) {
            return res.status(400).json({ error: 'Yanıt içeriği boş olamaz' });
        }

        const post = await Post.findOneAndUpdate(
            {
                _id: req.params.id,
                'comments._id': req.params.commentId
            },
            {
                $push: {
                    'comments.$.replies': {
                        user: req.session.userId,
                        content: content,
                        createdAt: new Date()
                    }
                }
            },
            { new: true, runValidators: true }
        ).populate('comments.replies.user');

        if (!post) {
            return res.status(404).json({ error: 'Gönderi veya yorum bulunamadı' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({
            success: true,
            username: user.username,
            content: content
        });

    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ error: 'Yanıt eklenirken bir hata oluştu' });
    }
});

module.exports = router; 