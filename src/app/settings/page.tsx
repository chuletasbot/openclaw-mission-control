'use client'
import { useState, useEffect } from 'react'
import { getConfig, saveConfig, testConnection, checkServerConfig } from '@/lib/api'

export default function SettingsPage() {
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'idle'|'testing'|'ok'|'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [envConfig, setEnvConfig] = useState<{ configured: boolean; connected: boolean; source: string; message: string } | null>(null)

  useEffect(() => {
    const cfg = getConfig()
    setUrl(cfg.baseUrl)
    setToken(cfg.token)
    checkServerConfig().then(setEnvConfig)
  }, [])

  const handleSave = () => {
    saveConfig({ baseUrl: url, token })
    setStatus('idle')
    setStatusMsg('Saved ✓')
  }

  const handleTest = async () => {
    saveConfig({ baseUrl: url, token })
    setStatus('testing')
    setStatusMsg('Testing...')
    const result = await testConnection()
    if (result.ok) {
      setStatus('ok')
      setStatusMsg('Connected!')
    } else {
      setStatus('error')
      setStatusMsg(result.error || 'Connection failed')
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#8e8e93]">Configure your OpenClaw Gateway connection</p>
      </div>

      {envConfig?.configured && (
        <div className={`glass-card p-5 border ${envConfig.connected ? 'border-[#30d158]/30 bg-[#30d158]/5' : 'border-[#ff9f0a]/30 bg-[#ff9f0a]/5'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{envConfig.connected ? '🟢' : '🟡'}</span>
            <div>
              <p className="text-white font-medium">Configured via environment</p>
              <p className="text-[#8e8e93] text-sm">{envConfig.message}</p>
              <p className="text-[#8e8e93]/60 text-xs mt-1">
                Gateway URL and token are set via <code className="text-[#7c5cfc]/80">OPENCLAW_GATEWAY_URL</code> and <code className="text-[#7c5cfc]/80">OPENCLAW_GATEWAY_TOKEN</code> environment variables. Manual configuration below is not needed.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`glass-card p-6 space-y-6 ${envConfig?.configured && envConfig?.connected ? 'opacity-50' : ''}`}>
        {envConfig?.configured && envConfig?.connected && (
          <p className="text-[#8e8e93] text-sm italic">Manual override (not needed when environment is configured)</p>
        )}
        <div>
          <label className="block text-sm font-medium text-[#8e8e93] mb-2">Gateway URL</label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="http://lab.bl4klust.lan/api or leave empty for same domain"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#8e8e93]/50 focus:outline-none focus:border-[#7c5cfc]/50"
          />
          <p className="text-xs text-[#8e8e93]/60 mt-1">Leave empty to use same domain (recommended when proxied)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8e8e93] mb-2">Gateway Token</label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Your gateway auth token"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#8e8e93]/50 focus:outline-none focus:border-[#7c5cfc]/50"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#7c5cfc] hover:bg-[#6b4ce0] text-white rounded-xl font-medium transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleTest}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
          >
            Test Connection
          </button>
          {statusMsg && (
            <span className={`text-sm ${status === 'ok' ? 'text-[#30d158]' : status === 'error' ? 'text-[#ff453a]' : 'text-[#8e8e93]'}`}>
              {status === 'ok' && '✅'} {status === 'error' && '❌'} {statusMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
