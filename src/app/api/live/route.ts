import { client } from '@/sanity/lib/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await client.fetch(
      `*[_type == "chat"] | order(_createdAt desc) [0...100] {
        ...,
      }`,
      {},
      { next: { tags: ['chat'] } }
    )
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching live data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live data' },
      { status: 500 }
    )
  }
} 