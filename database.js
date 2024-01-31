const { MongoClient } = require('mongodb');

const url = process.env.DB_URL; //몽고디비 database -> connect -> drivers
let connectDB = new MongoClient(url).connect();

module.exports = connectDB;
