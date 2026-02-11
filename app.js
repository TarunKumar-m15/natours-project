const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErroeHandler = require('./Controllers/errorController')


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1)middleware

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if(process.env.NODE_ENV === 'development'){
     app.use(morgan('dev'));
}




app.use((req, res, next) => {
  console.log('middleware 2..');
  req.requestTime = new Date().toISOString();
  next();
});



app.use(express.json());


//For any request starting with /api/v1/tours, send it to tourRouter

app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

app.all('*',(req,res,next)=>{
  next(new AppError(`can't find ${req.originalUrl} on this server!`));
});

app.use(globalErroeHandler);

module.exports = app;


