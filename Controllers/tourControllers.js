const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handleFactory');
const { json } = require('stream/consumers');


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty';
  next();
}



exports.getTourStats = catchAsync(async (req, res,next) => {

    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numratings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        }
      }, {
        $sort: { avgPrice: 1 }
      },
      // {
      //   $match: {_id : { $ne : 'EASY'}}
      // }
    ]);
    res.status(200).json({
      status: 'success',
      requestedat: req.requestTime,
      results: stats.length,
      data: {
        stats
      },
    });
})

exports.getMonthlyPlan = catchAsync(async (req, res,next) => {

    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours : { $push : '$name'}
        }
      },
      {
        $addFields : { month: '$_id'}
      },
      {
        $project:{
          _id : 0
        }
      },
      {
        $limit : 12
      }
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        plan
      },
    });
 
});

exports.getAllTours = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour,{path:'reviews'});

exports.postTours = factory.createOne(Tour);

exports.patchTours = factory.updateOne(Tour);

exports.deleteTours = factory.deleteOne(Tour);