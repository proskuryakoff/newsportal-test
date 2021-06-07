var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user"),
    news = require("./models/news"),
    comments = require("./models/comments");

// mongoose.connect("mongodb://localhost:27017/newsportal", { useNewUrlParser: true , useUnifiedTopology: true  });
mongoose.connect("mongodb+srv://misha:TM0DXSWUnkaibIYv@cluster0.nhj63.mongodb.net/newsportal?retryWrites=true&w=majority", { useNewUrlParser: true , useUnifiedTopology: true  });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require("express-session")({
    secret: "lel",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//HOME PAGE
app.get("/", function(req,res){
    news.find({}, function(err,allNews){
        if(err){
            console.log(err);
        } else {
            res.render("home", {news: allNews});
        }
    });
});

//LOGIN
app.get("/login", function(req,res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function(req,res){
});

//LOG OUT
app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/");
});

//CHECK FOR LOG IN
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

//REGISTER
app.get("/register", function(req,res){
    res.render("register");
});

app.post("/register", function(req,res){
    User.register(new User({username: req.body.username, name: req.body.name, surname: req.body.surname}), req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.render('register');
        } passport.authenticate("local")(req, res, function(){
            res.redirect("/");
        });
    });
});

//CREATE A POST
app.get("/newpost", function(req,res){
    res.render("newpost");
});

app.post("/", function(req,res){
    var type = req.body.type;
    var title = req.body.title;
    var image = req.body.image;
    var body = req.body.body;
    var counter = 0;
    news.create({type: type, title: title, image: image, body: body, counter: counter}, function(err,news){
        if(err){
            res.render("newpost");
        } else {
            res.redirect("/");
        }
    });
});

//GO TO CURRENT POST
app.get("/:id", function(req,res){
    if(!req.user){
        news.findById(req.params.id).populate("comments").exec(function(err, foundNews){
            if(err){
                console.log(err);
                res.redirect("/");
                } else {
                    foundNews.counter++;
                    foundNews.save();
                res.render("show", {news: foundNews});
            }
    });
    } else {
        news.findById(req.params.id).populate("comments").exec(function(err, foundNews){
            if(err){
                console.log(err);
                res.redirect("/");
                } else {
                    foundNews.counter++;
                    foundNews.save();
                res.render("show_logged", {news: foundNews});
            }
        });
    }
});

//CREATE A COMMENT
app.post("/:id/newcomment", isLoggedIn, function(req,res){
    news.findById(req.params.id, function(err,news){
        if(err){
            console.log(err);
            res.redirect("/" + news._id);
        } else {
            comments.create(req.body.comments, function(err,comments){
                if(err){
                    console.log(err);
                    res.redirect("/" + news._id);
                } else {
                    comments.author.id = req.user._id;
                    comments.author.name = req.user.name + " " + req.user.surname;
                    comments.save();
                    news.comments.push(comments);
                    news.save();
                    res.redirect("/" + news._id);
                }
            });
        }
    });
});

//DELETE A POST
app.post("/:id", function(req,res){
    news.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/");
        } else {
            res.redirect("/");
        }
    });
});

//SERVER
app.listen(3000, function(){
    console.log("Server has been started!");
});