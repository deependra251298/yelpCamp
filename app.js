//for environment variable

if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}



const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');     // for boilerplate & add app.engine('ejs',ejsMate)
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes =  require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
const dbUrl = process.eventNames.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// mongoDb Database from site 
// const dbUrl = process.eventNames.DB_URL

//connecting database
mongoose.connect(dbUrl, {
    useUnifiedTopology: true, 
    useNewUrlParser: true,
});

//check connection
const db= mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('DataBase connected')
});

const app = express();


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));   //for publi directory
// Or, to replace these prohibited characters with _, use:
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );
 
  const secret = process.eventNames.SECRET || 'thisshouldbeabettersecret!'
   
const store = MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 60 * 60 ,
        crypto:{
            secret,
        }
    });
store.on("error", function (e) {
        console.log("SESSION STORE ERROR", e)
    })    

const sessionConfig = { 
    store,
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // secure:true,     //needs https but local host is not secure
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //expiry time of cookie
        maxAge:1000 * 60 * 60 * 24 * 7
    },
    
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet({
    // contentSecurityPolicy: false
}));

///-----------------------------------------------
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwgxusgug/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                // "https://images.unsplash.com",
                "https://wallpaperaccess.com/full/1561606.jpg",
                "https://img.icons8.com/carbon-copy/100/user.png"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//------------------------



//passport use and require is used for user model 
app.use(passport.initialize());
app.use(passport.authenticate('session'));
// app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next)=>{
    res.locals.currentUser = req.user;    //reuesting all templatae to have acces to current user 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

//router for campgrounds and reviews
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes);



app.get('/fakeuser', async(req, res)=>{
    const user = new User({email: 'd251298s@gmail.com', username:'dssssd'})
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})

app.get('/', (req, res)=>{
    res.render('home');
})


//url unrecognised
app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404))
})

// error handling
app.use((err, req, res, next)=>{
    const { statusCode=500}= err;
    if(!err.message) err.message = 'OH NO, Something went wrong' 
    res.status(statusCode).render('error',{err})
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Serving on ${port}`);
})