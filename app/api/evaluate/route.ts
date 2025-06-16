import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()

    if (!question) {
      return Response.json({ error: "Question is required" }, { status: 400 })
    }

    // Simulate evaluation logic - replace with your actual evaluation logic
    const evaluationResult = {
      question,
      sources: generateSources(question), // Updated to return array of objects
      answer: evaluateQuestion(question),
      hash: generateHash(question),
      status: "evaluated",
      tx_hash: generateTxHash(),
      explorer_url: `https://sepolia.etherscan.io/tx/${generateTxHash()}`, // Updated to real Etherscan URL
    }

    return Response.json(evaluationResult)
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Simple evaluation logic - replace with your actual logic
function evaluateQuestion(question: string): boolean {
  const lowerQuestion = question.toLowerCase()

  // Simple examples - replace with your evaluation logic
  if (lowerQuestion.includes("berlin") && lowerQuestion.includes("capital") && lowerQuestion.includes("germany")) {
    return true
  }
  if (lowerQuestion.includes("paris") && lowerQuestion.includes("capital") && lowerQuestion.includes("france")) {
    return true
  }
  if (lowerQuestion.includes("london") && lowerQuestion.includes("capital") && lowerQuestion.includes("uk")) {
    return true
  }

  // Default to false for unknown questions
  return Math.random() > 0.5 // Random for demo purposes
}

function generateHash(input: string): string {
  // Simple hash generation - replace with your actual hashing logic
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(64, "0")
}

function generateTxHash(): string {
  // Generate a mock transaction hash
  return "0x" + Math.random().toString(16).substr(2, 62)
}

function generateSources(question: string): Array<{ title: string; url: string }> {
  // Mock sources based on question - replace with your actual source logic
  const lowerQuestion = question.toLowerCase()

  if (lowerQuestion.includes("berlin")) {
    return [
      {
        title: "Berlin like a local",
        url: "https://www.reuters.com/city-memo/berlin-like-local-2024-11-23/?utm_source=openai",
      },
    ]
  }

  if (lowerQuestion.includes("paris")) {
    return [
      {
        title: "Paris Travel Guide",
        url: "https://example.com/paris-guide",
      },
    ]
  }

  // Return empty array for questions without specific sources
  return []
}
