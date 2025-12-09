import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { VertexAI } from '@google-cloud/vertexai';

/**
 * Crisis Detection Keywords
 * Detects explicit self-harm and suicidal ideation
 */
const CRISIS_KEYWORDS = [
  /\b(kill myself|suicide|end my life|want to die|better off dead)\b/i,
  /\b(hurt myself|self harm|cut myself|self-harm)\b/i,
  /\b(overdose|end it all)\b/i,
];

/**
 * Crisis Response Message
 * Shown when crisis keywords are detected
 */
const CRISIS_RESPONSE = {
  role: 'crisis',
  isCrisisResponse: true,
  text: `I'm deeply concerned about what you're sharing. You deserve immediate support from a trained professional.

**Crisis Resources:**

🆘 **988 Suicide & Crisis Lifeline**
Call or text: 988
Available 24/7

💬 **Crisis Text Line**
Text HOME to 741741

🌐 **International Association for Suicide Prevention**
findahelpline.com

You matter. Please reach out to one of these services now.`,
};

/**
 * Therapeutic System Prompt for Gemini
 * UPDATED: Optimized for depth, empathy, and thorough CBT/ACT support.
 */
const SYSTEM_PROMPT = `You are 'Anchor,' a compassionate, calm, and grounded mental health companion for a Gen Z user.

Your Goal: Help the user de-escalate anxiety using CBT (Cognitive Behavioral Therapy) and ACT (Acceptance and Commitment Therapy) techniques.

Guidelines:
1. Tone: Warm, validating, and low-pressure. Speak like a wise, calm friend, not a clinical robot.
2. Method: Use Socratic Questioning, but balance it with comforting explanations. Don't just ask questions—validate their feelings first.
3. Length: **Prioritize depth and clarity.** You are free to provide comprehensive answers, analogies, and step-by-step guidance. Do not rush.
4. Formatting: Use paragraphs, bullet points, and spacing to make long text easy to read.
5. Safety: You are NOT a doctor. If the user mentions self-harm, direct them to professional help immediately.
6. Context: The user is looking for a meaningful conversation. Be present with them.`;

/**
 * Cloud Function: onMessageCreate
 * Triggered when a new message is added to Firestore
 * Responds with AI-generated therapeutic messages or crisis resources
 */
export const onMessageCreate = onDocumentCreated(
  'users/{userId}/messages/{messageId}',
  async (event): Promise<void> => {
    const snap = event.data;
    if (!snap) {
      logger.error('No data in snapshot');
      return;
    }

    const message = snap.data();
    const userId = event.params.userId;

    // 1. Validate: Only process user messages
    if (message.role !== 'user') {
      logger.info('Skipping non-user message', { userId, role: message.role });
      return;
    }

    logger.info('Processing user message', { userId, messageId: snap.id });

    try {
      // 2. Crisis Detection: Check for self-harm keywords BEFORE AI call
      const hasCrisisKeyword = CRISIS_KEYWORDS.some((regex) => regex.test(message.text));

      if (hasCrisisKeyword) {
        logger.warn('Crisis keyword detected', { userId, text: message.text });

        // Write crisis response immediately and exit
        await admin
          .firestore()
          .collection(`users/${userId}/messages`)
          .add({
            ...CRISIS_RESPONSE,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        return;
      }

      // 3. Fetch Context: Get last 10 messages for conversation history
      const messagesSnapshot = await admin
        .firestore()
        .collection(`users/${userId}/messages`)
        .where('role', 'in', ['user', 'assistant']) // Exclude crisis messages
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const conversationHistory = messagesSnapshot.docs
        .map((doc) => ({
          role: doc.data().role,
          text: doc.data().text,
        }))
        .reverse(); // Oldest first for proper context

      logger.info('Fetched conversation history', {
        userId,
        historyLength: conversationHistory.length,
      });

      // 4. Build Gemini Conversation Format
      const contents = conversationHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      // 5. Call Vertex AI (Gemini 1.5 Pro)
      const vertexAI = new VertexAI({
        project: process.env.GCLOUD_PROJECT,
        location: 'us-central1',
      });

      const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });

      const startTime = Date.now();
      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: 8192, // Allow deep, comprehensive responses (~6000 words)
          temperature: 0.7, // Balanced creativity
          topP: 0.9,
          topK: 40,
        },
      });

      const responseTime = Date.now() - startTime;

      // Debug: Log full response structure
      const candidate = result.response.candidates?.[0];
      logger.info('Gemini raw response', {
        userId,
        finishReason: candidate?.finishReason,
        safetyRatings: candidate?.safetyRatings,
        partsCount: candidate?.content?.parts?.length,
        fullResponse: JSON.stringify(candidate),
      });

      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm here for you. Can you tell me more about what you're feeling?";

      logger.info('AI response generated', {
        userId,
        responseTime,
        messageLength: responseText.length,
        actualText: responseText,
      });

      // 6. Write Assistant Response to Firestore
      await admin
        .firestore()
        .collection(`users/${userId}/messages`)
        .add({
          userId,
          role: 'assistant',
          text: responseText,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            model: 'gemini-2.5-flash',
            responseTime,
          },
        });
    } catch (error) {
      logger.error('Error processing message', { userId, error });

      // Write fallback error message
      await admin.firestore().collection(`users/${userId}/messages`).add({
        userId,
        role: 'assistant',
        text: "I'm having trouble connecting right now. Please try again in a moment, or reach out to a crisis line if you need immediate support.",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw error; // Trigger Function retry
    }
  }
);
