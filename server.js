const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const path = require('path');
const createError = require('http-errors');
const flash = require('express-flash');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const connectDB = require('./includes/db');

connectDB();
const app = express();

// global value define
global.emailBasePath = __dirname + '/views/emails';        // define main email base path
global.storageBasePath = __dirname + '/public/storage';        // define main storage base path
global.publicBasePath = __dirname + '/public';        // define main public base path

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    createParentPath : true,
    parseNested: true,
}));

app.use(session({ 
    secret: '123456cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: parseInt(process.env.SESSION_EXPIRY) } // in miliseconds used when session will expired.
}));

// all routing here
const allRoutes = require("./routing");
app.use('/', allRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    flash('error', err.message);
    res.locals.error = process.env.APP_ENV === 'Dev' ? err : "Something went wrong";
    
    if(req.get('Content-Type') == "application/json"){
        res.status(200).json({
            code : 0,
            message: err.message,
            data : null,
            errors : null,
        });
    } else {
        // render the error page
        res.status(err.status || 500);
        if(err.status == 404){
            res.render('errors/404');
        } else {    
            res.render('errors/error');
        }
    }
});

app.listen(process.env.APP_PORT);

module.exports = app;