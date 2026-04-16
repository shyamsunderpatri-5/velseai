import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export type HeadshotStyle = "corporate" | "tech" | "modern" | "academic" | "creative";

export const HEADSHOT_STYLES: Record<HeadshotStyle, { prompt: string; negative_prompt: string }> = {
  corporate: {
    prompt: "Highly professional corporate headshot of person img, wearing a sleek business suit, studio lighting, neutral grey background, 8k resolution, sharp focus, masterpiece, confident expression.",
    negative_prompt: "casual clothes, t-shirt, messy hair, distracted, blurry, low quality, distorted face, sunglasses, hat.",
  },
  tech: {
    prompt: "Modern tech founder headshot of person img, wearing a clean minimalist sweater, startup office background with soft bokeh, natural lighting, 8k resolution, realistic skin texture, friendly and approachable.",
    negative_prompt: "suit, tie, formal, dark, moody, aggressive, grainy, deformed, drawing, cartoon.",
  },
  modern: {
    prompt: "A contemporary professional portrait of person img, cinematic lighting, soft background, wearing stylish work-appropriate attire, high fashion photography style, detailed eyes, realistic.",
    negative_prompt: "old fashioned, bad lighting, shadows, overexposed, low res, watermark, text.",
  },
  academic: {
    prompt: "Formal academic portrait of person img, library background with blurred books, intellectual look, professional blazer, soft studio light, elegant, high quality.",
    negative_prompt: "party, outdoor, bright sun, beach, logo, glasses reflection.",
  },
  creative: {
    prompt: "Artistic professional headshot of person img, vibrant accent lighting, creative studio environment, expressive but professional, unique color palette, high fidelity.",
    negative_prompt: "dull, boring, standard, messy, out of focus, duplicate.",
  },
};

export async function createHeadshotPrediction(imageUrl: string, style: HeadshotStyle) {
  const { prompt, negative_prompt } = HEADSHOT_STYLES[style];

  const prediction = await replicate.predictions.create({
    version: "ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4", // PhotoMaker
    input: {
      input_image: imageUrl,
      prompt: prompt,
      negative_prompt: negative_prompt,
      num_steps: 50,
      style_name: "Photographic (Default)",
      guidance_scale: 5,
      style_strength_ratio: 20,
    },
  });

  return prediction;
}

export async function getPredictionStatus(predictionId: string) {
  return await replicate.predictions.get(predictionId);
}
