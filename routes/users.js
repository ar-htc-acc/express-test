'use strict';

const path  = require('path');
const log   = require('debug')('notes:router-users');
const error = require('debug')('notes:error');
const express  = require('express');
const router   = express.Router();
exports.router = router;
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

const usersModel = require(process.env.USERS_MODEL
    ? path.join('..', process.env.USERS_MODEL)
    : '../models/users-rest');

exports.initPassport = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());
};

exports.ensureAuthenticated = function (req, res, next) {
    if (req.user) next();
    else res.redirect('/users/login');
}

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: "Login to Notes",
        user: req.user
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'login'
}));

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

passport.use(new TwitterStrategy({
        consumerKey: "09s29rrD7BeKKCNe4Zq9e4Uhs",
        consumerSecret: "yfiUlJpzusAX8izuqBx48zKsbVaHuvYfznXPNDtbeZdaxDIvVj",
        callbackURL: "http://35.166.70.111:3000/users/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done) {
        usersModel.findOrCreate({
            id: profile.username,
            username: profile.username,
            password: "",
            provider: profile.provider,
            familyName: profile.displayName,
            givenName: "",
            middleName: "",
            photos: profile.photos,
            emails: profile.emails
        })
            .then(user => done(null, user))
            .catch(err => done(err));
    }
));

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback',
    passport.authenticate('twitter',
        {
            successRedirect: '/',
            failureRedirect: '/users/login'
        }));

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    usersModel.find(username)
        .then(user => done(null, user))
        .catch(err => done(err));
});














