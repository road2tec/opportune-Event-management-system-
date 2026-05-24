const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/opportune";

mongoose.connect(MONGO_URI)
  .then(async () => {
    const colleges = await mongoose.connection.db.collection("colleges").find({}).toArray();
    console.log("COLLEGES DETAILS:");
    console.log(JSON.stringify(colleges, null, 2));
    mongoose.disconnect();
  });
