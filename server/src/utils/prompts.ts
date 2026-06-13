const ANGLE_PROMPTS: Record<string, string> = {
  front: `Professional e-commerce product photo of {name}, front view, straight-on angle, studio lighting, pure white background (#FFFFFF), high detail, commercial photography quality, symmetrical composition, sharp focus`,
  side: `Professional e-commerce product photo of {name}, side profile view, 90-degree angle showing depth and thickness, studio lighting with soft fill light, pure white background, high detail, commercial photography quality, clean silhouette`,
  back: `Professional e-commerce product photo of {name}, back view, rear angle, studio lighting, pure white background, high detail, commercial photography quality, showing back panel design and ports`,
  top: `Professional e-commerce product photo of {name}, top-down flat lay view, bird's eye angle, studio lighting from above, pure white background, showing full product layout, high detail, commercial photography quality`,
  detail: `Professional e-commerce product photo of {name}, macro detail close-up shot, extreme close-up showing texture and material quality, studio lighting with accent highlights, pure white background, ultra high detail, commercial photography quality`,
};

export function buildImagePrompt(productName: string, angle: string): string {
  const template = ANGLE_PROMPTS[angle] ?? ANGLE_PROMPTS.front;
  return template.replace('{name}', productName);
}

export function buildVideoPrompt(productName: string): string {
  return `Smooth cinematic product showcase video of ${productName}, camera slowly orbiting around the product in a 360-degree arc, studio lighting with soft key light and subtle rim light, pure white background, professional commercial video quality, maintaining consistent product appearance, color accuracy, and shape throughout the entire sequence`;
}
