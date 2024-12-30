const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user')
            .populate('comments.user')
            .sort('-createdAt');
        
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const activeUsers = await User.find({
            $or: [
                { lastActivity: { $gte: oneDayAgo }  },
                { _id: { $in: posts.map(post => post.user._id) } }
            ]
        })
        .select('username lastActivity')
        .sort('-lastActivity')
        .limit(10);
        
        const currentUser = await User.findById(req.session.userId);
        
        await User.findByIdAndUpdate(req.session.userId, {
            lastActivity: new Date()
        });
        
        res.render('index', { 
            posts,
            activeUsers,
            currentUser,
            messages: req.flash()
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Bir hata oluştu');
    }
};

const createPost = async (req, res) => {
    try {
        
        
        const post = new Post({
            user: req.session.userId,
            imageUrl: req.file.filename,
            caption: req.body.caption
        });
        await post.save();
        req.flash('success', 'Paylaşım başarıyla oluşturuldu');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Paylaşım oluşturulurken bir hata oluştu');
        res.redirect('/post/new');
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findOne({ 
            _id: new mongoose.Types.ObjectId(req.params.id), 
            user: req.session.userId 
        });
        
        if (!post) {
            return res.status(404).json({ error: 'Paylaşım bulunamadı veya silme yetkiniz yok' });
        }

        try {
            const imagePath = path.join(__dirname, '../public/uploads/', post.imageUrl);
            await fs.unlink(imagePath);
            console.log('Resim dosyası silindi:', imagePath);
        } catch (error) {
            console.error('Resim silme hatası:', error);
        }

        await Post.deleteOne({ _id: post._id });
        console.log('Post silindi:', post._id);
        
        res.json({ 
            success: true, 
            message: 'Paylaşım başarıyla silindi'
        });
    } catch (error) {
        console.error('Post silme hatası:', error);
        res.status(500).json({ 
            error: 'Paylaşım silinirken bir hata oluştu',
            details: error.message 
        });
    }
};

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(new mongoose.Types.ObjectId(req.params.id));
        if (!post) {
            return res.status(404).json({ error: 'Paylaşım bulunamadı' });
        }

        const userLikeIndex = post.likes.indexOf(req.session.userId);
        let liked = false;

        if (userLikeIndex === -1) {
            post.likes.push(req.session.userId);
            liked = true;
        } else {
            post.likes.splice(userLikeIndex, 1);
            liked = false;
        }

        await post.save();
        
        const userPosts = await Post.find({ user: post.user._id });
        const totalLikes = userPosts.reduce((sum, p) => sum + p.likes.length, 0);

        res.json({ 
            success: true, 
            liked: liked, 
            count: post.likes.length,
            totalLikes: totalLikes
        });
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ error: 'Beğeni işlemi sırasında bir hata oluştu' });
    }
};

const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        post.comments.push({
            user: req.session.userId,
            text: req.body.text
        });
        await post.save();
        req.flash('success', 'Yorum başarıyla eklendi');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Yorum eklenirken bir hata oluştu');
        res.redirect('/');
    }
};

const showNewPostForm = (req, res) => {
    res.render('new-post', { messages: req.flash() });
};

module.exports = {
    getAllPosts,
    createPost,
    deletePost,
    likePost,
    addComment,
    showNewPostForm
}; 