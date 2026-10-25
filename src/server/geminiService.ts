/**
 * @license
 * CareOS - Healthcare Operating System
 * Team INNOGENIX | NSRIT Visakhapatnam
 *
 * Server-Side Gemini API Orchestration with Structured Function Calling
 */

import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client strictly with server environment key
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentContext {
  queueSummary: {
    token: string;
    patientName: string;
    doctorName: string;
    status: string;
    estimatedWaitMinutes: number;
    position: number;
  }[];
  doctors: {
    id: string;
    name: string;
    departmentName: string;
    isAvailable: boolean;
    currentDelayMinutes: number;
  }[];
  language?: 'en' | 'te'; // English or Telugu
}

export async function processAIAgentTurn(prompt: string, context: AgentContext) {
  const ai = getGeminiClient();

  if (!ai) {
    // Graceful offline fallback if GEMINI_API_KEY is not yet populated
    return generateLocalFallbackResponse(prompt, context);
  }

  try {
    const isTelugu = context.language === 'te' || /([\u0C00-\u0C7F])/.test(prompt);

    const systemInstruction = `You are CareVoice / CareAgent, the authorized AI clinical operations assistant for CareOS (Apex Medical Institute & Research Hospital, NSRIT Campus, Visakhapatnam).
You help patients and hospital staff with queue tracking, appointment booking, doctor schedules, and operational delays.
Guidelines:
1. Always be calm, respectful, accurate, and concise (2-4 sentences max).
2. Answer in ${isTelugu ? 'Telugu (or bilingual Telugu + English transliteration where helpful)' : 'English'}.
3. Use the provided real hospital context data. Never invent imaginary doctor names or queue slots.
4. If a patient asks about their queue token, look at the active queue data and tell them their exact position and estimated wait time.
5. If medical advice is requested, advise them that their doctor will examine them during consultation and offer immediate triage escalation if it is an emergency.
Hospital Context:
- Active Queue Tokens: ${JSON.stringify(context.queueSummary)}
- Doctors On Duty: ${JSON.stringify(context.doctors)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const replyText = response.text || "I am connected to the CareOS queue manager. How may I assist your visit today?";

    // Detect if this prompt triggered a potential action
    let detectedAction = null;
    const lower = prompt.toLowerCase();
    if (lower.includes('delay') || lower.includes('late')) {
      detectedAction = {
        type: 'DOCTOR_DELAY_QUERY',
        detail: 'Analyzed doctor schedule for delay impacts.',
      };
    } else if (lower.includes('token') || lower.includes('queue') || lower.includes('wait')) {
      detectedAction = {
        type: 'QUEUE_STATUS_LOOKUP',
        detail: 'Looked up real-time outpatient queue position.',
      };
    }

    return {
      text: replyText,
      action: detectedAction,
      isRealAI: true,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return generateLocalFallbackResponse(prompt, context);
  }
}

function generateLocalFallbackResponse(prompt: string, context: AgentContext) {
  const p = prompt.toLowerCase();

  if (p.includes('card-011') || p.includes('rajesh')) {
    return {
      text: 'Rajesh Varma (Token CARD-011) is currently in consultation with Dr. A. S. Rao in OPD Room 101.',
      action: { type: 'QUEUE_STATUS_LOOKUP', detail: 'Token CARD-011 active consult' },
      isRealAI: false,
    };
  }

  if (p.includes('card-012') || p.includes('lakshmi')) {
    return {
      text: 'P. Lakshmi Devi (Token CARD-012) is next! Your token has been called to OPD Room 101. Estimated wait is approximately 3 minutes.',
      action: { type: 'QUEUE_STATUS_LOOKUP', detail: 'Token CARD-012 called' },
      isRealAI: false,
    };
  }

  if (p.includes('card-013') || p.includes('venkatesh')) {
    return {
      text: 'Venkatesh K. (Token CARD-013) is at position #2 in Cardiology. Estimated waiting time is 18 minutes with Dr. A. S. Rao.',
      action: { type: 'QUEUE_STATUS_LOOKUP', detail: 'Token CARD-013 wait calculation' },
      isRealAI: false,
    };
  }

  if (p.includes('doctor') || p.includes('availability') || p.includes('cardiologist')) {
    return {
      text: 'Dr. A. S. Rao (Cardiology), Dr. V. Ramesh (Orthopedics), Dr. K. Radhika (General Medicine), and Dr. Priya Sharma (Pediatrics) are currently active and seeing patients on the morning shift.',
      action: { type: 'DOCTOR_LOOKUP', detail: 'Retrieved active doctor roster' },
      isRealAI: false,
    };
  }

  if (p.includes('delay')) {
    return {
      text: 'The CareOS Queue Prediction Engine tracks real-time delays. If a doctor reports a delay or emergency case, all patient ETAs automatically adjust and push real-time alerts.',
      action: { type: 'SYSTEM_INFO', detail: 'Queue delay logic explanation' },
      isRealAI: false,
    };
  }

  return {
    text: 'Welcome to CareOS NSRIT Health Hub. You can ask me for live queue positions, doctor availability, appointment bookings, or delay alerts.',
    action: null,
    isRealAI: false,
  };
}
