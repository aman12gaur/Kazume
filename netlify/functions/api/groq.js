const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function cleanJSON(content) {
  let clean = content.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  return clean;
}

exports.handler = async function(event, context) {
  console.log('Groq function called with:', {
    method: event.httpMethod,
    path: event.path,
    body: event.body ? JSON.parse(event.body) : null
  });

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { subject, topic, type, language, question, chapter, difficulty } = body;

    console.log('Processing request:', { type, subject, topic });

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    let model = "llama-3.3-70b-versatile";

    const timestamp = new Date().toISOString();

    if (type === "content") {
      let prompt = `You are an expert educator creating comprehensive study material for the topic "${topic}" in ${subject} for Class 9 students.`;
      if (language === "hindi") {
        prompt = `आप एक विशेषज्ञ शिक्षक हैं। कृपया "${topic}" विषय पर कक्षा 9 के लिए हिंदी में अध्ययन सामग्री बनाएं।`;
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
        console.error('Groq API error:', errorText);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "AI generation failed", details: errorText }),
        };
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Empty AI response" }),
        };
      }
      // Store interaction in Supabase
      await supabase.from('interactions').insert([
        {
          type: 'content', subject, topic, chapter, difficulty, language, question: null, response: content, timestamp
        }
      ]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ content }),
      };
    }

    if (type === "chat") {
      let prompt = `You are a helpful, friendly tutor for Indian Class 9 students. Answer in simple, clear English with step-by-step explanations. If the question is about ${topic || subject}, focus on that. Be concise, supportive, and use examples students can relate to.`;
      if (language === "hindi") {
        prompt = `आप एक सहायक, मित्रवत शिक्षक हैं। कृपया कक्षा 9 के छात्रों के लिए सरल हिंदी में, चरण-दर-चरण उत्तर दें। यदि प्रश्न "${topic || subject}" से संबंधित है, तो उसी पर ध्यान दें। उत्तर संक्षिप्त, सहायक और उदाहरण सहित दें।`;
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
        console.error('Groq API error:', errorText);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "AI generation failed", details: errorText }),
        };
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Empty AI response" }),
        };
      }
      // Store interaction in Supabase
      await supabase.from('interactions').insert([
        {
          type: 'chat', subject, topic, chapter, difficulty, language, question, response: content, timestamp
        }
      ]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ content }),
      };
    }

    if (type === "questions") {
      let prompt = `You are an expert educational AI quiz generator. Your task is to produce 10 high-quality, Class 9-level multiple-choice questions (MCQs) in JSON format only.\n\n- Subject: "${subject}"\n- Chapter: "${chapter}"\n- Topic: "${topic}"\n- Difficulty: "${difficulty}"\n\nREQUIREMENTS:\n1. Each question must test precisely the specific topic "${topic}" from chapter "${chapter}" of subject "${subject}".\n2. Questions must be suitable for Class 9 with "${difficulty}" level. Use age-appropriate language and rigor.\n3. Output a JSON array of exactly 10 objects. Each object must have: id, question, options (array of 4), correctAnswer (index), correctAnswerText, explanation, subject, chapter, topic, difficulty.\n4. No extra text, only the JSON array.`;
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
        console.error('Groq API error:', errorText);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "AI generation failed", details: errorText }),
        };
      }
      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;
      if (!content) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Empty AI response" }),
        };
      }
      content = cleanJSON(content);
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          // Store interaction in Supabase
          await supabase.from('interactions').insert([
            {
              type: 'questions', subject, topic, chapter, difficulty, language, question: null, response: JSON.stringify(parsed), timestamp
            }
          ]);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(parsed),
          };
        } else {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "AI did not return a JSON array." }),
          };
        }
      } catch (e) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Failed to parse AI response as JSON.", raw: content }),
        };
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request type for this endpoint." }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
}; 