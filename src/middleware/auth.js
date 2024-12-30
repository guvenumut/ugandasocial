const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};


const blockPath = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    next();
};

module.exports = { isAuthenticated, blockPath }; 