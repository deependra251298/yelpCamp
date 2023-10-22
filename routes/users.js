const express= require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');


router.route('/register')
    .get( users.renderRegister)
    .post( catchAsync(users.registerLogic))



router.route('/login')
    .get( users.loginUser)
    .post( storeReturnTo, passport.authenticate('local',{failureFlash: true, failureRedirect:'/login'}),users.passportLogin);


router.get('/logout', users.logoutUser)





module.exports = router;