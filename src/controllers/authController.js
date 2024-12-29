const User = require('../models/User');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            req.flash('error', 'Kullanıcı adı veya şifre hatalı');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Kullanıcı adı veya şifre hatalı');
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Giriş yapılırken bir hata oluştu');
        res.redirect('/login');
    }
};

const register = async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('error', 'Şifreler eşleşmiyor');
            return res.redirect('/register');
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            req.flash('error', 'Bu kullanıcı adı zaten kullanılıyor');
            return res.redirect('/register');
        }

        const user = new User({
            username,
            password
        });
        await user.save();

        req.flash('success', 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Kayıt sırasında bir hata oluştu');
        res.redirect('/register');
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

const showLoginForm = (req, res) => {
    res.render('login', { messages: req.flash() });
};

const showRegisterForm = (req, res) => {
    res.render('register', { messages: req.flash() });
};

module.exports = {
    login,
    register,
    logout,
    showLoginForm,
    showRegisterForm
}; 