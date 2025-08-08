import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabaseClient';
import { validateQuestions } from '@/lib/question-validation';

function cleanJSON(content: string): string {
  let clean = content.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  return clean;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subject, topic, type, language, question, chapter, difficulty } = body;

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  let model = "llama-3.3-70b-versatile";

  const timestamp = new Date().toISOString();

  if (type === "content") {
    let prompt = `You are an expert educator creating comprehensive study material for the topic "${topic}" in ${subject} for Class 9 students.`;
    if (language === "hindi") {
      prompt = `आप एक विशेषज्ञ शिक्षक हैं। कृपया \"${topic}\" विषय पर कक्षा 9 के लिए हिंदी में अध्ययन सामग्री बनाएं।`;
    }
    const groqPayload = {
      model,
      messages: [
        { role: "system", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    };
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqPayload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: "AI generation failed", details: errorText }, { status: 500 });
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }
    // Store interaction in Supabase
    await supabase.from('interactions').insert([
      {
        type: 'content', subject, topic, chapter, difficulty, language, question: null, response: content, timestamp
      }
    ]);
    return NextResponse.json({ content });
  }

  if (type === "chat") {
    let prompt = `You are a helpful, friendly tutor for Indian Class 9 students. Answer in simple, clear English with step-by-step explanations. If the question is about ${topic || subject}, focus on that. Be concise, supportive, and use examples students can relate to.`;
    if (language === "hindi") {
      prompt = `आप एक सहायक, मित्रवत शिक्षक हैं। कृपया कक्षा 9 के छात्रों के लिए सरल हिंदी में, चरण-दर-चरण उत्तर दें। यदि प्रश्न \"${topic || subject}\" से संबंधित है, तो उसी पर ध्यान दें। उत्तर संक्षिप्त, सहायक और उदाहरण सहित दें।`;
    }
    const groqPayload = {
      model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    };
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqPayload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: "AI generation failed", details: errorText }, { status: 500 });
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }
    // Store interaction in Supabase
    await supabase.from('interactions').insert([
      {
        type: 'chat', subject, topic, chapter, difficulty, language, question, response: content, timestamp
      }
    ]);
    return NextResponse.json({ content });
  }

  if (type === "questions") {
    let prompt = `You are an expert educational AI quiz generator for Indian Class 9 students. Your task is to produce 10 high-quality, accurate multiple-choice questions (MCQs) in JSON format only.

SUBJECT: "${subject}"
CHAPTER: "${chapter}"
TOPIC: "${topic}"
DIFFICULTY: "${difficulty}"

CRITICAL REQUIREMENTS:
1. Each question must test precisely the specific topic "${topic}" from chapter "${chapter}" of subject "${subject}"
2. Questions must be suitable for Class 9 with "${difficulty}" level - use age-appropriate language and concepts
3. ALL ANSWERS MUST BE FACTUALLY CORRECT - verify accuracy for Indian Class 9 curriculum
4. Each question must have exactly 4 options (A, B, C, D)
5. correctAnswer must be the index (0-3) of the correct option
6. correctAnswerText must match the exact text of the correct option
7. All options should be plausible but only one should be correct
8. Include clear explanations for why the correct answer is right
9. Use Indian educational context and examples where appropriate

OUTPUT FORMAT:
JSON array of exactly 10 objects with these fields:
- id: unique identifier
- question: the question text
- options: array of 4 answer choices
- correctAnswer: index (0-3) of correct option
- correctAnswerText: exact text of correct answer
- explanation: why the correct answer is right
- subject: "${subject}"
- chapter: "${chapter}"
- topic: "${topic}"
- difficulty: "${difficulty}"

IMPORTANT: Ensure all questions are factually accurate and appropriate for Class 9 level. Double-check that correctAnswer index matches the correctAnswerText.`;
    const groqPayload = {
      model,
      messages: [
        { role: "system", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    };
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqPayload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: "AI generation failed", details: errorText }, { status: 500 });
    }
    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }
    content = cleanJSON(content);
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        // Validate and format questions using the validation utility
        const validatedQuestions = validateQuestions(parsed).map((q, index) => ({
          ...q,
          subject: q.subject || subject,
          chapter: q.chapter || chapter,
          topic: q.topic || topic,
          difficulty: q.difficulty || difficulty
        }));
        
        // Store interaction in Supabase
        await supabase.from('interactions').insert([
          {
            type: 'questions', subject, topic, chapter, difficulty, language, question: null, response: JSON.stringify(validatedQuestions), timestamp
          }
        ]);
        return NextResponse.json(validatedQuestions);
      } else {
        return NextResponse.json({ error: "AI did not return a JSON array." }, { status: 500 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse AI response as JSON.", raw: content }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid request type for this endpoint." }, { status: 400 });
}
