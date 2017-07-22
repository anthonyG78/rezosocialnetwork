const router    = require('express').Router();

module.exports  = (err, req, res, next) => {
  if(!err){
    return next();
  }

  if(typeof err == 'object') { // err instanceof Error
    err = { error: err.toString() };
  }
  
  res.status(500);

  res.format({
    html: function () {
      return res.render('500', err);
    },
    json: function () {
      return res.json(err);
    },
    default: function () {
      return res.type('txt').send('Error 500');
    }
  });
}