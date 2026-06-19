import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { message: errorData.message || "Invalid credentials" },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    const token = data.token
    
    const nextResponse = NextResponse.json({ success: true, token, username: data.username, email: data.email })
    nextResponse.cookies.set({
      name: "hirebox_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })
    
    return nextResponse
  } catch (error: any) {
    console.error("Login API Route error:", error)
    return NextResponse.json(
      { message: "Internal Server Error connecting to Flask backend" },
      { status: 500 }
    )
  }
}
