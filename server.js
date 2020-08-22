'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var sh = require('shorthash')

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
mongoose.connect("mongodb+srv://Charan1:sen2001@cluster0.wwaa3.gcp.mongodb.net/Cluster0?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
//mongodb+srv://<username>:<password>@cluster0.wwaa3.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority
const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));

connection.once('open', () => {
 console.log("MongoDB database connection established successfully");
})


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.urlencoded({extended: false}));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

const URLSchema = new mongoose.Schema({
  original_url:{type:String, required:true},
  new:Number
})

var URLs = mongoose.model('URLs', URLSchema)

app.post('/api/shorturl/new', (req, res)=>{
  let url = req.body.url
  dns.lookup(url, (err)=>{
    if(err)
      res.json({error:"invalid URL"})
  })
  var hash = sh.unique(url)
  var addURL = function(done) {
  let URL = new URLs({original_url: url, new: hash})
  URL.save((err, data)=>{
    if(err) console.error(err)
    done(null);
  });
  }
  res.json({original_url:req.body.url, new: hash})
})
app.get('/api/shorturl/:hash?', (req, res)=>{
  let hash = req.params.hash
  let foundURL;
  var findURL= function(hash, done) {
  URLs.find({new: hash}, (err, data)=>{
    if(err) console.error(err)
    foundURL = data.original_url
    done(null)
  })
  }
  dns.lookup(foundURL, (err)=>{
    if(err)
      res.json({error: "invalid URL"})
  })
  res.redirect(foundURL)
})



// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
