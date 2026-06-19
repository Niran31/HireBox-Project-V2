import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: "hirebox_token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0 // Expired immediately
  })
  return response
}
