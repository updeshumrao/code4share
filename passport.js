var passport=require('passport')
var LocalStrategy=require('passport-local').Strategy;
var FacebookStrategy=require('passport-facebook').Strategy;

passport.serializeUser(function(user,done){
    done(null,user._id);
})

passport.deserializeUser(function(id,done){
    User.findOne({_id: id},function(err,user){
        done(err,user);
    })
})

passport.use(new LocalStrategy({
    usernameField:'email'
},
function(username,password,done)
{
    User.findOne({email:username},function(err,user){
        if(err) 
        {
            return done(err)
        }
        if(!user)
        {
            return done(null,false,{
                message:'Incorrect username or password'
            })
        }


        if(!user.validPassword(password)){
            return done(null,false,{
                message:'Incorrect Username or password'
            })
        }
        return done(null,user)
    })
}


))

passport.use(new FacebookStrategy({
    clientID: '2340674042621546',
    clientSecret:'63c723d45295855256a5b11d384e1c67',
    callbackURL:'http://localhost:3000/auth/facebook/callback',
    profileFields:['id','displayName','email']
},
function(token,refreshToken,profile,done){

   User.findOne({'FacebookId':profile.id} ,function(err,user){
       if(err) return done(err);
       if(user){
           return done(null,user)
       }
       else{
         User.findOne({email:profile.emails[0].value},function(err,user){
             if(user)
             {
                 user.FacebookId=profile.id
                 return user.save(function(err){
                     if(err) return done(null,false,{message:"can not save user info"})
                     return done(null,user);
                 })
             }


             var user=new User();
             user.name=profile.displayName;
             user.email=profile.emails[0].value;
             user.FacebookId=profile.id

             user.save(function(err){
                 if(err)
                 {
                    return done(null,false,{message:"can not save user info"}) 
                 }
                 return done(null,user);
             })
         })  
       }
   })

})
)

