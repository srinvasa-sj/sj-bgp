import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

export async function generateImage(prompt: string) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    return {
      url: response.data[0].url,
      success: true
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      url: null,
      success: false,
      error: 'Failed to generate image'
    };
  }
} 