const mongoose = require("mongoose");
const Program = require("../src/models/Program").default;
const Event = require("../src/models/Event").default;
const College = require("../src/models/College").default;

const MONGO_URI = "mongodb://localhost:27017/opportune";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected! Fetching program...");
    try {
      const program = await Program.findOne({ slug: "hackathon" })
        .populate("event")
        .populate({
          path: "event",
          populate: { path: "college" },
        });
      
      console.log("SUCCESS! Program details fetched successfully!");
      console.log(JSON.stringify(program, null, 2));
    } catch (err) {
      console.error("CATCHED ERROR:", err);
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Connection error:", err);
  });
