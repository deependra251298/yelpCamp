const mongoose = require('mongoose') ;
const cities = require('./cities');
const { places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log("Database connected")
});


const sample = (array) => array[Math.floor(Math.random()*array.length)];


const seedDB= async () => {
    await Campground.deleteMany({});
    for(let i=0; i<150; i++){
        const random1000 = Math.floor(Math.random() *1000)
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat eleifend tempor. Cras dictum tellus nec congue mollis. Maecenas sollicitudin tincidunt tellus ut commodo. .',
            //your author id
            author:'653296074001bd1acf960f6a',
            price,
            geometry: {
               type: 'Point', 
               coordinates: [ 
                cities[random1000].longitude,
                cities[random1000].latitude,
               ] 
              },
            images: [
                {
                  url: 'https://res.cloudinary.com/dwgxusgug/image/upload/v1697706031/YelpCamp/jdaur1s6pqumta5y7ipe.jpg',
                  filename: 'YelpCamp/jdaur1s6pqumta5y7ipe',
                },
                {
                  url: 'https://res.cloudinary.com/dwgxusgug/image/upload/v1697706030/YelpCamp/qpcceggpd9ltvqrrea8u.jpg',
                  filename: 'YelpCamp/qpcceggpd9ltvqrrea8u',
                },
                {
                  url: 'https://res.cloudinary.com/dwgxusgug/image/upload/v1697706030/YelpCamp/bokqjleo30eitukkgnw9.jpg',
                  filename: 'YelpCamp/bokqjleo30eitukkgnw9',
                },
                {
                  url: 'https://res.cloudinary.com/dwgxusgug/image/upload/v1697706033/YelpCamp/lactqj65ejpovdftevri.jpg',
                  filename: 'YelpCamp/lactqj65ejpovdftevri',
                }
              ]

        })
        await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
})