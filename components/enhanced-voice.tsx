"use client"

import { useState, useEffect } from "react"

interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  voice: SpeechSynthesisVoice | null
}

export function useEnhancedVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)

        // Try to find the best voice for Indian English or friendly English
        const preferredVoices = availableVoices.filter(
          (voice) =>
            voice.lang.includes("en") &&
            (voice.name.includes("Google") ||
              voice.name.includes("Microsoft") ||
              voice.name.includes("Natural") ||
              voice.name.includes("Samantha") ||
              voice.name.includes("Karen")),
        )

        if (preferredVoices.length > 0) {
          setSelectedVoice(preferredVoices[0])
        } else {
          const englishVoice = availableVoices.find((voice) => voice.lang.includes("en"))
          if (englishVoice) setSelectedVoice(englishVoice)
        }
      }

      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const speakWithEmotion = (
    text: string,
    emotion: "friendly" | "encouraging" | "explaining" | "excited" = "friendly",
  ) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()

      // Clean text for better speech
      const cleanText = text
        .replace(/[😊😅🤔🔑⏰🛠️🌐📚🎯💡✨🔥👍]/gu, "")
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
        .replace(/\*(.*?)\*/g, "$1") // Remove markdown italic
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanText)

      // Adjust voice settings based on emotion
      const settings: Record<string, VoiceSettings> = {
        friendly: { rate: 0.85, pitch: 1.1, volume: 0.9, voice: selectedVoice },
        encouraging: { rate: 0.8, pitch: 1.2, volume: 0.95, voice: selectedVoice },
        explaining: { rate: 0.75, pitch: 1.0, volume: 0.9, voice: selectedVoice },
        excited: { rate: 0.9, pitch: 1.3, volume: 1.0, voice: selectedVoice },
      }

      const currentSettings = settings[emotion]
      utterance.rate = currentSettings.rate
      utterance.pitch = currentSettings.pitch
      utterance.volume = currentSettings.volume

      if (currentSettings.voice) {
        utterance.voice = currentSettings.voice
      }

      // Add pauses for better comprehension
      utterance.text = cleanText.replace(/\. /g, ". ... ")

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const pauseSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.pause();
    }
  }

  const resumeSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.resume();
    }
  }

  return {
    speakWithEmotion,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
  }
}
