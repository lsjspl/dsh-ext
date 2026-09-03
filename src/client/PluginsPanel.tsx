import { useState } from 'react'
import { useCommand, useResource } from './use-resource.ts'
import { Notice, buttonStyle, dangerButtonStyle, primaryButtonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import type { SafetyView } from '../shared/api-contract.ts'

function CopyButton(props: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(props.text)
        setCopied(true)
        setTimeout(() => { setCopied(false) }, 1500)
      }}
      title="点击复制命令"
      style={{
        ...buttonStyle,
        padding: '3px 8px',
        fontSize: 11,
        borderRadius: 5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        cursor: 'pointer',
        background: copied
          ? 'var(--dsw-alias-state-business-primary, #2563eb)'
          : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
        color: copied ? '#ffffff' : token.text,
        borderColor: copied ? 'var(--dsw-alias-state-business-primary, #2563eb)' : token.border,
        transition: 'all 140ms ease',
        flexShrink: 0,
      }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8.5l3.5 3.5 6.5-7" />
          </svg>
          <span>已复制</span>
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
            <path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" />
          </svg>
          <span>{props.label ?? '复制'}</span>
        </>
      )}
    </button>
  )
}

/**
 * Feature 7's in-app half — the plugin inventory and quarantine list.
 */
export function PluginsPanel(props: { enabled: boolean }) {
  const t = useT()
  const view = useResource<SafetyView>('/plugins', props.enabled)
  const command = useCommand(view.reload)

  if (!props.enabled) {
    return (
      <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12.5, color: token.textMuted }}>
        {t('plugins.off')}
      </div>
    )
  }

  const plugins = view.data?.plugins ?? []
  const third = plugins.filter(row => !row.builtin)
  const quarantined = view.data?.quarantine ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {view.error !== undefined && <Notice kind="error">{view.error}</Notice>}
      {command.error !== undefined && <Notice kind="error">{command.error}</Notice>}

      {quarantined.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(234, 88, 12, 0.08)',
            border: '1px solid rgba(234, 88, 12, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--dsw-alias-state-warning, #ea580c)' }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 1.5l6.5 12H1.5L8 1.5z" />
              <path d="M8 6v3.5" />
              <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
            </svg>
            <span>{t('plugins.quarantinedCount', { n: quarantined.length })}</span>
          </div>
          <button
            type="button"
            disabled={command.busy}
            onClick={() => { void command.run('/plugins/quarantine/clear') }}
            style={{
              ...buttonStyle,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 6,
              background: 'var(--dsw-alias-state-business-primary, #2563eb)',
              color: '#ffffff',
              borderColor: 'var(--dsw-alias-state-business-primary, #2563eb)',
              cursor: 'pointer',
            }}
          >
            {t('plugins.enableAll')}
          </button>
        </div>
      )}

      {third.length === 0 && view.data !== undefined && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 16px',
            borderRadius: 8,
            border: `1px dashed ${token.border}`,
            background: 'var(--dsw-alias-bg-module-platform, rgba(125, 125, 125, 0.04))',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              color: token.textMuted,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
              <path d="M8 2.5v11" />
              <path d="M2.5 8h11" />
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: token.text, marginBottom: 4 }}>
            未检测到第三方插件
          </div>
          <div style={{ fontSize: 12, color: token.textMuted, maxWidth: 360, lineHeight: 1.5 }}>
            当前环境仅运行官方内置核心组件，运行状态良好。当安装第三方插件后，可在此处进行独立隔离与异常管理。
          </div>
        </div>
      )}

      {third.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {third.map(row => (
            <div
              key={row.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.06)))',
                border: `1px solid ${row.quarantined ? 'rgba(239, 68, 68, 0.35)' : token.border}`,
                transition: 'all 140ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: row.quarantined ? 'rgba(239, 68, 68, 0.12)' : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '0 0 auto',
                    color: row.quarantined ? 'var(--dsw-alias-state-danger, #ef4444)' : 'var(--dsw-alias-state-business-primary, #2563eb)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2.5 5.5l5.5-3 5.5 3v5l-5.5 3-5.5-3v-5z" />
                    <path d="M8 2.5v11" />
                    <path d="M2.5 5.5l5.5 3 5.5-3" />
                  </svg>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: token.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.name}
                    </span>
                    {row.version !== undefined && (
                      <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))', color: token.textMuted }}>
                        v{row.version}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: row.quarantined ? 'var(--dsw-alias-state-danger, #ef4444)' : 'var(--dsw-alias-state-success, #22c55e)',
                      }}
                    />
                    <span style={{ fontSize: 11.5, color: row.quarantined ? 'var(--dsw-alias-state-danger, #ef4444)' : token.textMuted }}>
                      {row.quarantined ? '已隔离（下次启动跳过）' : '正常运行'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={command.busy}
                onClick={() => { void command.run('/plugins/quarantine', { name: row.name, row: row.name, quarantined: !row.quarantined }) }}
                style={row.quarantined ? primaryButtonStyle : dangerButtonStyle}
              >
                {row.quarantined ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.5 6.5A5.5 5.5 0 1 1 4 11.5" />
                      <path d="M2.5 3v3.5H6" />
                    </svg>
                    <span>解除隔离</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.5 4.5h11" />
                      <path d="M5.5 4.5V2.5h5v2" />
                      <path d="M4 4.5l.8 9.2a1 1 0 0 0 1 .8h4.4a1 1 0 0 0 1-.8L12 4.5" />
                    </svg>
                    <span>隔离此插件</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RescueBox(props: { quarantineFile?: string }) {
  const [copied, setCopied] = useState(false)
  const cmdText = `npx dsh-ext safe        # 启用安全模式（跳过全部第三方插件）
npx dsh-ext restore     # 解除所有隔离
npx dsh-ext skip <name> # 隔离指定故障插件`

  const handleCopy = () => {
    void navigator.clipboard.writeText(cmdText)
    setCopied(true)
    setTimeout(() => { setCopied(false) }, 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0 6px' }}>
      <div style={{ fontSize: 12.5, color: token.textMuted, lineHeight: 1.6 }}>
        若后台 Node 进程在启动初期直接崩溃退出，可在终端中执行独立脱困命令（零外部依赖）：
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: 8,
          background: 'var(--dsw-alias-bg-base, #101014)',
          border: `1px solid ${token.border}`,
          padding: '12px 14px',
        }}
      >
        <button
          type="button"
          onClick={handleCopy}
          title="复制全部脱困命令"
          style={{
            ...buttonStyle,
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '3px 9px',
            fontSize: 11,
            borderRadius: 5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            background: copied
              ? 'var(--dsw-alias-state-business-primary, #2563eb)'
              : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
            color: copied ? '#ffffff' : token.text,
            borderColor: copied ? 'var(--dsw-alias-state-business-primary, #2563eb)' : token.border,
            transition: 'all 120ms ease',
          }}
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8.5l3.5 3.5 6.5-7" />
              </svg>
              <span>已复制</span>
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
                <path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" />
              </svg>
              <span>复制命令</span>
            </>
          )}
        </button>

        <pre
          style={{
            margin: 0,
            fontSize: 12,
            fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
            lineHeight: 1.8,
            color: token.text,
            whiteSpace: 'pre-wrap',
          }}
        >
          <span style={{ color: 'var(--dsw-alias-state-business-primary, #38bdf8)' }}>npx dsh-ext safe</span>
          <span style={{ color: token.textMuted }}>        # 启用安全模式（跳过全部第三方插件）</span>
          {'\n'}
          <span style={{ color: 'var(--dsw-alias-state-business-primary, #38bdf8)' }}>npx dsh-ext restore</span>
          <span style={{ color: token.textMuted }}>     # 解除所有隔离</span>
          {'\n'}
          <span style={{ color: 'var(--dsw-alias-state-business-primary, #38bdf8)' }}>npx dsh-ext skip &lt;name&gt;</span>
          <span style={{ color: token.textMuted }}> # 隔离指定故障插件</span>
        </pre>
      </div>

      <div style={{ fontSize: 11.5, color: token.textMuted, lineHeight: 1.5 }}>
        隔离配置将持久化写入 <code style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))', color: token.text }}>{props.quarantineFile ?? '$DSH_HOME/cordis.patch.yml'}</code>，享有最高优先级覆盖权，重启即生效。
      </div>
    </div>
  )
}
