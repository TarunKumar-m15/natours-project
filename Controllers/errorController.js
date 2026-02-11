const AppError = require("../utils/appError")

const handleCastErrorDB = err =>{
  const message = `Invalid ${err.path} : ${err.value}.`
  return new AppError(message,400)
}

const  handleValidationErrorDB = err =>{
  const errors = Object.values(err.errors).map(el=>el.message)
  const message = `Inavalid input ${errors.join('. ')}`;
  return new AppError(message,400)
}

const handleJsonWebTokenError = ()=> {
   new AppError('Invalid token,please login again',401);
}

const handleExpiredTokenError = ()=>{
  new AppError('Your Token has expired ,please login again',401);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message
  })
}

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    //log error
    console.error('Error',err)
    //send general error 
    res.status(500).json({
      status:'error',
      message:'something went wrong!!'
    })
  }
}


module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

   if(process.env.NODE_ENV === 'development'){
      return sendErrorDev(err,res)
   }else if(process.env.NODE_ENV === 'production'){
    
    let error = {...err}
    error.message = err.message;
    error.name = err.name;

    if(error.name === 'CastError') error = handleCastErrorDB(error)
    if(err.name === 'ValidationError') error = handleValidationErrorDB(error)
    if(err.name === 'JsonWebTokenError') error = handleJsonWebTokenError()
    if(err.name === 'TokenExpiredError') error = handleExpiredTokenError()
    sendErrorProd(error,res)
   }
};