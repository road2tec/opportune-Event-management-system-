const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/opportune";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected!");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.some(c => c.name === "programs")) {
      const programs = await mongoose.connection.db.collection("programs").find({}).toArray();
      console.log("\n--- PROGRAMS ---");
      console.log(JSON.stringify(programs, null, 2));
    }
    
    if (collections.some(c => c.name === "teams")) {
      const teams = await mongoose.connection.db.collection("teams").find({}).toArray();
      console.log("\n--- TEAMS ---");
      console.log(JSON.stringify(teams, null, 2));
    }
    
    mongoose.disconnect();
  });
