// Server-side function for Groq API calls
export async function askGroqAI(question: string, subject?: string, topic?: string) {
  try {
    console.log("Making chat request:", { question: question.substring(0, 50), subject, topic })

    // Make API call to our Next.js API route instead of directly to Groq
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        subject,
        topic,
        type: "chat",
      }),
    })

    console.log("Chat API response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("Chat API route error:", errorData)

      if (response.status === 401) {
        return "Sorry beta, AI service mein kuch authentication problem hai. Teacher ko batao! 🔑"
      } else if (response.status === 429) {
        return "Arre yaar, abhi bahut saare students questions puch rahe hain! Thoda wait karo aur phir try karo. 😅 ⏰"
      } else if (response.status >= 500) {
        return "Sorry beta, AI service abhi down hai. Main jaldi wapas aa jaunga! Thoda patience rakho. 🛠️"
      }

      return "Sorry beta, kuch technical problem hai. Thoda der baad try karo! 😅"
    }

    const data = await response.json()
    return (
      data.content ||
      "Sorry beta, main samajh nahi paya. Kya aap question thoda aur clear kar sakte hain? Main help karna chahta hun! 🤔"
    )
  } catch (error) {
    console.error("Chat API error:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return "Arre yaar, network connection mein problem lag rahi hai! Internet check karo aur phir try karo. Main yahan wait kar raha hun! 🌐"
    }

    return "Sorry beta, abhi main answer nahi de sakta. Kuch technical problem hai. Thoda der baad try karo, main definitely help karunga! 😅"
  }
}

// Enhanced function for generating course content
export async function generateCourseContent(topic: string, subject: string, language: "english" | "hindi" = "english") {
  try {
    console.log("Making content request:", { topic, subject, language })

    const response = await fetch("/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        subject,
        type: "content",
        language,
      }),
    })

    console.log("Content API response status:", response.status)

    if (!response.ok) {
      console.error("Content API request failed:", response.status)

      // Return fallback content instead of throwing error
      return `# ${topic}

## Introduction
${topic} is an important concept in ${subject} for Class 9 students.

## Key Learning Objectives:
- Understand the fundamental principles
- Learn practical applications
- Develop problem-solving skills

## Important Points:
- Step-by-step approach to understanding
- Real-world examples and applications
- Practice exercises for better comprehension

## Study Tips:
- Read the concept carefully
- Practice with examples
- Ask questions when in doubt

*Note: Detailed content is being prepared. Please try again later or refer to your textbook for comprehensive information.*`
    }

    const data = await response.json()
    return data.content || `# ${topic}\n\nContent could not be generated at this time. Please try again later.`
  } catch (error) {
    console.error("Error generating course content:", error)

    // Return fallback content instead of throwing error
    return `# ${topic}

## Overview
This topic is part of the ${subject} curriculum for Class 9.

## Key Concepts:
- Basic understanding and definitions
- Important principles and formulas
- Practical applications

## Learning Approach:
- Start with basic concepts
- Practice with examples
- Apply knowledge to solve problems

## Study Resources:
- Textbook chapters
- Practice exercises
- Online resources

*Content is temporarily unavailable. Please refer to your textbook or try again later.*`
  }
}
