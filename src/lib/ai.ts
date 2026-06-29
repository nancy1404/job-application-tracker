import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function generateAiInsight(input: {
  title: string;
  description: string;
  resumeContent: string;
  companyName?: string;
}) {
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const companySection = input.companyName ? `\nCompany: ${input.companyName}` : '';

  const completion = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: `Compare the job title and description to the resume content. Return a concise JSON object with matchScore (0-100), summary, strengths, gaps, and suggestions.\n\nJob Title: ${input.title}${companySection}\nJob Description: ${input.description}\n\nResume Content: ${input.resumeContent}`,
  });

  return completion.output_text;
}
