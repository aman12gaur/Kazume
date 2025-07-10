import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

function makeId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function cleanJSON(content: string): string {
  let clean = content.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  return clean;
}

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

const model = new ChatOpenAI({
  temperature: 0.3,
  model: "mistral-saba-24b", // Use recommended, available model for Groq
  openAIApiKey: process.env.GROQ_API_KEY,
  configuration: {
    baseURL: GROQ_BASE_URL,
  },
});

async function generateQuestionNode(state: typeof MessagesAnnotation.State) {
  const last = state.messages[state.messages.length - 1];
  const content = typeof last.content === "string" ? last.content : "";
  const clean = cleanJSON(content);
  const { subject, chapter, topic, difficulty } = JSON.parse(clean);

  const prompt = `
You are an expert quiz generator for Class 9. 
Produce ONE question about:

- Subject: ${subject}
- Chapter: ${chapter}
- Topic: ${topic}
- Difficulty: ${difficulty}

Steps:
1. Pick a clear, realistic question suitable for Class 9.
2. Internally derive the *correct answer*.

Output ONLY JSON:
{
  "question": "Question text",
  "correctAnswerText": "Answer text",
  "subject": "${subject}",
  "chapter": "${chapter}",
  "topic": "${topic}",
  "difficulty": "${difficulty}"
}
No extra text.
  `.trim();

  const response = await model.invoke([new HumanMessage(prompt)]);
  return { messages: [...state.messages, response] };
}

async function verifyAndOptionNode(state: typeof MessagesAnnotation.State) {
  const last = state.messages[state.messages.length - 1];
  const content = typeof last.content === "string" ? last.content : "";
  const clean = cleanJSON(content);
  const parsed = JSON.parse(clean);

  const prompt = `
You are an expert MCQ creator.

Input:
- Question: ${parsed.question}
- Correct Answer: ${parsed.correctAnswerText}
- Subject: ${parsed.subject}
- Chapter: ${parsed.chapter}
- Topic: ${parsed.topic}
- Difficulty: ${parsed.difficulty}

Task:
1. Verify the answer is correct and age-appropriate.
2. Generate 3 DISTINCT, realistic distractor options.
3. Ensure 4 clear, plausible options.
4. Randomize order and provide correctAnswer index.

OUTPUT ONLY JSON:
{
  "id": "${makeId()}",
  "question": "${parsed.question}",
  "options": ["opt1", "opt2", "opt3", "opt4"],
  "correctAnswer": 0,
  "correctAnswerText": "opt_text",
  "explanation": "Short, clear explanation",
  "subject": "${parsed.subject}",
  "chapter": "${parsed.chapter}",
  "topic": "${parsed.topic}",
  "difficulty": "${parsed.difficulty}"
}
No extra text.
  `.trim();

  const response = await model.invoke([new HumanMessage(prompt)]);
  return { messages: [...state.messages, response] };
}

const quizAgenticApp = new StateGraph(MessagesAnnotation)
  .addNode("generator", generateQuestionNode)
  .addNode("verifier", verifyAndOptionNode)
  .addEdge("__start__", "generator")
  .addEdge("generator", "verifier")
  .addEdge("verifier", "__end__")
  .compile();

export { quizAgenticApp }; 