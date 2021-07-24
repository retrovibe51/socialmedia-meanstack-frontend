const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(__dirname + '/dist/front-end'));   // front-end is the app name as defined in package.json
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/front-end/index.html'));  // front-end is the app name as defined in package.json
});

app.listen(process.env.PORT || 8080);   // 8080 is the default port of heroku
