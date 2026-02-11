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

export default async function handler(req, res) {
  try {
    const { query, variables } = req.body ?? {}
    const result = await databaseRequest({ query, variables })
    return res.json(result)
  } catch (err: any) {
    return res.status(500).json({ error: String(err) })
  }
}
