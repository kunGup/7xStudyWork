const express = require("express");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const methodOverride = require("method-override");
const path = require("path");
const Class = require("./models/class");
const User = require("./models/user");
const expressLayouts = require("express-ejs-layouts");
const ExpressError = require("./utils/ExpressError");
const LocalStrategy = require("passport-local").Strategy;
const { ensureAuthenticated } = require("./middleware");
//IMPORTING ROUTES
var indexRoute = require("./routes/index");
var userRoute = require("./routes/user");
var dashboardRoute = require("./routes/dashboard");
// var adminRoute = require("./routes/admin");

//mongoose
// const mongouri =
//   "mongodb+srv://root-user:OWV7oKw2RUzn41Kz@cluster0.87tll.mongodb.net/7xstudyDB?retryWrites=true&w=majority";
const mongouri = "mongodb://localhost:27017/test-7xstudy";
mongoose
  .connect(mongouri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

const app = express();
const port = 3002;

//Removed BODY-PARSER because deprecated
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//to use put and delete endpoints
app.use(methodOverride("_method"));

//mongo session store
var store = new MongoDBStore({
  uri: mongouri,
  collection: "Session",
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

//express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    unset: "destroy",
  })
);

//passport middlewares
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//use flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_alert = req.flash("success_alert");
  res.locals.error_alert = req.flash("error_alert");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//SETTING UP PUBLIC DIRECTORY
app.use(express.static("public"));

//SETTING VIEW ENGINE
app.set("view engine", "ejs");
app.use(expressLayouts);
// app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

//SETTING ROUTES
app.use("/", indexRoute);
// app.use("/admin", adminRoute);
app.use("/user", userRoute);
app.use("/dashboard", dashboardRoute);
app.get("/config/:classId", ensureAuthenticated, (req, res) => {
  Class.findById(req.params.classId)
    .populate("teacher")
    .exec((err, course) => {
      if (err) return;
      res.json({
        apikey: course.teacher.apikey,
        apisecret: course.teacher.apisecret,
      });
    });
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res, next) {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  console.log(err);
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

//SETTING UP PORT
app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
