const cors = require('cors');
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const path = require("path");
const express = require('express');
const passport = require('passport');
const logger = require('morgan');
const port = process.env.PORT || 3000;
const app = express();

require('./passport');
var index = require('./routes/index');
const auth = require('./Routes/auth');
const user = require('./Routes/user');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/auth', auth);
app.use('/user', passport.authenticate('jwt', { session: false }), user);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
        });
});


app.listen(port, function () {
    console.log("Server is running on port: " + port);
});

module.exports = app;