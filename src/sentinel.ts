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
      '  padding: 16px 18px;',
      '  border-radius: 8px;',
      '  background: #141416;',
      '  border: 1px solid #2e2e33;',
      '  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);',
      '  color: #f4f4f5;',
      '  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      '  font-size: 13px;',
      '  line-height: 1.5;',
      '  text-align: left;',
      '  animation: dshExtFadeIn 0.2s ease-out;',
      '}',
      '@keyframes dshExtFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }',
      '.dsh-ext-header {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  margin-bottom: 6px;',
      '}',
      '.dsh-ext-title {',
      '  margin: 0;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  color: #ef4444;',
      '  letter-spacing: 0.2px;',
      '}',
      '.dsh-ext-badge {',
      '  font-size: 11px;',
      '  font-weight: 500;',
      '  padding: 2px 6px;',
      '  border-radius: 4px;',
      '  background: rgba(239, 68, 68, 0.12);',
      '  color: #f87171;',
      '  border: 1px solid rgba(239, 68, 68, 0.25);',
      '}',
      '#dsh-ext-rescue-card p { margin: 0 0 12px 0; color: #a1a1aa; font-size: 12px; }',
      '.dsh-ext-plugin-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '  padding: 8px 12px;',
      '  background: #1c1c20;',
      '  border-radius: 6px;',
      '  margin-bottom: 8px;',
      '  border: 1px solid #2a2a30;',
      '}',
      '.dsh-ext-plugin-name {',
      '  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;',
      '  font-size: 12px;',
      '  color: #f3f4f6;',
      '  font-weight: 500;',
      '  word-break: break-all;',
      '}',
      '.dsh-ext-btn {',
      '  appearance: none;',
      '  border: 1px solid transparent;',
      '  border-radius: 4px;',
      '  padding: 5px 12px;',
      '  font-size: 12px;',
      '  font-weight: 500;',
      '  cursor: pointer;',
      '  transition: all 0.15s ease;',
      '  white-space: nowrap;',
      '}',
      '.dsh-ext-btn-danger {',
      '  background: #b91c1c;',
      '  color: #ffffff;',
      '  border-color: #dc2626;',
      '}',
      '.dsh-ext-btn-danger:hover { background: #991b1b; }',
      '.dsh-ext-btn-secondary {',
      '  background: #222226;',
      '  color: #d4d4d8;',
      '  border-color: #35353c;',
      '}',
      '.dsh-ext-btn-secondary:hover { background: #2e2e34; color: #ffffff; }',
      '.dsh-ext-btn:disabled { opacity: 0.45; cursor: not-allowed; }',
      '.dsh-ext-actions {',
      '  display: flex;',
      '  gap: 8px;',
      '  margin-top: 12px;',
      '  flex-wrap: wrap;',
      '}',
      '.dsh-ext-error-detail {',
      '  margin-top: 8px;',
      '  padding: 6px 10px;',
      '  border-radius: 4px;',
      '  background: #09090b;',
      '  border: 1px solid #27272a;',
      '  color: #71717a;',
      '  font-family: ui-monospace, monospace;',
      '  font-size: 11px;',
      '  word-break: break-all;',
      '  max-height: 80px;',
      '  overflow-y: auto;',
      '}',
      '#dsh-ext-rescue-status {',
      '  margin-top: 10px;',
      '  font-size: 12px;',
      '  min-height: 16px;',
      '}'
    ].join('\\n');
    document.head.appendChild(style);
  }

  function quarantinePlugin(pluginName, btn) {
    btn.disabled = true;
    btn.textContent = '正在隔离...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span style="color:#60a5fa">[处理中] 正在将 ' + pluginName + ' 写入隔离名单...</span>';

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
      if (status) status.innerHTML = '<span style="color:#34d399">[已完成] 已成功隔离 ' + pluginName + '，正在重新加载 DSH...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '隔离此插件并重载';
      if (status) status.innerHTML = '<span style="color:#f87171">[失败] 隔离失败: ' + (err.message || err) + '</span>';
    });
  }

  function enableSafeMode(btn) {
    btn.disabled = true;
    btn.textContent = '正在开启安全模式...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span style="color:#60a5fa">[处理中] 正在隔离所有第三方插件...</span>';

    fetch('/api/dsh-ext/plugins/safe-mode', { method: 'POST' })
    .then(function(res) {
      if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
      return res.json();
    })
    .then(function() {
      if (status) status.innerHTML = '<span style="color:#34d399">[已完成] 已启用安全模式，正在重新加载 DSH...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '安全模式 (禁用全部第三方插件)';
      if (status) status.innerHTML = '<span style="color:#f87171">[失败] 开启失败: ' + (err.message || err) + '</span>';
    });
  }

  function clearQuarantine(btn) {
    btn.disabled = true;
    btn.textContent = '正在清空...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span style="color:#60a5fa">[处理中] 正在清空隔离名单...</span>';

    fetch('/api/dsh-ext/plugins/quarantine/clear', { method: 'POST' })
    .then(function(res) {
      if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
      return res.json();
    })
    .then(function() {
      if (status) status.innerHTML = '<span style="color:#34d399">[已完成] 已清空隔离名单，正在重新加载 DSH...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '清空隔离名单';
      if (status) status.innerHTML = '<span style="color:#f87171">[失败] 清空失败: ' + (err.message || err) + '</span>';
    });
  }

  function isStrictPackageName(str) {
    if (!str || typeof str !== 'string') return false;
    str = str.trim();
    if (str === 'HARNESS' || str === 'Failed to load plugins' || str === 'web boot') return false;
    // Strict package name pattern: optional scope, lowercase/numbers/dash/dot, NO spaces or punctuation
    return /^(@[a-zA-Z0-9_-]+\\/)?[a-zA-Z0-9_-]+$/.test(str);
  }

  function inspectFailedPlugins(container) {
    var plugins = [];
    var fullText = container.innerText || container.textContent || '';

    // 1. Check parenthesized package names in error text, e.g. "(dsh-plugin-grok2api-media-tool)"
    var parenMatches = fullText.match(/\\(([@a-zA-Z0-9_.-]+)\\)/g);
    if (parenMatches) {
      for (var p = 0; p < parenMatches.length; p++) {
        var raw = parenMatches[p].slice(1, -1).trim();
        if (isStrictPackageName(raw) && !plugins.includes(raw)) {
          plugins.push(raw);
        }
      }
    }

    // 2. Check line starts like "dsh-plugin-foo:"
    var lines = fullText.split(/[\\r\\n]+/);
    for (var j = 0; j < lines.length; j++) {
      var m = lines[j].trim().match(/^([@a-zA-Z0-9][a-zA-Z0-9._\\/-]+):/);
      if (m && m[1] && isStrictPackageName(m[1]) && !plugins.includes(m[1])) {
        plugins.push(m[1]);
      }
    }

    // 3. Check individual DOM child nodes that strictly equal a package name
    var elements = container.querySelectorAll('*');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var text = (el.textContent || '').trim();
      if (!text) continue;
      if (el.children.length === 0 && isStrictPackageName(text)) {
        if (!plugins.includes(text)) {
          plugins.push(text);
        }
      }
    }
    return plugins;
  }

  function extractErrorDetails(container) {
    var fullText = container.innerText || container.textContent || '';
    var lines = fullText.split(/[\\r\\n]+/);
    var details = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      if (line === 'HARNESS' || line === 'Failed to load plugins') continue;
      if (isStrictPackageName(line)) continue;
      details.push(line);
    }
    return details.join('; ');
  }

  function mountRescue(bootRoot) {
    if (document.getElementById('dsh-ext-rescue-card')) return;
    injectStyles();

    var card = bootRoot.querySelector('div') || bootRoot;
    var failedPlugins = inspectFailedPlugins(bootRoot);
    var errorDetail = extractErrorDetails(bootRoot);

    var rescueCard = document.createElement('div');
    rescueCard.id = 'dsh-ext-rescue-card';

    var header = document.createElement('div');
    header.className = 'dsh-ext-header';

    var title = document.createElement('h4');
    title.className = 'dsh-ext-title';
    title.textContent = 'DSH-Ext 故障急救';
    header.appendChild(title);

    var badge = document.createElement('span');
    badge.className = 'dsh-ext-badge';
    badge.textContent = '救援模式';
    header.appendChild(badge);

    rescueCard.appendChild(header);

    var desc = document.createElement('p');
    desc.textContent = '检测到插件未能正常加载，导致 DSH 无法进入主界面。你可以一键将故障插件加入隔离名单，或开启安全模式：';
    rescueCard.appendChild(desc);

    var failedContainer = document.createElement('div');
    failedContainer.id = 'dsh-ext-failed-list';
    rescueCard.appendChild(failedContainer);

    function renderFailedRows(list) {
      failedContainer.innerHTML = '';
      if (list.length === 0) return;
      list.forEach(function(pkg) {
        var row = document.createElement('div');
        row.className = 'dsh-ext-plugin-row';

        var nameSpan = document.createElement('span');
        nameSpan.className = 'dsh-ext-plugin-name';
        nameSpan.textContent = pkg;
        row.appendChild(nameSpan);

        var qBtn = document.createElement('button');
        qBtn.className = 'dsh-ext-btn dsh-ext-btn-danger';
        qBtn.textContent = '隔离此插件并重载';
        qBtn.onclick = function() { quarantinePlugin(pkg, qBtn); };
        row.appendChild(qBtn);

        failedContainer.appendChild(row);
      });
    }

    renderFailedRows(failedPlugins);

    if (errorDetail) {
      var detailEl = document.createElement('div');
      detailEl.className = 'dsh-ext-error-detail';
      detailEl.textContent = errorDetail;
      rescueCard.appendChild(detailEl);
    }

    fetch('/api/dsh-ext/plugins')
      .then(function(res) { return res.json(); })
      .then(function(view) {
        if (!view || !view.plugins) return;
        var fullText = bootRoot.innerText || bootRoot.textContent || '';
        var thirdParty = view.plugins.filter(function(p) { return !p.builtin && p.name !== 'dsh-ext'; });
        var foundAny = false;
        thirdParty.forEach(function(p) {
          if (fullText.indexOf(p.name) !== -1 || (p.rows && p.rows.some(function(r) { return fullText.indexOf(r) !== -1; }))) {
            if (!failedPlugins.includes(p.name)) {
              failedPlugins.push(p.name);
              foundAny = true;
            }
          }
        });
        if (failedPlugins.length === 0 && thirdParty.length > 0) {
          thirdParty.forEach(function(p) {
            if (!failedPlugins.includes(p.name)) failedPlugins.push(p.name);
          });
          foundAny = true;
        }
        if (foundAny) renderFailedRows(failedPlugins);
      })
      .catch(function() {});

    var actions = document.createElement('div');
    actions.className = 'dsh-ext-actions';

    var safeBtn = document.createElement('button');
    safeBtn.className = 'dsh-ext-btn dsh-ext-btn-secondary';
    safeBtn.textContent = '安全模式 (禁用全部第三方插件)';
    safeBtn.onclick = function() { enableSafeMode(safeBtn); };
    actions.appendChild(safeBtn);

    var clearBtn = document.createElement('button');
    clearBtn.className = 'dsh-ext-btn dsh-ext-btn-secondary';
    clearBtn.textContent = '清空隔离名单';
    clearBtn.onclick = function() { clearQuarantine(clearBtn); };
    actions.appendChild(clearBtn);

    var reloadBtn = document.createElement('button');
    reloadBtn.className = 'dsh-ext-btn dsh-ext-btn-secondary';
    reloadBtn.textContent = '刷新页面';
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

  var pollCount = 0;
  var timer = setInterval(function() {
    checkBootFailure();
    pollCount++;
    if (pollCount > 60) clearInterval(timer);
  }, 500);
})();
`.trim()
