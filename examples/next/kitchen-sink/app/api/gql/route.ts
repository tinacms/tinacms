import { NextResponse } from 'next/server'
import { databaseRequest } from '../../../lib/databaseConntection'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, variables } = body ?? {}
    const result = await databaseRequest({ query, variables })
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

