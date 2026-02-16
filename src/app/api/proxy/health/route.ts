import { NextResponse } from 'next/server'

export async function GET() {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || ''
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || ''
  const configured = !!(gatewayUrl && gatewayToken)

  if (!configured) {
    return NextResponse.json({
      configured: false,
      source: 'none',
      message: 'Gateway not configured via environment variables',
    })
  }

  // Test the connection
  try {
    const res = await fetch(`${gatewayUrl}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gatewayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tool: 'session_status', args: {} }),
      signal: AbortSignal.timeout(5000),
    })

    if (res.ok) {
      return NextResponse.json({
        configured: true,
        source: 'environment',
        connected: true,
        message: 'Connected via environment variables',
      })
    }

    return NextResponse.json({
      configured: true,
      source: 'environment',
      connected: false,
      message: `Gateway returned ${res.status}`,
    })
  } catch (e) {
    return NextResponse.json({
      configured: true,
      source: 'environment',
      connected: false,
      message: `Connection failed: ${(e as Error).message}`,
    })
  }
}
