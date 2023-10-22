const express = require('express');
const app = express();
const morgan = require('morgan');


app.use(morgan('tiny'));

app.use((req, res, next)=>{
    req.requestTime = Date.now();
    console.log(req.method, req.path);
    next();
})

app.get('/dogs', (req, res,next)=>{
    res.send('I love dogs')
    next();
})

const verifyPassword = (req,res, next)=>{
    const { password } = req.query;
    if(password ==='accessgranted'){
        next();
    }
    // res.send("PASSWORD NEEDED!!!!")
    throw new Error("Password required")
}

app.get('/', (req, res)=>{
    console.log(`REQUEST DATE: ${req.requestTime}`)
    res.send('HOME PAGE!')
})

app.get('/error', (req, res)=>{
    chicken.fly();
})
app.get('/dogs', (req, res)=>{
    console.log(`REQUEST DATE: ${req.requestTime}`)
    res.send('WOOF WOOF!')
})

app.get('/secret', verifyPassword, (req,res)=>{
    res.send('My SECRET is: boom Boom !!')
})

app.use((req, res)=>{
    res.status(404).send('NOT FOUND!')
})


app.listen(3000, () => {
    console.log('App is running on localhost:3000')
})