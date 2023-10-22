const User = require('../models/user');


module.exports.renderRegister = (req, res)=>{
    res.render('users/register');
}


module.exports.registerLogic =async(req, res)=>{
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err=>{
        if(err) return next(err);
        req.flash('success', `Welcome ${username}`);
        res.redirect('/campgrounds')
    })
   
    }catch(e){
         req.flash('error', e.message);
         res.redirect('register');
        }
}



module.exports.loginUser = (req, res)=>{
    res.render('users/login');
}


module.exports.passportLogin = (req, res)=>{
    req.flash('success', 'Successfully logged in');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
    }

    module.exports.logoutUser = function(req,res, next){
        req.logout(function(err){
            if (err){ return next(err);}
            req.flash('success', 'goodBye');
            res.redirect('/campgrounds');
        })
    }