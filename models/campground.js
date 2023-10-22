const mongoose = require('mongoose');
const Review = require('./reviews')
const Schema = mongoose.Schema;



const ImageSchema = new Schema({
    url: String,
    filename: String
 });


 //to enable virtual property
 const opts = { toJSON: { virtuals: true } };

 // helps in resizimg small image during edit
 ImageSchema.virtual('thumbnail').get(function (){
    return this.url.replace('/upload','/upload/w_150');
 })

const CampgroundSchema = new Schema({
    title: String,
    images: [ ImageSchema],
    geometry:{
        type:{
            type:String,  //don't do {location:{ type:String}}
            enum: ['Point'], //'lovation .type' must be 'Point'
            required: true
        },
        coordinates:{
            type:[Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:{
        type:Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function (){
    return `<strong><a class="link-underline-light" href="/campgrounds/${this._id}">${this.title}</a></strong><p>${this.description.substring(0,25)}...</p>`;
 })


CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);