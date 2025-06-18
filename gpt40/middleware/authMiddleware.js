// Auth middleware to check if user is authenticated
function ensureAuthed(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/');
}

module.exports = { ensureAuthed };
