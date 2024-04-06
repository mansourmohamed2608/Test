// src/middleware/ensureAuthenticated.js

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.session.userId) {
    req.userId = req.session.userId;
    return next();
  }
  res.status(401).json({ message: "not authenticated"});
}

module.exports = ensureAuthenticated;
