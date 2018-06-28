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
var conString = process.env.ELEPHANTSQL_URL || "postgres://admin:admin@10.30.0.231:5432/db_inscripcion";

var client = new pg.Client(conString);

app.get(['/bd','/basededatos','/db'], function(req, res) {   

client.connect(function(err) {
  if(err) {
    res.write ('<pre>No se puede conectar con el servidor de basededatos: '+ err +'</pre>')
    return console.error('No se puede conectar con el servidor de basededatos', err);

  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      res.write('<pre>Error con query: '+ err +'</pre>')
      return console.error('error running query', err);
    }else{
       res.write('<pre>Query ejecutada con exito: '+ result.rows[0].theTime +'</pre>');
    }
    
    res.write('<pre>' + JSON.stringify(result) + '</pre>')
   
    console.log(result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    res.end();
    
   client.end((err) => {
  console.log('client has disconnected')
  if (err) {
    console.log('error during disconnection', err.stack)
  }
})
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
