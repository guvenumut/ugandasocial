const express = require('express');
require('dotenv').config();

const connectDB = require('./config/database');
const sessionMiddleware = require('./config/session');
const configureApp = require('./config/app');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const postController = require('./controllers/postController');
const userController = require('./controllers/userController');
const { isAuthenticated } = require('./middleware/auth');

const app = express();

connectDB();

configureApp(app);

app.use(sessionMiddleware);

app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId ? req.session.userId : null;
    next();
});

app.get('/', isAuthenticated, postController.getAllPosts);
app.get('/profile', isAuthenticated, userController.getProfile);

app.use('/', authRoutes);
app.use('/post', postRoutes);
app.use('/user', userRoutes);




app.use((req, res, next) => {
    if(res.statusCode === 404 && req.session.userId){
        res.redirect('/');
    }
    else{
        res.redirect('/login');
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Bir şeyler ters gitti!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});