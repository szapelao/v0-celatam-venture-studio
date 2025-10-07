"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2 } from "lucide-react"

const QUESTIONS = [
  {
    id: "name",
    question:
      "Hey there! I'm here to help you find the perfect opportunities for your Web3 project on Celo. What's your name?",
    type: "text",
    field: "full_name",
  },
  {
    id: "project",
    question: "Nice to meet you, {name}! What's the name of your Web3 project?",
    type: "text",
    field: "company_name",
  },
  {
    id: "stage",
    question: "Great! Where are you in your journey with {project}?",
    type: "select",
    field: "company_stage",
    options: [
      { value: "idea", label: "Just an idea right now" },
      { value: "mvp", label: "Building an MVP/Prototype" },
      { value: "early_stage", label: "Early stage with some traction" },
      { value: "growth", label: "Growing and scaling" },
      { value: "scale", label: "Scaling rapidly" },
    ],
  },
  {
    id: "category",
    question: "What space are you building in?",
    type: "select",
    field: "industry",
    options: [
      { value: "DeFi (Decentralized Finance)", label: "DeFi (Decentralized Finance)" },
      { value: "NFTs & Digital Assets", label: "NFTs & Digital Assets" },
      { value: "Web3 Infrastructure", label: "Web3 Infrastructure" },
      { value: "Blockchain Gaming", label: "Blockchain Gaming" },
      { value: "DAOs & Governance", label: "DAOs & Governance" },
      { value: "Cross-chain & Interoperability", label: "Cross-chain & Interoperability" },
      { value: "Web3 Social", label: "Web3 Social" },
      { value: "Decentralized Identity", label: "Decentralized Identity" },
      { value: "Carbon Credits & ReFi", label: "Carbon Credits & ReFi" },
      { value: "Web3 Payments", label: "Web3 Payments" },
      { value: "Other Web3/Blockchain", label: "Other Web3/Blockchain" },
    ],
  },
  {
    id: "description",
    question: "Tell me a bit about what {project} does. What problem are you solving?",
    type: "textarea",
    field: "bio",
  },
  {
    id: "github",
    question: "Do you have a GitHub repo for {project}? Drop the link here so I can check it out!",
    type: "text",
    field: "github_url",
    placeholder: "https://github.com/yourproject/repo",
  },
  {
    id: "needs",
    question: "What would help you most right now? Pick all that apply:",
    type: "multiselect",
    field: "needs",
    options: [
      { value: "funding", label: "Funding & Investment" },
      { value: "mentorship", label: "Mentorship & Advice" },
      { value: "talent", label: "Talent & Hiring" },
      { value: "partnerships", label: "Strategic Partnerships" },
      { value: "resources", label: "Resources & Tools" },
      { value: "customers", label: "Customer Acquisition" },
      { value: "advisors", label: "Advisors & Board Members" },
    ],
  },
]

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

export function ConversationalChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [inputValue, setInputValue] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Start conversation automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      addBotMessage(QUESTIONS[0].question)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const addBotMessage = (text: string) => {
    setIsTyping(true)
    setTimeout(() => {
      const formattedText = text
        .replace("{name}", answers.full_name || "")
        .replace("{project}", answers.company_name || "")

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: formattedText,
          isBot: true,
          timestamp: new Date(),
        },
      ])
      setIsTyping(false)
    }, 800)
  }

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        isBot: false,
        timestamp: new Date(),
      },
    ])
  }

  const handleSubmit = async () => {
    const currentQuestion = QUESTIONS[currentQuestionIndex]
    let answer: any

    if (currentQuestion.type === "multiselect") {
      if (selectedOptions.length === 0) return
      answer = selectedOptions
      addUserMessage(
        selectedOptions.map((opt) => currentQuestion.options?.find((o) => o.value === opt)?.label).join(", "),
      )
    } else {
      if (!inputValue.trim()) return
      answer = inputValue.trim()
      addUserMessage(inputValue)
    }

    // Save answer
    const newAnswers = { ...answers, [currentQuestion.field]: answer }
    setAnswers(newAnswers)

    // Reset input
    setInputValue("")
    setSelectedOptions([])

    // Move to next question or finish
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        addBotMessage(QUESTIONS[currentQuestionIndex + 1].question)
      }, 1000)
    } else {
      // All questions answered - redirect to results
      setTimeout(() => {
        addBotMessage("Perfect! Let me find the best opportunities for you...")
        setIsSubmitting(true)

        // Store answers in sessionStorage for results page
        sessionStorage.setItem("chatAnswers", JSON.stringify(newAnswers))

        setTimeout(() => {
          router.push("/results")
        }, 2000)
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex]

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="bg-white text-[#476520] px-6 py-8 text-center">
        <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ fontWeight: 700 }}>
          Hi, I'm your Celo buddy 👋
        </h1>
        <p className="text-sm md:text-base" style={{ fontWeight: 500 }}>
          Your fast track to build and thrive on Celo
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.isBot ? "justify-start" : "justify-end"}`}>
            {message.isBot && (
              <div className="flex-shrink-0">
                <Image src="/images/celina-avatar.png" alt="Celina" width={40} height={40} className="rounded-full" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.isBot
                  ? "bg-[#C8FCAA] text-[#222202]" // Mini green for Celina
                  : "bg-[#E7E3D4] text-[#222202]" // Soft grey for user
              }`}
              style={{ fontWeight: message.isBot ? 600 : 500 }} // Weight 600 for Celina's messages
            >
              <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <Image src="/images/celina-avatar.png" alt="Celina" width={40} height={40} className="rounded-full" />
            </div>
            <div className="bg-[#C8FCAA] rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-[#476520]/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#476520]/50 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#476520]/50 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isSubmitting && messages.length > 0 && (
        <div className="border-t border-border bg-card p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {currentQuestion.type === "select" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {currentQuestion.options?.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className="justify-start text-left h-auto py-3 border-[#476520] hover:bg-[#476520] hover:text-white transition-colors bg-transparent"
                    style={{ fontWeight: 600 }}
                    onClick={() => {
                      setInputValue(option.value)
                      setTimeout(() => handleSubmit(), 100)
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}

            {currentQuestion.type === "multiselect" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentQuestion.options?.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedOptions.includes(option.value) ? "default" : "outline"}
                      className={`justify-start text-left h-auto py-3 transition-colors ${
                        selectedOptions.includes(option.value)
                          ? "bg-[#476520] text-white"
                          : "border-[#476520] hover:bg-[#476520] hover:text-white"
                      }`}
                      style={{ fontWeight: 600 }}
                      onClick={() => {
                        setSelectedOptions((prev) =>
                          prev.includes(option.value)
                            ? prev.filter((v) => v !== option.value)
                            : [...prev, option.value],
                        )
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedOptions.length === 0}
                  className="w-full bg-[#476520] hover:bg-[#476520]/90 text-white"
                  style={{ fontWeight: 600 }}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentQuestion.type === "text" && (
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentQuestion.placeholder || "Type your answer..."}
                  className="flex-1 border-[#476520] focus:ring-[#476520]"
                  autoFocus
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="bg-[#476520] hover:bg-[#476520]/90 text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {currentQuestion.type === "textarea" && (
              <div className="space-y-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me about your project..."
                  rows={3}
                  className="resize-none border-[#476520] focus:ring-[#476520]"
                  autoFocus
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="w-full bg-[#476520] hover:bg-[#476520]/90 text-white"
                  style={{ fontWeight: 600 }}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center justify-center gap-2 text-[#476520]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm" style={{ fontWeight: 600 }}>
              Finding your matches...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
