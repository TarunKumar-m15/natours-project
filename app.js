const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErroeHandler = require('./Controllers/errorController')


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1)Global middleware

//set security HTTP headers
app.use(helmet());

// Limit requests from same Api
const limitter = rateLimit({
  max:100,
  windowMs: 60 * 60 * 1000,
  message:'Too amny requests from IP, Please try in an hour!'
});

app.use('/api',limitter);


// Body parser, reading data from body to req.body
app.use(express.json({limit:'10kb'}));

//data sanitization against NoSql injection
app.use(sanitize());

//Data sanitize against XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp({
  whitelist:[
  'duration',
  'ratingsQuantity',
  'ratingsAverage',
  'maxGroupSize',
  'difficulty',
  'price'
 ]
}))

//serving static files
app.use(express.static(`${__dirname}/public`));

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});




//For any request starting with /api/v1/tours, send it to tourRouter

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`));
});

app.use(globalErroeHandler);

module.exports = app;


