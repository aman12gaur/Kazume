import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json({ 
        error: "GROQ_API_KEY not found", 
        message: "Please set the GROQ_API_KEY environment variable" 
      }, { status: 500 });
    }

    // Test with a simple prompt
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: "Say 'Hello, this is a test!'" }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: "GROQ API test failed", 
        status: response.status,
        details: errorText 
      }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return NextResponse.json({ 
      success: true, 
      message: "GROQ API is working",
      response: content 
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json({ 
      error: "Test failed", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 