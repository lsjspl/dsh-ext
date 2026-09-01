import { useCommand, useResource } from './use-resource.ts'
import { Notice, buttonStyle, inputStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import type { SafetyView } from '../shared/api-contract.ts'

/**
 * Feature 7's in-app half — the plugin inventory and quarantine list.
 *
 * The panel is explicit that this half only helps while the harness is running,
 * and prints the command for the case it cannot help with, because a user
 * reading this page after a failed boot is reading it on a screen they could
 * not reach. Those instructions are the actual deliverable of this panel.
 */
export function PluginsPanel(props: { enabled: boolean }) {
  const t = useT()
  const view = useResource<SafetyView>('/plugins', props.enabled)
  const command = useCommand(view.reload)

  if (!props.enabled) {
    return <div style={{ fontSize: 12, color: token.textMuted }}>{t('plugins.off')}</div>
  }

  const plugins = view.data?.plugins ?? []
  const third = plugins.filter(row => !row.builtin)
  const quarantined = view.data?.quarantine ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {view.error !== undefined && <Notice kind="error">{view.error}</Notice>}
      {command.error !== undefined && <Notice kind="error">{command.error}</Notice>}

      {quarantined.length > 0 && (
        <Notice kind="info">
          {t('plugins.quarantinedCount', { n: quarantined.length })}
        </Notice>
      )}

      {third.length === 0 && view.data !== undefined && (
        <div style={{ fontSize: 12, color: token.textMuted }}>
          {t('plugins.none')}
        </div>
      )}

      {third.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {third.map(row => (
            <li
              key={row.name}
              style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 2px', borderBottom: `1px solid ${token.border}` }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.name}
                </span>
                {row.version !== undefined && (
                  <span style={{ fontSize: 10, color: token.textMuted }}>{row.version}</span>
                )}
              </span>
              {row.quarantined && (
                <span style={{ fontSize: 10, color: token.danger }}>{t('plugins.quarantined')}</span>
              )}
              <button
                type="button"
                disabled={command.busy}
                onClick={() => { void command.run('/plugins/quarantine', { row: row.name, quarantined: !row.quarantined }) }}
                style={{
                  ...buttonStyle,
                  fontSize: 11,
                  borderColor: row.quarantined ? token.border : token.danger,
                  color: row.quarantined ? token.text : token.danger,
                }}
              >{row.quarantined ? t('plugins.enable') : t('plugins.disable')}</button>
            </li>
          ))}
        </ul>
      )}

      {quarantined.length > 0 && (
        <button
          type="button"
          disabled={command.busy}
          onClick={() => { void command.run('/plugins/quarantine/clear') }}
          style={{ ...buttonStyle, alignSelf: 'flex-start', fontSize: 11 }}
        >{t('plugins.enableAll')}</button>
      )}

      <div style={{ border: `1px solid ${token.border}`, borderRadius: 6, padding: 10 }}>
        <strong style={{ fontSize: 12 }}>{t('plugins.rescueTitle')}</strong>
        <p style={{ fontSize: 12, color: token.textMuted, margin: '6px 0' }}>
          {t('plugins.rescueBody')}
        </p>
        <pre style={{
          ...inputStyle,
          margin: 0,
          padding: 8,
          fontSize: 11,
          lineHeight: 1.6,
          fontFamily: 'ui-monospace, monospace',
          whiteSpace: 'pre-wrap',
        }}>{`npx dsh-plugin-dev-tool-ext dsh-ext safe      # start without any third-party plugin
npx dsh-plugin-dev-tool-ext dsh-ext skip <name>   # skip one plugin
npx dsh-plugin-dev-tool-ext dsh-ext uninstall <name>
npx dsh-plugin-dev-tool-ext dsh-ext restore       # re-enable everything`}</pre>
        <p style={{ fontSize: 11, color: token.textMuted, margin: '6px 0 0' }}>
          {t('plugins.rescueFile', { file: view.data?.quarantineFile ?? '$DSH_HOME/cordis.patch.yml' })}
        </p>
      </div>
    </div>
  )
}
