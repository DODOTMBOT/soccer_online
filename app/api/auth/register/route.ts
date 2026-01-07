import { NextResponse } from "next/server";
import { UserService } from "@/src/server/services/user.service";
import { z } from "zod";

const registerSchema = z.object({
  login: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const user = await UserService.register(result.data);

    return NextResponse.json({ user, message: "Регистрация успешна" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}