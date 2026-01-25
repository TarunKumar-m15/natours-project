const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

const Tour = require('./../../models/tourModel');

// Database connection
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB)
  .then(() => console.log('DB connection successful'));


//Read json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'));

//Import Data into DB

const importData = async ()=>{
    try{
        await Tour.create(tours);
        console.log('data successfully loaded');
    }catch(err){
        console.log(err);
    };
    process.exit();
}

//Dalete all data from collection

const deleteData = async ()=>{
    try{
        await Tour.deleteMany();
        console.log('data successfully deleted');
    }catch(err){
        console.log(err);
    };
    process.exit();
}


if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}