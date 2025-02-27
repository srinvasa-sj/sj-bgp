import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
  console.error('OpenAI API key is not configured properly in .env file');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const openaiService = {
  async generateImage(prompt: string) {
    try {
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        throw new Error('OpenAI API key is not configured');
      }

      const response = await openai.images.generate({
        model: "dall-e-2", // Using DALL-E 2 as it's more cost-effective
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      if (!response.data?.[0]?.url) {
        throw new Error('No image URL received from OpenAI');
      }

      return {
        url: response.data[0].url,
        success: true
      };
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw new Error(error?.message || 'Failed to generate image');
    }
  },

  async generateMessage(prompt: string) {
    try {
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        throw new Error('OpenAI API key is not configured');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using GPT-3.5 Turbo as it's more cost-effective
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

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('No message content received from OpenAI');
      }

      return {
        content: response.choices[0].message.content,
        success: true
      };
    } catch (error: any) {
      console.error('Error generating message:', error);
      throw new Error(error?.message || 'Failed to generate message');
    }
  }
}; 