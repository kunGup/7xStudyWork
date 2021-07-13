module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_alert", "Please login to view your dashboard");
    res.redirect("/user/login");
  },
};
