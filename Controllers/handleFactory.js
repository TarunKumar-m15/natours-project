const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');



exports.deleteOne = model => catchAsync(async (req, res,next) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new AppError('No document found with that ID',404))
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
 
});

exports.updateOne = model => catchAsync(async (req, res,next) => {

    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if(!doc){
      return next(new AppError('No document found with this ID',404))
    }
    res.status(200).json({
      status: 'success',
      data: {
        data:doc
      },
    });

});

exports.createOne = model => catchAsync(async (req, res,next) => {

    const doc = await model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data:doc
      },
    });
});


exports.getOne = (model,popOptions) => catchAsync(async (req, res,next) => {
   let query = await model.findById(req.params.id);
   if(popOptions) query = query.populate(popOptions);

    const doc = await query;

    if(!doc){
      return next(new AppError('no document found this Id',404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data:doc
      },
    });
});


exports.getAll = model => catchAsync(async (req, res,next) => {

    const features = new APIFeatures(model.find(), req.query)
      .filter()
      .sort()
       .limitFields()
      //.paginate();
    const docs = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedat: req.requestTime,
      results: docs.length,
      data: {
        data : docs
      },
    });
});
