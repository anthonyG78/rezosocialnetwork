module.exports  = (req, res, next) => {
  if(req.isAuthenticated()){
      return next();
  }

  res.status(401);

  res.format({
    html: function () {
      return res.render('401', { error: '401 Unauthorized' });
    },
    json: function () {
      return res.json({ error: 'Unauthorized' });
    },
    default: function () {
      return res.type('txt').send('Unauthorized');
    }
  });
};