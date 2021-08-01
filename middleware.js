const {
  newClassSchema,
  updateClassSchema,
  userSchema,
  changeTeacherSchema,
  reviewSchema,
} = require("./schema");
const ExpressError = require("./utils/ExpressError");

module.exports.validateClass = (req, res, next) => {
  const { error } = newClassSchema.validate(req.body);
  console.log(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateClassUpdate = (req, res, next) => {
  const { error } = updateClassSchema.validate(req.body);
  console.log(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  console.log(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateChangeTeacher = (req, res, next) => {
  const { error } = changeTeacherSchema.validate(req.body);
  console.log(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  console.log(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    req.flash("error_alert", "Not allowed");
    return res.redirect("/dashboard");
  }
  next();
};

module.exports.isNotStudent = (req, res, next) => {
  if (req.user.role === "student") {
    req.flash("error_alert", "Not allowed");
    const redirectUrl = req.session.returnTo || "/dashboard";
    delete req.session.returnTo;
    return res.redirect(redirectUrl);
  }
  next();
};
module.exports.isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    req.flash("error_alert", "Not allowed");
    return res.redirect("/dashboard");
  }
  next();
};
