require("dotenv").config();
import express from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@repo/database/client";

const app = express();
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET;

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 5);

  try {
    await prismaClient.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword,
      },
    });
    res.json({
      message: "user signed up successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "not able to signup",
    });
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await prismaClient.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user) {
    res.json({
      message: "authentication failed",
    });
    return;
  }

  const verifyPassword = await bcrypt.compare(password, user.password);

  if (!verifyPassword) {
    res.json({
      message: "invalid password",
    });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET as string);

  res.json({
    token: token,
  });
});

app.post("/create-room", (req, res) => {
  res.json({
    message: "room created successfully",
  });
});

app.listen(3001, () => {
  console.log("server is up and succesfully running on port 3001");
});
