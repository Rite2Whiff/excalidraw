import express from "express";

const app = express();

app.post("/signup", (req, res) => {
  res.json({
    message: "user signed up successfully",
  });
});

app.post("/login", (req, res) => {
  res.json({
    message: "user logged in successfully",
  });
});

app.post("/create-room", (req, res) => {
  res.json({
    message: "room created successfully",
  });
});

app.listen(3001, () => {
  console.log("server is up and succesfully running on port 30001");
});
