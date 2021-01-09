const express = require('express')
const app = express()
const port = 3000


//IMPORTING BODY-PARSER
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//IMPORTING ROUTES
var indexRoute = require('./routes/index'); 
var dashboardRoute = require('./routes/dashboard'); 


//SETTING UP PUBLIC DIRECTORY
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));


//SETTING VIEW ENGINE
app.set('view engine', 'ejs')


//SETTING ROUTES
app.use('/', indexRoute);
app.use('/', dashboardRoute);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.send('404 Page Not Found');
});

//SETTING UP PORT
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))