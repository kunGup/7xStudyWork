const mongoose = require("mongoose");
const User = require("./models/user");
const Class = require("./models/class");
const jwt = require("jsonwebtoken");
const axios = require("axios");

mongoose.connect("mongodb://localhost:27017/test-7xstudy", {
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
    username: "admin",
    email: "admin@a.in",
    role: "admin",
  },
  {
    username: "teacher1",
    email: "teacher1@a.in",
    role: "teacher",
    apikey: "4cRC3DqCSpeUYOsg-xEKuw",
    apisecret: "ComfBfrmZq6idLn9feJoUSQm0gMAzECtrqZC",
  },
  {
    username: "teacher2",
    email: "teacher2@a.in",
    role: "teacher",
    apikey: "Vvf130kZTuaGSX-0Y-bbVQ",
    apisecret: "1KfheD3nMtXmQAMe2KTUfvbYL6mFHvK8ArSD",
  },
  {
    username: "student1",
    email: "goodkunal723@gmail.com",
    role: "student",
    class: "12",
  },
  {
    username: "student2",
    email: "greatkunal49@gmail.com",
    role: "student",
    class: "12",
  },
];
const seedDB = async () => {
  await User.deleteMany({});
  await Class.deleteMany({});
  for (let u of users) {
    let user = new User({
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
            waiting_room: true,
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
