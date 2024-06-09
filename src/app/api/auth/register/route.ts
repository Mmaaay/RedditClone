import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { email, userName, password, confirmPassword } = await req.json();
  if (password !== confirmPassword) {
    return new Response("Passwords do not match", { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      return new Response("User already exists", { status: 400 });
    }

    await db.user.create({
      data: {
        email,
        name: userName,
        hashedPassword,
        username: nanoid(10),
      },
    });

    return new Response("User created successfully", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response(
      "Could not change username, please try again later " + error,
      {
        status: 500,
      }
    );
  }
}
