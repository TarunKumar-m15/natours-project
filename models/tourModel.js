const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

// Schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name must require'],
    unique: true,
    trim: true,
    maxlength: [40, 'name must less than or equal to 40'],
    minlength: [10, 'name must greater than or equal to 10']
  },
  duration: {
    type: Number,
    required: [true, "a tour must have a duration"]
  },
  maxGroupSize: {
    type: Number,
    required: [true, "a tour must have a group size"]
  },
  slug: {
    type: String
  },
  difficulty: {
    type: String,
    required: [true, "a tour must have a difficulty"],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'difficulty must east,medium or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    max: [5, 'rating is not more than 5.0'],
    min: [1, 'rating is not less than 1.0'],
    set : val => math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'price must be required']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'discount must be lower than regular price'
    }
  },
  secretTour: {
    type: Boolean,
    default: false
  },
  summary: {
    type: String,
    //required:[true,"A tour must have a summary"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    //required:[true,"AS tour must have a image cover"]
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [{
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String,
    day: Number
  }],
  guides: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

tourSchema.index({price:1 , ratingsAverage:-1});
tourSchema.index({slug:1});

//virtuals

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
})

//document middleware

tourSchema.pre('save', async function (next) {
  this.slug = slugify(this.name, { lower: true });
  //  next();
});

// tourSchema.pre('save',async function(){
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises)
// })

// tourSchema.pre('save',async function(next){
//    console.log('will save document...');
//   //  next();
// })

// tourSchema.post('save',async function(doc,next){
//    console.log(doc);
//   //  next();
// })


//query middleware 
tourSchema.pre(/^find/, async function (next) {
  this.find({ secretTour: { $ne: true } })
  this.start = Date.now();
});

tourSchema.post(/^find/, async function (docs, next) {
  console.log(`query took ${Date.now() - this.start} milliseconds`);
  //console.log(docs)
});

tourSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  }).populate({
    path:'reviews',
    select: 'review rating user createdAt -_id'
  })
});

// aggregation middleware

tourSchema.pre('aggregate', async function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
})


// Model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;