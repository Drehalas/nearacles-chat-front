"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, ExternalLink } from "lucide-react"

interface EvaluationResponse {
  question: string
  sources: Array<{ title: string; url: string }> // Updated sources structure
  answer: boolean
  hash: string
  status: string
  tx_hash: string
  explorer_url: string
}

interface ChatMessage {
  id: string
  type: "question" | "response" | "verification" // Added verification type
  content: string | EvaluationResponse | string
  timestamp: Date
}

export default function EvaluationChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const questionMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "question",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, questionMessage])
    setIsLoading(true)

    try {
      const response = await fetch(
        "https://cc4c7002039f2264befef097a6cb27efb171135d-3000.dstack-prod5.phala.network/api/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: input }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to evaluate question")
      }

      const evaluationResult: EvaluationResponse = await response.json()

      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "response",
        content: evaluationResult,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, responseMessage])

      // Add verification message with explorer link
      const verificationMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: "verification",
        content: evaluationResult.explorer_url,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, verificationMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "response",
        content: "Error: Failed to evaluate question",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Evaluation Chat
              <Badge variant="outline">API Endpoint: /api/evaluate</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p>Ask a question to get started!</p>
                  <p className="text-sm mt-2">Try: "Is Berlin the capital of Germany?"</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.type === "verification" ? (
                    <div className="flex justify-center my-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100">
                          Verified on Blockchain
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={message.content as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-700 hover:text-green-800"
                          >
                            View Transaction <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : message.type === "question" ? (
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-[80%]">
                        <p>{message.content as string}</p>
                        <p className="text-xs opacity-75 mt-1">{formatTimestamp(message.timestamp)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="bg-white border rounded-lg p-4 max-w-[80%] shadow-sm">
                        {typeof message.content === "string" ? (
                          <p className="text-red-500">{message.content}</p>
                        ) : (
                          <EvaluationResult result={message.content as EvaluationResponse} />
                        )}
                        <p className="text-xs text-gray-500 mt-2">{formatTimestamp(message.timestamp)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Evaluating question...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EvaluationResult({ result }: { result: EvaluationResponse }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={result.answer ? "default" : "destructive"}>Answer: {result.answer ? "True" : "False"}</Badge>
        <Badge variant="outline">{result.status}</Badge>
      </div>

      {/* Sources section - moved to be more prominent */}
      {result.sources && result.sources.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-blue-700">📚 Sources:</span>
            <Badge variant="secondary" className="text-xs">
              {result.sources.length} source{result.sources.length > 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="space-y-2">
            {result.sources.map((source, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 text-sm mb-1">{source.title}</h4>
                    <p className="text-xs text-blue-700 break-all">{source.url}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="shrink-0">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Question:</span> {result.question}
        </div>

        <div>
          <span className="font-medium">Hash:</span>
          <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded break-all">{result.hash}</code>
        </div>

        <div className="space-y-1">
          <div>
            <span className="font-medium">Transaction:</span>
            <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded break-all">{result.tx_hash}</code>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={result.explorer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Verify on Etherscan
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
