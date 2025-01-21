require("dotenv").config();
import express, { application } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/database/client";
import authMiddleware from "./middleware";
import { CustomRequest } from "./interface";
import { JWT_SECRET } from "@repo/backend-common/config";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());

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
      message: "user already exists with this username",
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

app.post("/create-room", authMiddleware, async (req: CustomRequest, res) => {
  const userId = req.userId as string;
  const slug = req.body.slug as string;

  if (!userId) {
    res.json({
      message: "unable to create a room",
    });
    return;
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        adminId: userId,
        slug: slug,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/chats/:roomId", authMiddleware, async (req: CustomRequest, res) => {
  const userId = req.userId;
  const roomId = Number(req.params.roomId);
  if (!userId) {
    res.json({
      message: "you are currently not logged in",
    });
    return;
  }

  const messages = await prismaClient.chat.findMany({
    where: {
      roomId,
    },
    orderBy: {
      id: "desc",
    },
    take: 50,
  });

  res.json({
    messages,
  });
});

app.get("/room/:slug", authMiddleware, async (req: CustomRequest, res) => {
  console.log("hello world");
  const slug = req.params.slug;
  const userId = req.userId;

  if (!userId) {
    res.json({
      message: "you are currently not logged in",
    });
    return;
  }

  const room = await prismaClient.room.findFirst({
    where: {
      slug,
    },
  });
  res.json({
    room,
  });
});

app.listen(3001, () => {
  console.log("server is up and succesfully running on port 3001");
});
