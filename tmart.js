const fs = require('fs');
const http = require('http');
const express = require('express');
const { json } = require('stream/consumers');

const app = express();

app.use(express.json());

const file = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`)
);

app.get('/tmart/home/products', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      file,
    },
  });
});

app.post('/tmart/home/products', (req, res) => {
  const newId = file[file.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  file.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours.json`,
    JSON.stringify(file),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          newOne: newTour,
        },
      });
    }
  );
});

app.listen(2000, '127.0.0.1', () => {
  console.log('serverb listening at port 2000....');
});
