module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      req.flash("error_alert", "Please login to view your dashboard");
      return res.redirect("/user/login");
    }
    next();
  },
};
