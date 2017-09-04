const express         = require('express');
const expressGraphQL  = require('express-graphql');
const methodOverride  = require("method-override");
const bodyParser      = require('body-parser');
const cookieParser    = require('cookie-parser');
const mongoose        = require('mongoose');
const passport        = require('passport');
const cors            = require('cors');
const auth            = require('./middleware/authenticate');
const { NODE_ENV }    = process.env;
const conf            = require('./conf/conf')[NODE_ENV || 'production'];
const app             = express();
const User            = require('./model/accounts');
//const ioServer; 

// GENERAL
app.locals.conf = conf;
app.set('port', conf.server.port);
app.use("/", express.static(__dirname + '/dist/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride());

// HEADERS (CORS)
app.use((req, res, next) => {
  res.set(conf.server.headers);
  next();
});

// TEMPLATE
app.set('views', './views');
app.set('view engine', 'jade');

// AUTH
app.use(auth.initialize());
passport.use(auth.strategy());
app.route(['/api/secure/*', '/graphql*']) //NODE_ENV !== 'dev' ? '/graphql*' : ''])
  .get(auth.authenticate())
  .post(auth.authenticate())
  .delete(auth.authenticate())
  .put(auth.authenticate());

// GRAPHQL
app.use('/graphql', cors(), expressGraphQL((req) => ({
  graphiql: NODE_ENV == 'dev',
  schema: require('./graphql/schema'),
  context: {
    user: req.user,
  },
})));

// ROUTE
app.use('/', require('./route/index.js')(app));
app.use('/api/authenticate', require('./route/api/authenticate.js')(app));
app.use('/api/secure/profil', require('./route/api/profil.js')(app));
app.use(require('./route/error.js'));
app.use(require('./route/404.js'));

// START MongoDb
mongoose.Promise = global.Promise;
mongoose.connect(conf.mongo.uri);
mongoose.connection.once('open', err => {
  if(err){
    console.log('Mongoose error', err);
    return;
  }

  console.log('Connection Mongoose >', conf.mongo.uri);

  // START server
  const server = app.listen(app.get('port'), () => {
    console.log( 'Server listening on port %d ', app.get('port'));
    console.log('PID: ' + process.pid);
    console.log('');
    // ioServer = require('./route/chat.io')(server, session);
  });
});

// catch ctrl-c command
process.on('SIGINT', () => {
  var exec = require('child_process').exec;
  var pjson = require('./package.json');

  exec(pjson.scripts.devStop, (err, stdout, stderr) => {
    process.exit(0);
  });
});
// catch killall command
process.on('SIGTERM', () => {
  console.log('Program killed');
  process.exit(0);
});