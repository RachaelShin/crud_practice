const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv").config();
const moment = require("moment");

const mongoClient = require("mongodb").MongoClient;

let db = null;
mongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  console.log("연결");
  if (err) {
    console.log(err);
  }
  db = client.db("crudApp");
});

// app.get("/", (req, res) => {
//   res.send("서버가 정상으로 구동합니다.");
// });

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/write", (req, res) => {
  res.render("write");
});

app.post("/add", (req, res) => {
  db.collection("count").findOne({ name: "total" }, (err, result) => {
    const total = result.totalPost;
    const subject = req.body.subject;
    const contents = req.body.contents;
    const time = moment(new Date()).format("YYYY-MM-DD");
    console.log(subject);
    console.log(contents);
    console.log(time);

    const insertData = {
      no: total + 1,
      subject: subject,
      contents: contents,
      time: time,
    };
    db.collection("crud").insertOne(insertData, (err, result) => {
      db.collection("count").updateOne({ name: "total" }, { $inc: { totalPost: 1 } });
      if (err) {
        console.log(err);
      }
      res.send(`
      <script>
        location.href="/list"
      </script>
      `);
    });
  });
});

app.get("/list", (req, res) => {
  db.collection("crud")
    .find()
    .toArray((err, result) => {
      console.log(result);
      res.render("list");
    });
});

app.listen(8099, () => {
  console.log("8099에서 서버대기중");
});
