var express = require('express');
var MedeaStore = require('../')(express);

var app = express();

var sessionStore = new MedeaStore();

app.use(express.cookieParser());
app.use(express.session({ store: sessionStore, secret: 'choopa_the_cat', cookie: { maxAge: 30000 } }));

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(3000);

console.log('Listening on http://localhost:3000...');
