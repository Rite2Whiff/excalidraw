import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "./interface";
import { JWT_SECRET } from "@repo/backend-common/config";

export default function authMiddleware(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers["authorization"] ?? " ";
  const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;

  if (!decoded) {
    res.json({
      message: "authentication failed",
    });
  } else {
    req.userId = decoded.userId;
    next();
  }
}
