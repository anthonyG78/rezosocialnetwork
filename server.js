const express         = require('express');
const expressSession  = require('express-session');
const expressGraphQL  = require('express-graphql');
const methodOverride  = require("method-override");
const bodyParser      = require('body-parser');
const cookieParser    = require('cookie-parser');
const mongoose        = require('mongoose');
const MongoStore      = require('connect-mongo')(expressSession);
const passport        = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const conf            = require('./conf/conf')[process.env.NODE_ENV || 'dev'];

conf.mongoStore.mongooseConnection = mongoose.connection;
conf.session.store  = new MongoStore(conf.mongoStore);

var server, 
    // ioServer, 
    app     = express(),
    session = expressSession(conf.session),
    User    = require('./model/accounts');

// GENERAL
app.locals.conf = conf;
app.set('port', conf.server.port);
app.use("/", express.static(__dirname + '/public/'));
app.use("/", express.static(__dirname + '/file/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieParser());
app.use(methodOverride());

// SESSION
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serialize);
passport.deserializeUser(User.deSerialize);

// TEMPLATE
app.set('views', './views');
app.set('view engine', 'jade');

// GRAPHQL
app.use('/graphql', expressGraphQL({
    graphiql: true,
    schema: require('./graphql/schema'),
}));

// ROUTE
app.use('/api/secure', require('./middleware/api-secure.js'));
app.use('/api/secure/profil', require('./route/api/profil.js')(app));
app.use('/api/authenticate', require('./route/api/authenticate.js')(app));
app.use('/', require('./route/index.js')(app));
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
  server = app.listen(app.get('port'), () => {
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

  // exec(pjson.scripts.prestop, function(error, stdout, stderr) {
  //   process.exit(0);
  //   exec(pjson.scripts.stop);
  // });
  exec(pjson.scripts.devStop, (err, stdout, stderr) => {
    process.exit(0);
  });
});
// catch killall command
process.on('SIGTERM', () => {
  console.log('Program killed');
  process.exit(0);
});