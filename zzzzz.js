const mongoose = require("mongoose");


// 0. Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/tourDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// 1. Create Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    duration: {
      type: Number,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    rating: {
      type: Number,
      default: 4.5
    },

    description: {
      type: String
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// 2. Create Model
const Tour = mongoose.model("Tour", tourSchema);

// 3. Export Model
module.exports = Tour;


// 4.import

const Tour = require("./models/Tour");

// 5.Create new tour
await Tour.create({
  name: "Manali Trip",
  duration: 7,
  price: 18000
});


//optionasl

const createTour = async () => {
  const tour = await Tour.create({
    name: "Goa Beach Tour",
    duration: 5,
    price: 15000,
    rating: 4.7,
    description: "Enjoy beaches and nightlife"
  });

  console.log(tour);
};

createTour();

// Tesing document (if it created or not)

const getTours = async () => {
  const tours = await Tour.find();
  console.log(tours);
};

getTours();

// finds one document

const getOneTour = async () => {
  const tour = await Tour.findOne({ name: "Goa Beach Tour" });
  console.log(tour);
};

getOneTour();


// update a document

const updateTour = async () => {
  const tour = await Tour.findOneAndUpdate(
    { name: "Goa Beach Tour" },
    { price: 16000 },
    { new: true }
  );

  console.log(tour);
};

updateTour();

//delete a document

const deleteTour = async () => {
  await Tour.findOneAndDelete({ name: "Manali Hill Tour" });
  console.log("Tour deleted");
};

deleteTour();

// Reads methods

find()
const tours = await Tour.find();

findOne()
const tour1 = await Tour.findOne({ name: "Goa Tour" });

findById()
const tour2 = await Tour.findById(id);

exists()

//Check if document exists

const exists = await Tour.exists({ name: "Goa Tour" });

countDocuments()
const count = await Tour.countDocuments();

//Updatye Methods

findByIdAndUpdate()
await Tour.findByIdAndUpdate(id, { price: 16000 }, { new: true });

findOneAndUpdate()
await Tour.findOneAndUpdate(
  { name: "Goa Tour" },
  { price: 17000 },
  { new: true }
);

updateOne()
await Tour.updateOne({ name: "Goa Tour" }, { price: 18000 });

updateMany()
await Tour.updateMany({ rating: 4.5 }, { price: 20000 });


//Delete methods

findByIdAndDelete()
await Tour.findByIdAndDelete(id);

findOneAndDelete()
await Tour.findOneAndDelete({ name: "Manali Tour" });

deleteOne()
await Tour.deleteOne({ name: "Goa Tour" });

deleteMany()
await Tour.deleteMany({ price: { $gt: 30000 } });

deleteMany()
await Tour.deleteMany({ price: { $gt: 30000 } });


//Documents Methods

// DOCUMENT METHODS (VERY IMPORTANT ⭐)


doc.save()
const tour = await Tour.findById(id);
tour.price = 19000;
await tour.save();


//✔ Runs validations
//✔ Runs middleware

//✅ doc.remove() / doc.deleteOne()
const tour = await Tour.findById(id);
await tour.deleteOne();

//✅ doc.toObject()

//Convert to plain JS object

tour.toObject();

//✅ doc.toJSON()

//Used when sending response

res.json(tour);

//✅ doc.populate()

//(For relations)

await tour.populate("reviews");


// query filtering

const queryObj = { ...req.query };
const excludeFields = ['page', 'sort', 'limit', 'fields'];
excludeFields.forEach(el => delete queryObj[el]);

// 2.Advanced Filtering

let queryStr = JSON.stringify(queryObj);
queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`);

// 3.sorting
if (req.query.sort) {
  const sortBy = req.query.sort.split(',').join(' ');
  query = query.sort(sortBy);
} else {
  query = query.sort('-createdAt');
}

// (createdAt  == ascending) && (-createdAt == descending )  IN SORTING

//virtual property

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});


// document middleware

const userSchema = new mongoose.Schema({
  name: String,
  password: String
});


userSchema.pre('save', function (next) {
  this.password = this.password + '_hashed';
  next();
});

/*
Common Document Middleware   Hooks Hook	When it Runs
pre('save')               	  Before saving document
post('save')	                After saving document
pre('validate')	              Before validation
post('validate')             	After validation
pre('remove')	              Before removing document
*/
