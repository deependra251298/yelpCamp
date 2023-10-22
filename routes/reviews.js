const express = require('express');
const router = express.Router({mergeParams: true}); // megrgeParams is used to carry forward the id of app.js file to review routes.
const catchAsync = require('../utils/catchAsync');    // for try catch error handling defined in utils folder
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviews = require('../controllers/reviews');




// for review
router.post('/',isLoggedIn, validateReview, catchAsync(reviews.addReview))

//deleting reviews
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;