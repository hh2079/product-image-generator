const ANGLE_PROMPTS: Record<string, string> = {
  front: `Professional e-commerce product photo of {name}, front view, straight-on angle, studio lighting, pure white background (#FFFFFF), high detail, commercial photography quality, symmetrical composition, sharp focus`,
  side: `Professional e-commerce product photo of {name}, side profile view, 90-degree angle showing depth and thickness, studio lighting with soft fill light, pure white background, high detail, commercial photography quality, clean silhouette`,
  back: `Professional e-commerce product photo of {name}, back view, rear angle, studio lighting, pure white background, high detail, commercial photography quality, showing back panel design and details`,
  top: `Professional e-commerce product photo of {name}, top-down flat lay view, bird's eye angle, studio lighting from above, pure white background, showing full product layout, high detail, commercial photography quality`,
  detail: `Professional e-commerce product photo of {name}, macro detail close-up shot, extreme close-up showing texture and material quality, studio lighting with accent highlights, pure white background, ultra high detail, commercial photography quality`,
};

export function buildImagePrompt(productDesc: string, angle: string): string {
  const template = ANGLE_PROMPTS[angle] ?? ANGLE_PROMPTS.front;
  return template.replace('{name}', productDesc || 'product');
}

export function buildVideoPrompt(productDesc: string, transitions?: string[]): string {
  let prompt = `Smooth cinematic product showcase video of ${productDesc}. `;

  if (transitions && transitions.length > 0) {
    transitions.forEach((t) => {
      prompt += `[${t}] `;
    });
  } else {
    prompt += 'Camera slowly orbiting around the product in a 360-degree arc. ';
  }

  prompt += 'Studio lighting with soft key light, pure white background, professional commercial video quality, maintaining consistent product appearance throughout.';
  return prompt;
}
