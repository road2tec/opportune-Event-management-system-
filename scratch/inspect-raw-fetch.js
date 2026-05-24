const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/opportune";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected raw!");
    
    const db = mongoose.connection.db;
    
    // Find program "hackathon"
    const program = await db.collection("programs").findOne({ slug: "hackathon" });
    console.log("RAW PROGRAM:", program);
    
    if (program && program.event) {
      const event = await db.collection("events").findOne({ _id: program.event });
      console.log("POPULATED EVENT:", event);
      
      if (event && event.college) {
        const college = await db.collection("colleges").findOne({ _id: event.college });
        console.log("POPULATED COLLEGE:", college);
      } else {
        console.log("Event has no college!");
      }
    } else {
      console.log("Program has no event!");
    }
    
    mongoose.disconnect();
  });
