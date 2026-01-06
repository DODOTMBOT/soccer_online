import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Проверяем, начинается ли путь с /admin
    const isAdminPage = pathname.startsWith("/admin");

    // Если это админка, но роль в токене не ADMIN (строка из Enum Prisma)
    if (isAdminPage && token?.role !== "ADMIN") {
      // Редирект на главную или страницу "Доступ запрещен"
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      // Если authorized вернет false, пользователя просто кинет на страницу логина
      authorized: ({ token }) => !!token,
    },
  }
);

// Пути, которые перехватывает middleware
export const config = {
  matcher: [
    "/admin/:path*",
    // Можно добавить другие защищенные разделы, например:
    // "/profile/:path*",
    // "/settings/:path*",
  ],
};