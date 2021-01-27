const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const http = require("http");
const fs = require("fs");
const path = require("path");
const bodyParser  = require('body-parser');
const publicPath = path.resolve(__dirname, "public");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(publicPath));

// Logger middleware
app.use((req, res, next) => {
    console.log("In comes a " + req.method + " to " + req.url);
    console.log("Request:" + req);
    console.log("Request date: " + new Date());
    next();
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

let con = MongoClient.connect('mongodb+srv://lukegrech:webstorepw@cw2webstore.qpoye.mongodb.net/Cw2Webstore?retryWrites=true&w=majority', 
{useUnifiedTopology: true}, { useNewUrlParser: true });

//Static File Middleware
app.use((req, res, next) => {
    let filePath = path.join(__dirname, "public", req.url);
    fs.stat(filePath, (err, fileInfo) => {
    if (err) {
        console.log(err);
        next();
        return;
    }
    if (fileInfo.isFile()){
        res.sendFile(filePath);
    }else{
        console.log(err);
        next();
    }});
});

//GET route that returns lessons
app.get('lessons', (req, res) => {
    con.then(client => client.db('afterschooldb').collection('lessons').find({}).toArray((err, result) => {
        if(err) console.log(err);
        res.send(JSON.stringify(result));
    }));
});

//POST route that saves order to database
app.post('/placeOrder', (req, res) => {
    con.then(client => client.db('afterschooldb').collection('orders').insertOne(req.body, (err, result) => {
        if(err) throw (err);
        res.send(result.ops)
    }));
});

//PUT route that updates available lesson spaces in database
app.put('/updateSpaces', (req, res) => {
    let data = req.body;
    for(let i = 0, l = data.length; i < l; i++) {
        let lessonID =  data[i].lesson_id;
        let updatedSpaces = { $set: {availableSpaces: data[i].availableSpaces - 1} };
        con.then(client =>  client.db('afterschooldb').collection('lessons').updateMany({ 
            lesson_id: lessonID
        }, updatedSpaces, { 
            safe: true,
            multi: true
        }, (err) => {
            if (err) throw err;
        }));
    }
});

const port = process.env.PORT || 4000;

http.createServer(app).listen(port);

// app.listen(port, () => {
//     console.log(`Listening on port ${port}`);
// });
