import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

export async function generateMessage(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional marketing copywriter specializing in creating engaging WhatsApp messages for a luxury jewelry store. Your messages should be concise, compelling, and include appropriate emojis. Format important information in bold using WhatsApp's *text* syntax."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return {
      content: response.choices[0].message.content,
      success: true
    };
  } catch (error) {
    console.error('Error generating message:', error);
    return {
      content: null,
      success: false,
      error: 'Failed to generate message'
    };
  }
} 