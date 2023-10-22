const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary/index');

module.exports.index = async(req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req, res)=>{
    res.render('campgrounds/new')
}

//add new campground to main file and display it using redirect
//   1. +++ app.use(express.urlencoded({extended:true}))
module.exports.createCampground = async(req, res, next)=>{
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path: 'author',
        }
    }).populate('author');
    
    if(!campground){
        req.flash('error', 'Cannot Find the Campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}


module.exports.editCampgrounds = async(req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){ //if not found flash a mesage below and redirect to home
        req.flash('error', 'Cannot Find the Campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}


//for posting edit be require method-override so 
//        1. install by "npm i method-override"
//         2. add rquire method override to app.js
//         3. add app.use method overide 
//posting the edit to main file
module.exports.updateCampgrounds = async(req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
       await campground.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully Updated');
    res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.deleteCampgrounds = async(req, res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully DELETED Campground!');
    res.redirect('/campgrounds');
}

