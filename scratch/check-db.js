const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/opportune";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully!");
    
    // Find all events
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in DB:", collections.map(c => c.name));
    
    if (collections.some(c => c.name === "events")) {
      const events = await mongoose.connection.db.collection("events").find({}).toArray();
      console.log("\n--- EVENTS IN DATABASE ---");
      events.forEach(ev => {
        console.log({
          _id: ev._id,
          title: ev.title,
          status: ev.status,
          college: ev.college,
          organizerEmail: ev.organizer ? ev.organizer.email : "N/A",
          organizerName: ev.organizer ? ev.organizer.name : "N/A"
        });
      });
    } else {
      console.log("No events collection found!");
    }
    
    if (collections.some(c => c.name === "colleges")) {
      const colleges = await mongoose.connection.db.collection("colleges").find({}).toArray();
      console.log("\n--- COLLEGES IN DATABASE ---");
      colleges.forEach(c => {
        console.log({
          _id: c._id,
          name: c.name,
          email: c.email
        });
      });
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Connection error:", err);
  });
