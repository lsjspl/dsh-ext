/**
 * In-browser rescue sentinel: injected into `index.html` via `webserver/index-inject`.
 *
 * Runs before any bundle or client plugin executes. Observes the DOM for DSH's
 * boot card (`[data-dsh-boot]`) entering the "Failed to load plugins" error state.
 * When triggered, injects an interactive emergency rescue card directly below the
 * error message, enabling one-click plugin quarantine, safe mode, and reload.
 */

export const RESCUE_SENTINEL_SCRIPT = `
(function() {
  if (window.__DSH_EXT_RESCUE_ACTIVE__) return;
  window.__DSH_EXT_RESCUE_ACTIVE__ = true;

  function injectStyles() {
    if (document.getElementById('dsh-ext-rescue-styles')) return;
    var style = document.createElement('style');
    style.id = 'dsh-ext-rescue-styles';
    style.textContent = [
      '#dsh-ext-rescue-card {',
      '  margin-top: 16px;',
      '  padding: 14px 16px;',
      '  border-radius: 10px;',
      '  background: rgba(24, 24, 27, 0.95);',
      '  border: 1px solid rgba(239, 68, 68, 0.5);',
      '  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);',
      '  color: #f4f4f5;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      '  font-size: 13px;',
      '  line-height: 1.5;',
      '  text-align: left;',
      '  animation: dshExtFadeIn 0.3s ease-out;',
      '}',
      '@keyframes dshExtFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }',
      '#dsh-ext-rescue-card h4 {',
      '  margin: 0 0 6px 0;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  color: #f87171;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '}',
      '#dsh-ext-rescue-card p { margin: 0 0 10px 0; color: #a1a1aa; font-size: 12px; }',
      '.dsh-ext-plugin-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 8px;',
      '  padding: 6px 8px;',
      '  background: rgba(39, 39, 42, 0.8);',
      '  border-radius: 6px;',
      '  margin-bottom: 6px;',
      '  border: 1px solid rgba(63, 63, 70, 0.6);',
      '}',
      '.dsh-ext-plugin-name {',
      '  font-family: ui-monospace, monospace;',
      '  font-size: 11px;',
      '  color: #fbbf24;',
      '  word-break: break-all;',
      '}',
      '.dsh-ext-btn {',
      '  appearance: none;',
      '  border: 1px solid transparent;',
      '  border-radius: 6px;',
      '  padding: 4px 10px;',
      '  font-size: 11px;',
      '  font-weight: 500;',
      '  cursor: pointer;',
      '  transition: all 0.15s ease;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '}',
      '.dsh-ext-btn-danger {',
      '  background: #dc2626;',
      '  color: #ffffff;',
      '  border-color: #ef4444;',
      '}',
      '.dsh-ext-btn-danger:hover { background: #b91c1c; }',
      '.dsh-ext-btn-secondary {',
      '  background: #27272a;',
      '  color: #e4e4e7;',
      '  border-color: #3f3f46;',
      '}',
      '.dsh-ext-btn-secondary:hover { background: #3f3f46; }',
      '.dsh-ext-btn:disabled { opacity: 0.5; cursor: not-allowed; }',
      '.dsh-ext-actions {',
      '  display: flex;',
      '  gap: 8px;',
      '  margin-top: 10px;',
      '  flex-wrap: wrap;',
      '}',
      '#dsh-ext-rescue-status {',
      '  margin-top: 8px;',
      '  font-size: 11px;',
      '  min-height: 16px;',
      '}'
    ].join('\\n');
    document.head.appendChild(style);
  }

  function quarantinePlugin(pluginName, btn) {
    btn.disabled = true;
    btn.textContent = '⏳ 正在隔离...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span style="color:#fbbf24">正在隔离 ' + pluginName + '...</span>';

    fetch('/api/dsh-ext/plugins/quarantine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pluginName, quarantined: true })
    })
    .then(function(res) {
      if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
      return res.json();
    })
    .then(function() {
      if (status) status.innerHTML = '<span style="color:#4ade80">✅ 已成功将 ' + pluginName + ' 加入隔离名单！正在重新加载 DSH...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '🛡️ 隔离此插件并重载';
      if (status) status.innerHTML = '<span style="color:#f87171">❌ 隔离失败: ' + (err.message || err) + '</span>';
    });
  }

  function enableSafeMode(btn) {
    btn.disabled = true;
    btn.textContent = '⏳ 正在开启安全模式...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span style="color:#fbbf24">正在隔离所有第三方插件...</span>';

    fetch('/api/dsh-ext/plugins/safe-mode', { method: 'POST' })
    .then(function(res) {
      if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
      return res.json();
    })
    .then(function() {
      if (status) status.innerHTML = '<span style="color:#4ade80">✅ 已启用安全模式！正在重新加载 DSH...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '🚨 启用安全模式 (禁用全部第三方插件)';
      if (status) status.innerHTML = '<span style="color:#f87171">❌ 开启失败: ' + (err.message || err) + '</span>';
    });
  }

  function clearQuarantine(btn) {
    btn.disabled = true;
    btn.textContent = '⏳ 正在清空...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span style="color:#fbbf24">正在清空隔离名单...</span>';

    fetch('/api/dsh-ext/plugins/quarantine/clear', { method: 'POST' })
    .then(function(res) {
      if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
      return res.json();
    })
    .then(function() {
      if (status) status.innerHTML = '<span style="color:#4ade80">✅ 已清空隔离名单！正在重新加载...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '🔄 清空隔离名单';
      if (status) status.innerHTML = '<span style="color:#f87171">❌ 清空失败: ' + (err.message || err) + '</span>';
    });
  }

  function inspectFailedPlugins(container) {
    var plugins = [];
    var elements = container.querySelectorAll('*');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var text = (el.textContent || '').trim();
      if (!text) continue;
      // If it looks like a package or row name and has no children
      if (el.children.length === 0 && text !== 'Failed to load plugins' && text !== 'HARNESS') {
        if (!plugins.includes(text)) {
          plugins.push(text);
        }
      }
    }
    return plugins;
  }

  function mountRescue(bootRoot) {
    if (document.getElementById('dsh-ext-rescue-card')) return;
    injectStyles();

    var card = bootRoot.querySelector('div') || bootRoot;
    var failedPlugins = inspectFailedPlugins(bootRoot);

    var rescueCard = document.createElement('div');
    rescueCard.id = 'dsh-ext-rescue-card';

    var header = document.createElement('h4');
    header.innerHTML = '🛠️ DSH-Ext 故障急救 (Rescue)';
    rescueCard.appendChild(header);

    var desc = document.createElement('p');
    desc.textContent = '检测到插件未能正常加载，导致 DSH 无法进入主界面。你可以一键将故障插件加入隔离名单，或开启安全模式：';
    rescueCard.appendChild(desc);

    if (failedPlugins.length > 0) {
      failedPlugins.forEach(function(pkg) {
        var row = document.createElement('div');
        row.className = 'dsh-ext-plugin-row';

        var nameSpan = document.createElement('span');
        nameSpan.className = 'dsh-ext-plugin-name';
        nameSpan.textContent = pkg;
        row.appendChild(nameSpan);

        var qBtn = document.createElement('button');
        qBtn.className = 'dsh-ext-btn dsh-ext-btn-danger';
        qBtn.textContent = '🛡️ 隔离此插件并重载';
        qBtn.onclick = function() { quarantinePlugin(pkg, qBtn); };
        row.appendChild(qBtn);

        rescueCard.appendChild(row);
      });
    }

    var actions = document.createElement('div');
    actions.className = 'dsh-ext-actions';

    var safeBtn = document.createElement('button');
    safeBtn.className = 'dsh-ext-btn dsh-ext-btn-secondary';
    safeBtn.textContent = '🚨 启用安全模式 (禁用全部第三方插件)';
    safeBtn.onclick = function() { enableSafeMode(safeBtn); };
    actions.appendChild(safeBtn);

    var clearBtn = document.createElement('button');
    clearBtn.className = 'dsh-ext-btn dsh-ext-btn-secondary';
    clearBtn.textContent = '🔄 清空隔离名单';
    clearBtn.onclick = function() { clearQuarantine(clearBtn); };
    actions.appendChild(clearBtn);

    var reloadBtn = document.createElement('button');
    reloadBtn.className = 'dsh-ext-btn dsh-ext-btn-secondary';
    reloadBtn.textContent = '🔁 刷新页面';
    reloadBtn.onclick = function() { window.location.reload(); };
    actions.appendChild(reloadBtn);

    rescueCard.appendChild(actions);

    var status = document.createElement('div');
    status.id = 'dsh-ext-rescue-status';
    rescueCard.appendChild(status);

    card.appendChild(rescueCard);
  }

  function checkBootFailure() {
    var boot = document.querySelector('[data-dsh-boot]');
    if (!boot) return;
    var text = boot.innerText || boot.textContent || '';
    if (text.indexOf('Failed to load plugins') !== -1) {
      mountRescue(boot);
      if (timer) clearInterval(timer);
    }
  }

  // Setup MutationObserver on document
  var observer = new MutationObserver(function() {
    checkBootFailure();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    checkBootFailure();
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, { childList: true, subtree: true });
      checkBootFailure();
    });
  }

  // Fallback periodic poll in case DOM mutation was missed during rapid render
  var pollCount = 0;
  var timer = setInterval(function() {
    checkBootFailure();
    pollCount++;
    if (pollCount > 60) clearInterval(timer); // stop polling after 30s
  }, 500);
})();
`.trim()
