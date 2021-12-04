var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var questionRouter = require('./routes/questions');
var quizzRouter = require('./routes/quizz');
var answersRouter = require('./routes/answers');
var participationsRouter = require('./routes/participations');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/questions', questionRouter);
app.use('/quizz', quizzRouter);
app.use('/answers',answersRouter);
app.use('/participations',participationsRouter);

module.exports = app;
