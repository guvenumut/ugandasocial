const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');

const configureApp = (app) => {
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use(expressLayouts);
    app.set('layout', 'layout');
    app.set('layout extractScripts', true);

    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(flash());
};

module.exports = configureApp; 