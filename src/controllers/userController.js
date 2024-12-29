const User = require('../models/User');
const Post = require('../models/Post');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const posts = await Post.find({ user: req.session.userId })
            .sort('-createdAt');

        const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
        const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);

        res.render('profile', {
            user,
            posts,
            totalLikes,
            totalComments,
            currentUser: user,
            messages: req.flash()
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Profil yüklenirken bir hata oluştu');
        res.redirect('/');
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            req.flash('error', 'Kullanıcı bulunamadı');
            return res.redirect('/');
        }

        const posts = await Post.find({ user: user._id })
            .sort('-createdAt');

        const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
        const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);

        res.render('user-profile', {
            user,
            posts,
            totalLikes,
            totalComments,
            currentUser: await User.findById(req.session.userId),
            messages: req.flash()
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Profil yüklenirken bir hata oluştu');
        res.redirect('/');
    }
};

module.exports = {
    getProfile,
    getUserProfile
}; 