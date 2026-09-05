/**
 * In-browser rescue sentinel: injected into `index.html` via `webserver/index-inject`.
 *
 * Runs before any bundle or client plugin executes. Observes the DOM for DSH's
 * boot card (`[data-dsh-boot]`) entering the "Failed to load plugins" error state.
 * When triggered, injects an interactive emergency rescue card directly below the
 * error message, enabling one-click plugin quarantine, safe mode, and reload.
 * The card reads the host page's own background to pick the light or dark
 * palette, so it follows the page theme instead of forcing DSH's dark colors.
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
      '  --dsh-ext-bg: #141416;',
      '  --dsh-ext-border: #2e2e33;',
      '  --dsh-ext-fg: #f4f4f5;',
      '  --dsh-ext-muted: #a1a1aa;',
      '  --dsh-ext-surface: #1c1c20;',
      '  --dsh-ext-surface-border: #2a2a30;',
      '  --dsh-ext-code-bg: #09090b;',
      '  --dsh-ext-code-border: #27272a;',
      '  --dsh-ext-code-fg: #71717a;',
      '  --dsh-ext-cli-fg: #e4e4e7;',
      '  --dsh-ext-title: #ef4444;',
      '  --dsh-ext-badge-bg: rgba(239, 68, 68, 0.12);',
      '  --dsh-ext-badge-fg: #f87171;',
      '  --dsh-ext-badge-border: rgba(239, 68, 68, 0.25);',
      '  --dsh-ext-danger-bg: #b91c1c;',
      '  --dsh-ext-danger-border: #dc2626;',
      '  --dsh-ext-danger-hover: #991b1b;',
      '  --dsh-ext-btn-bg: #222226;',
      '  --dsh-ext-btn-fg: #d4d4d8;',
      '  --dsh-ext-btn-border: #35353c;',
      '  --dsh-ext-btn-hover-bg: #2e2e34;',
      '  --dsh-ext-btn-hover-fg: #ffffff;',
      '  --dsh-ext-ok: #34d399;',
      '  --dsh-ext-busy: #60a5fa;',
      '  --dsh-ext-err: #f87171;',
      '  --dsh-ext-divider: #2e2e33;',
      '  --dsh-ext-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);',
      '  box-sizing: border-box;',
      '  width: min(640px, calc(100vw - 48px));',
      '  max-width: 100%;',
      '  min-width: 0;',
      '  margin-top: 16px;',
      '  padding: 16px 18px;',
      '  border-radius: 8px;',
      '  background: var(--dsh-ext-bg);',
      '  border: 1px solid var(--dsh-ext-border);',
      '  box-shadow: var(--dsh-ext-shadow);',
      '  color: var(--dsh-ext-fg);',
      '  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      '  font-size: 13px;',
      '  line-height: 1.5;',
      '  text-align: left;',
      '  animation: dshExtFadeIn 0.2s ease-out;',
      '}',
      '#dsh-ext-rescue-card.dsh-ext-theme-light {',
      '  --dsh-ext-bg: #ffffff;',
      '  --dsh-ext-border: #e4e4e7;',
      '  --dsh-ext-fg: #18181b;',
      '  --dsh-ext-muted: #52525b;',
      '  --dsh-ext-surface: #f4f4f5;',
      '  --dsh-ext-surface-border: #e4e4e7;',
      '  --dsh-ext-code-bg: #fafafa;',
      '  --dsh-ext-code-border: #e4e4e7;',
      '  --dsh-ext-code-fg: #71717a;',
      '  --dsh-ext-cli-fg: #18181b;',
      '  --dsh-ext-title: #dc2626;',
      '  --dsh-ext-badge-bg: rgba(220, 38, 38, 0.08);',
      '  --dsh-ext-badge-fg: #b91c1c;',
      '  --dsh-ext-badge-border: rgba(220, 38, 38, 0.2);',
      '  --dsh-ext-danger-bg: #dc2626;',
      '  --dsh-ext-danger-border: #dc2626;',
      '  --dsh-ext-danger-hover: #b91c1c;',
      '  --dsh-ext-btn-bg: #f4f4f5;',
      '  --dsh-ext-btn-fg: #27272a;',
      '  --dsh-ext-btn-border: #d4d4d8;',
      '  --dsh-ext-btn-hover-bg: #e4e4e7;',
      '  --dsh-ext-btn-hover-fg: #18181b;',
      '  --dsh-ext-ok: #059669;',
      '  --dsh-ext-busy: #2563eb;',
      '  --dsh-ext-err: #dc2626;',
      '  --dsh-ext-divider: #e4e4e7;',
      '  --dsh-ext-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);',
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
      '  color: var(--dsh-ext-title);',
      '  letter-spacing: 0.2px;',
      '}',
      '.dsh-ext-badge {',
      '  font-size: 11px;',
      '  font-weight: 500;',
      '  padding: 2px 6px;',
      '  border-radius: 4px;',
      '  background: var(--dsh-ext-badge-bg);',
      '  color: var(--dsh-ext-badge-fg);',
      '  border: 1px solid var(--dsh-ext-badge-border);',
      '}',
      '#dsh-ext-rescue-card p { margin: 0 0 12px 0; color: var(--dsh-ext-muted); font-size: 12px; }',
      '.dsh-ext-plugin-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '  padding: 8px 12px;',
      '  background: var(--dsh-ext-surface);',
      '  border-radius: 6px;',
      '  margin-bottom: 8px;',
      '  border: 1px solid var(--dsh-ext-surface-border);',
      '}',
      '.dsh-ext-plugin-name {',
      '  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;',
      '  font-size: 12px;',
      '  color: var(--dsh-ext-fg);',
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
      '  background: var(--dsh-ext-danger-bg);',
      '  color: #ffffff;',
      '  border-color: var(--dsh-ext-danger-border);',
      '}',
      '.dsh-ext-btn-danger:hover { background: var(--dsh-ext-danger-hover); }',
      '.dsh-ext-btn-secondary {',
      '  background: var(--dsh-ext-btn-bg);',
      '  color: var(--dsh-ext-btn-fg);',
      '  border-color: var(--dsh-ext-btn-border);',
      '}',
      '.dsh-ext-btn-secondary:hover { background: var(--dsh-ext-btn-hover-bg); color: var(--dsh-ext-btn-hover-fg); }',
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
      '  background: var(--dsh-ext-code-bg);',
      '  border: 1px solid var(--dsh-ext-code-border);',
      '  color: var(--dsh-ext-code-fg);',
      '  font-family: ui-monospace, monospace;',
      '  font-size: 11px;',
      '  word-break: break-all;',
      '  max-height: 80px;',
      '  overflow-y: auto;',
      '}',
      '.dsh-ext-status-processing { color: var(--dsh-ext-busy); }',
      '.dsh-ext-status-ok { color: var(--dsh-ext-ok); }',
      '.dsh-ext-status-error { color: var(--dsh-ext-err); }',
      '#dsh-ext-rescue-status {',
      '  margin-top: 10px;',
      '  font-size: 12px;',
      '  min-height: 16px;',
      '}',
      '.dsh-ext-cli { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--dsh-ext-divider); min-width: 0; }',
      '.dsh-ext-cli h5 { margin: 0 0 6px; font-size: 13px; font-weight: 600; color: var(--dsh-ext-fg); }',
      '.dsh-ext-cli-row { display: grid; grid-template-columns: minmax(0, 1fr) 56px; gap: 2px 8px; align-items: center; padding: 6px 0; }',
      '.dsh-ext-cli-label { grid-column: 1; font-size: 11px; color: var(--dsh-ext-muted); overflow-wrap: anywhere; }',
      '.dsh-ext-cli-code { grid-column: 1; display: block; margin: 0; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; color: var(--dsh-ext-cli-fg); user-select: text; }',
      '.dsh-ext-cli-row .dsh-ext-btn { box-sizing: border-box; grid-column: 2; grid-row: 1 / span 2; width: 56px; padding: 5px 4px; font-size: 11px; }',
      '#dsh-ext-rescue-card .dsh-ext-cli-note { margin: 10px 0 0; overflow-wrap: anywhere; }',
      '@media (max-width: 600px) { #dsh-ext-rescue-card { padding: 12px; } .dsh-ext-actions .dsh-ext-btn { max-width: 100%; white-space: normal; } }'
    ].join('\\n');
    document.head.appendChild(style);
  }

  function parseColorValue(bg) {
    if (!bg || typeof bg !== 'string') return null;
    var m = bg.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    var parts = m[1].trim().split(/[\\s,\\/]+/).map(function(part) { return parseFloat(part); });
    if (parts.length < 3 || parts.slice(0, 3).some(function(v) { return isNaN(v); })) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  function surfaceColor(startEl) {
    var node = startEl;
    while (node && node !== document.documentElement) {
      var bg = null;
      try { bg = window.getComputedStyle ? window.getComputedStyle(node).backgroundColor : null; } catch (_) {}
      var color = parseColorValue(bg);
      if (color && color.a > 0.5) return color;
      node = node.parentElement;
    }
    return null;
  }

  function systemPrefersDark() {
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (_) { return true; }
  }

  function isLightSurface() {
    var root = null;
    try { root = document.querySelector('[data-dsh-boot]'); } catch (_) {}
    if (!root) root = document.body;
    var color = root ? surfaceColor(root) : null;
    if (!color) return !systemPrefersDark();
    var luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    return luminance >= 140;
  }

  function quarantinePlugin(pluginName, btn) {
    btn.disabled = true;
    btn.textContent = '正在隔离...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span class="dsh-ext-status-processing">[处理中] 正在将 ' + pluginName + ' 写入隔离名单...</span>';

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
      if (status) status.innerHTML = '<span class="dsh-ext-status-ok">[已完成] 已成功隔离 ' + pluginName + '，正在重新加载 DSH...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '隔离此插件并重载';
      if (status) status.innerHTML = '<span class="dsh-ext-status-error">[失败] 隔离失败: ' + (err.message || err) + '</span>';
    });
  }

  function enableSafeMode(btn) {
    btn.disabled = true;
    btn.textContent = '正在开启安全模式...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span class="dsh-ext-status-processing">[处理中] 正在隔离所有第三方插件...</span>';

    fetch('/api/dsh-ext/plugins/safe-mode', { method: 'POST' })
    .then(function(res) {
      if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
      return res.json();
    })
    .then(function() {
      if (status) status.innerHTML = '<span class="dsh-ext-status-ok">[已完成] 已启用安全模式，正在重新加载 DSH...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '安全模式 (禁用全部第三方插件)';
      if (status) status.innerHTML = '<span class="dsh-ext-status-error">[失败] 开启失败: ' + (err.message || err) + '</span>';
    });
  }

  function clearQuarantine(btn) {
    btn.disabled = true;
    btn.textContent = '正在清空...';
    var status = document.getElementById('dsh-ext-rescue-status');
    if (status) status.innerHTML = '<span class="dsh-ext-status-processing">[处理中] 正在清空隔离名单...</span>';

    fetch('/api/dsh-ext/plugins/quarantine/clear', { method: 'POST' })
    .then(function(res) {
      if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
      return res.json();
    })
    .then(function() {
      if (status) status.innerHTML = '<span class="dsh-ext-status-ok">[已完成] 已清空隔离名单，正在重新加载 DSH...</span>';
      setTimeout(function() { window.location.reload(); }, 1000);
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.textContent = '清空隔离名单';
      if (status) status.innerHTML = '<span class="dsh-ext-status-error">[失败] 清空失败: ' + (err.message || err) + '</span>';
    });
  }

  function isStrictPackageName(str) {
    if (!str || typeof str !== 'string') return false;
    str = str.trim();
    if (str === 'HARNESS' || str === 'Failed to load plugins' || str === 'web boot') return false;
    // Strict package name pattern: optional scope, lowercase/numbers/dash/dot, NO spaces or punctuation
    return /^(@[a-zA-Z0-9_-]+\\/)?[a-zA-Z0-9_-]+$/.test(str);
  }

  function copyRescueCommand(command, code, btn) {
    function manualCopy() {
      try {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (_) {}
      btn.textContent = '手动复制';
      btn.title = '自动复制不可用，请选中命令后手动复制';
    }
    btn.disabled = true;
    Promise.resolve().then(function() {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard unavailable');
      return navigator.clipboard.writeText(command);
    }).then(function() {
      btn.textContent = '已复制';
      btn.title = '命令已复制，不会自动执行';
    }).catch(manualCopy).then(function() {
      btn.disabled = false;
      setTimeout(function() { btn.textContent = '复制'; btn.title = '复制这条命令'; }, 2000);
    });
  }

  function renderRescueCommands(container, plugins) {
    if (!container) return;
    // Error text and package inventory are not shell instructions. Only safe
    // package-name tokens can be inserted into a copyable command.
    var names = plugins.filter(function(name) {
      return typeof name === 'string' && /^(@[a-zA-Z0-9_][a-zA-Z0-9_.-]*\\/)?[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/.test(name);
    });
    var target = names.length ? names.join(' ') : 'PLUGIN_NAME';
    var commands = [
      ['隔离故障插件', 'npx dsh-ext skip ' + target],
      ['开启安全模式', 'npx dsh-ext safe'],
      ['查看隔离状态', 'npx dsh-ext status'],
      ['列出已知插件', 'npx dsh-ext list'],
      ['取消指定插件隔离', 'npx dsh-ext unskip ' + target],
      ['清空全部隔离', 'npx dsh-ext restore']
    ];
    container.innerHTML = '';
    commands.forEach(function(item) {
      var row = document.createElement('div');
      row.className = 'dsh-ext-cli-row';
      var label = document.createElement('span');
      label.className = 'dsh-ext-cli-label';
      label.textContent = item[0];
      var code = document.createElement('code');
      code.className = 'dsh-ext-cli-code';
      code.textContent = item[1];
      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'dsh-ext-btn dsh-ext-btn-secondary';
      copy.textContent = '复制';
      copy.title = '复制这条命令';
      copy.setAttribute('aria-label', '复制：' + item[0]);
      copy.onclick = function() { copyRescueCommand(item[1], code, copy); };
      row.appendChild(label);
      row.appendChild(code);
      row.appendChild(copy);
      container.appendChild(row);
    });
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

    function applyTheme() {
      rescueCard.className = isLightSurface() ? 'dsh-ext-theme-light' : 'dsh-ext-theme-dark';
    }
    applyTheme();

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
      renderRescueCommands(commandList, list);
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

    var cli = document.createElement('section');
    cli.className = 'dsh-ext-cli';
    var cliTitle = document.createElement('h5');
    cliTitle.textContent = '终端急救命令';
    cli.appendChild(cliTitle);
    var cliIntro = document.createElement('p');
    cliIntro.textContent = '页面按钮或后端接口不可用时，可在运行 DSH 的同一环境中执行以下独立命令。复制不会自动执行。';
    cli.appendChild(cliIntro);
    var commandList = document.createElement('div');
    commandList.id = 'dsh-ext-rescue-commands';
    cli.appendChild(commandList);
    renderRescueCommands(commandList, failedPlugins);
    var cliNote = document.createElement('p');
    cliNote.className = 'dsh-ext-cli-note';
    cliNote.textContent = '若显示 PLUGIN_NAME，请替换为插件包名或加载行 ID。自定义 profile 时，隔离及安全模式命令请加 --profile PROFILE_NAME，并保持 DSH_HOME 与宿主一致。命令完成后重启 DSH；取消隔离前请先修复故障。已全局安装 dsh-ext 时可省略 npx。';
    cli.appendChild(cliNote);
    rescueCard.appendChild(cli);

    card.appendChild(rescueCard);

    try {
      var scheme = window.matchMedia('(prefers-color-scheme: dark)');
      var onSchemeChange = function() { applyTheme(); };
      if (scheme.addEventListener) scheme.addEventListener('change', onSchemeChange);
      else if (scheme.addListener) scheme.addListener(onSchemeChange);
    } catch (_) {}
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
