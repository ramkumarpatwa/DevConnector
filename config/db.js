const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

//lets make an asynchronous arrow function to connect to db using mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
