const express = require('express');
const { campgroundSchema} = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');    // for try catch error handling defined in utils folder
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const router = express.Router();
const flash = require('connect-flash');
const { isLoggedIn, isAuthor, validateCampground} = require('../middleware.js');
const campgrounds = require('../controllers/campgrounds.js'); //for controllers
const {storage} = require('../cloudinary/index.js')
const multer = require('multer');
// const upload = multer({dest: 'uploads/'}) ----------upgraded to below line
const upload = multer({storage})


router.route('/')//get campgrounds
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))  
    

 //send create new page of campgrounds
router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) //show routes
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampgrounds)) //upadte campgrpunds
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds)) // deleting an campground
    
//send to edit page the campgrounds
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampgrounds))



module.exports = router;