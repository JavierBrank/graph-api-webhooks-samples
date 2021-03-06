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
  //var imp = crearQuery();
  //res.write(imp);
  res.write('<pre>' + JSON.stringify(received_updates[0]) + '</pre>');
  res.end();
});



app.get(['/facebook', '/instagram'], function(req, res) {   
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == token
  ) {
    res.write(req.param('hub.challenge'));
  } else {
   // res.sendStatus(400);
  }
   var error = ejecutarQuery();

  //res.write('<pre> ' + error + '</pre>');
  console.log(ejecutarQuery());
  res.end();
 
});





app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }
  received_updates.unshift(req.body);
  
  console.log('request header X-Hub-Signature validated');

  // Process the Facebook updates here
  var error = ejecutarQuery();

  res.write('<pre>ejecutarQuery();: ' + error + '</pre>');
  res.end();

  res.sendStatus(200);
});
/*
app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

*/
const ejecutarQuery = () => {
  
    var dblocal = "postgres://admin:admin@10.30.0.231:5432/db_inscripcion"
  var conString = process.env.ELEPHANTSQL_URL || dblocal;
 var ok = "nada";
var client = new pg.Client(conString);
client.connect(function(err) {
 
  if(err) {
    ok = "No es posible conectar con postgres:";
    return ok;

    //res.send('<pre>No es posible conectar con postgres: '+ err +'</pre>');
    return console.error('No es posible conectar con postgres:', err);
  }else {
    ok = "query ok:";
  }

  var queryInsert = crearQuery();
  if (!queryInsert){
    //  res.send('<pre>La variable esta vacia: '+ err +'</pre>');
    ok = "la variable esta vacia";
    return ok;
    return console.error('la variable esta vacia:', err);

  }
else
{
  ok = "query ok ok ";
}
  client.query(queryInsert, function(err, result) {
    if(err) {
      ok = "Error corriendo la queryInsert";
      return ok;
     // res.send('<pre>Error corriendo la queryInsert: '+ err +'</pre>');
      return console.error('Error corriendo la queryInsert:', err);
    }else {
      ok = "query ok ok  ok ";
    }
   
  //  res.send('<pre> corriendo la queryInsert: ' + JSON.stringify(result) + '</pre>')
    //console.log(result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    
    client.end();
    
  });
  return ok;
});


}
const crearQuery = () => {
    //var obj = JSON.parse(received_updates);
    if (received_updates == []){
      var id_page = received_updates[0].entry[0].id,
      json = JSON.stringify(received_updates[0]),
      sender_id = received_updates[0].entry[0].messaging[0].sender.id,
      estado = 1,
      saliente = false,
      detalle = "Mensaje entrante";
   if (id_page == sender_id) {
      detalle += "Mensaje saliente";
      saliente = true;
   }
    if (conString != dblocal){
      var id_log = unshift(req.body);
      var insert = "INSERT INTO tbface_log(id_log, fecha, id_page, json_data, saliente, estado, detalle) VALUES ("+id_log+", now(), '"+id_page+"', '"+json+"',"+saliente+", "+estado+",'"+detalle+"' );";

    }else{
       var insert = "INSERT INTO tbface_log(fecha, id_page, json_data, saliente, estado, detalle) VALUES (now(), '"+id_page+"', '"+json+"',"+saliente+", "+estado+",'"+detalle+"' );";
   
    }
   
    return insert;
  }else{
    return false;
  }
    
}
app.listen();
