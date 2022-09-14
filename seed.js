const mongoose = require("mongoose");
const User = require("./models/user");
const Class = require("./models/class");
const Review = require("./models/review");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mongouri =
  process.env.MONGO_URI || "mongodb://localhost:27017/test-7xstudy";

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const users = [
  {
    fullname: "admin name",
    username: "admin",
    email: "admin@a.in",
    role: "admin",
  },
  {
    fullname: "teacher1 name",
    username: "teacher1",
    email: "teacher1@a.in",
    role: "teacher",
    apikey: "4cRC3DqCSpeUYOsg-xEKuw",
    apisecret: "ComfBfrmZq6idLn9feJoUSQm0gMAzECtrqZC",
  },
  {
    fullname: "teacher2 name",
    username: "teacher2",
    email: "teacher2@a.in",
    role: "teacher",
    apikey: "Vvf130kZTuaGSX-0Y-bbVQ",
    apisecret: "1KfheD3nMtXmQAMe2KTUfvbYL6mFHvK8ArSD",
  },
  {
    fullname: "student1 name",
    username: "student1",
    email: "student1@gmail.com",
    role: "student",
    class: "12",
  },
  {
    fullname: "student2 name",
    username: "student2",
    email: "student2@gmail.com",
    role: "student",
    class: "12",
  },
];
const seedDB = async () => {
  await User.deleteMany({});
  await Class.deleteMany({});
  await Review.deleteMany({});
  for (let u of users) {
    let user = new User({
      fullname: u.fullname,
      username: u.username,
      email: u.email,
      role: u.role,
    });
    if (u.role === "teacher") {
      const token = jwt.sign({ aud: null, iss: u.apikey }, u.apisecret, {
        algorithm: "HS256",
        expiresIn: 60 * 5,
      });

      const classroom = await axios({
        method: "post",
        url: "https://api.zoom.us/v2/users/me/meetings",
        data: {
          topic: "7x Study classroom",
          type: 3,
          settings: {
            host_video: false,
            participant_video: false,
            in_meeting: false,
            mute_upon_entry: true,
            audio: "voip",
            join_before_host: false,
          },
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      user.apikey = u.apikey;
      user.apisecret = u.apisecret;
      //classroom details for teacher
      user.classroom = {
        id: classroom.data.id,
        pwd: classroom.data.password,
        join_url: classroom.data.join_url,
        start_url: classroom.data.start_url,
      };
    } else if (u.role === "student") {
      //for student
      user.class = u.class;
    }

    await User.register(user, "password123");
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
