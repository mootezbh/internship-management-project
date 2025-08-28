import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import { CVSchema } from '@/lib/validations/cv'

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
  apiVersion: process.env.AZURE_API_VERSION,
  baseURL: process.env.AZURE_API_ENDPOINT
})

// POST /api/parse-cv
export async function POST(request) {
  try {
  const { cvUrl } = await request.json()
  console.log('Received cvUrl:', cvUrl)
    if (!cvUrl) {
      return NextResponse.json({ error: 'CV URL required' }, { status: 400 })
    }

    // Call AI SDK with Azure provider to parse CV
    let aiResult;
    try {
      aiResult = await generateObject({
        model: azure(process.env.AZURE_DEPLOYMENT_NAME),
        prompt: `Parse the following CV PDF and return a JSON object matching this schema: ${CVSchema.toString()}`,
        files: [cvUrl],
        schema: CVSchema
      })
    } catch (err) {
      console.error('AI SDK error:', err);
      return NextResponse.json({ error: 'AI SDK error', details: err?.message || err }, { status: 500 })
    }
    console.log('AI SDK result:', aiResult);

    if (!aiResult.success) {
      return NextResponse.json({ error: aiResult.error || 'Failed to parse CV' }, { status: 500 })
    }

    // Validate with Zod
    const parsed = CVSchema.safeParse(aiResult.data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    return NextResponse.json({ cvParsed: parsed.data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
