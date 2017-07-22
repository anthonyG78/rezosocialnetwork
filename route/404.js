const router    = require('express').Router();

module.exports  = (req, res, next) => {
  res.status(404);

  res.format({
    html: function () {
      return res.render('404', { error: 'Not found' });
    },
    json: function () {
      return res.json({ error: 'Not found' });
    },
    default: function () {
      return res.type('txt').send('Not found');
    }
  });
}