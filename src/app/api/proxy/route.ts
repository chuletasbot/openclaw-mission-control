import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { tool, args } = await req.json()

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || req.headers.get('x-gateway-url') || ''
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || req.headers.get('x-gateway-token') || ''

  if (!gatewayUrl || !gatewayToken) {
    return NextResponse.json({ ok: false, error: 'Gateway not configured' }, { status: 500 })
  }

  const res = await fetch(`${gatewayUrl}/tools/invoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${gatewayToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tool, args }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
