/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
var pg = require('pg');
//or native libpq bindings
//var pg = require('pg').native


app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || 'token';
var received_updates = [];

app.get('/', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
  res.send('<pre>Test</pre>');
});



app.get(['/facebook', '/instagram'], function(req, res) {   
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == token
  ) {
    res.send(req.param('hub.challenge'));
  } else {
    res.sendStatus(400);
  }
});

app.get(['/bd'], function(req, res) {   
var conString = process.env.ELEPHANTSQL_URL || "postgres://cgudwdkg:h7KwazdBN3u3KiI9_aMZabdf7V5ebrnQ@tantor.db.elephantsql.com:5432/cgudwdkg";

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    res.send('<pre>could not connect to postgres: '+ err +'</pre>');
    return console.error('could not connect to postgres', err);

  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      res.send('<pre>error running query: '+ err +'</pre>');
      return console.error('error running query', err);
    }
    res.send('<pre>error running query: '+ result.rows[0].theTime +'</pre>');
    console.log(result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    client.end();
  });
});

});



app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen();
