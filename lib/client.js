window.__ModuleLoader__.load({
	id: "dsh-plugin-dev-tool-ext",
	factory: (require) => {
var module = { exports: {} };
var exports = module.exports;

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name,
  useLocalToggle: () => useLocalToggle
});
module.exports = __toCommonJS(index_exports);
var import_react15 = require("react");

// src/client/SettingsPage.tsx
var import_react10 = require("react");

// src/client/ui.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var token = {
  /** Primary body text. */
  text: "var(--dsw-alias-label-primary, currentColor)",
  /** Secondary text: labels, values beside a primary line. */
  textSecondary: "var(--dsw-alias-label-secondary, color-mix(in srgb, currentColor 80%, transparent))",
  /** De-emphasized text: hints, timestamps, counts. */
  textMuted: "var(--dsw-alias-label-caption, color-mix(in srgb, currentColor 60%, transparent))",
  /** Hairline borders and dividers. */
  border: "var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 20%, transparent))",
  /** Slightly raised surface, for cards and inputs. */
  surface: "var(--dsw-alias-bg-layer-2, transparent)",
  /** Recessed page background. */
  surfaceBase: "var(--dsw-alias-bg-base, transparent)",
  /** Hover wash for rows and buttons. */
  hover: "var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 8%, transparent))",
  /** Accent, for links and the active state. */
  accent: "var(--dsw-alias-brand-primary, currentColor)",
  /** Destructive and error. */
  danger: "var(--dsw-alias-state-error-primary, #f25a5a)",
  /** Caution. */
  warn: "var(--dsw-alias-state-warn-primary, #f59e0b)",
  /** Success. */
  success: "var(--dsw-alias-state-success-primary, #22c55e)"
};
function Section(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "section",
    {
      "data-dsh-plugin": "dsh-dev-tool-ext",
      "data-dsh-part": "section",
      style: { borderBottom: `1px solid ${token.border}`, padding: "16px 0", color: token.text },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { margin: 0, fontSize: 14, fontWeight: 600, color: token.text }, children: props.title }),
        props.description !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: "4px 0 0", fontSize: 12, lineHeight: 1.5, color: token.textMuted }, children: props.description }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }, children: props.children })
      ]
    }
  );
}
function Row(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { minWidth: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, color: token.text }, children: props.label }),
      props.hint !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: token.textMuted, marginTop: 2 }, children: props.hint })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flex: "0 0 auto" }, children: props.control })
  ] });
}
function Toggle(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, cursor: props.disabled === true ? "not-allowed" : "pointer" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "input",
    {
      type: "checkbox",
      checked: props.checked,
      disabled: props.disabled === true,
      "aria-label": props.label,
      onChange: (event) => {
        props.onChange(event.currentTarget.checked);
      },
      style: { accentColor: token.accent, cursor: "inherit" }
    }
  ) });
}
function Select(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "select",
    {
      value: props.value,
      disabled: props.disabled === true,
      "aria-label": props.label,
      onChange: (event) => {
        props.onChange(event.currentTarget.value);
      },
      style: { ...inputStyle, minWidth: 140 },
      children: props.options.map((option) => (
        // A native option list is painted by the OS, which does not read our
        // tokens; the explicit pair keeps it legible under a dark theme.
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option.value, style: { color: token.text, background: token.surface }, children: option.label }, option.value)
      ))
    }
  );
}
var inputStyle = {
  font: "inherit",
  fontSize: 12,
  color: token.text,
  background: token.surface,
  border: `1px solid ${token.border}`,
  borderRadius: 6,
  padding: "4px 8px"
};
var buttonStyle = {
  ...inputStyle,
  cursor: "pointer",
  userSelect: "none"
};
function TextField(props) {
  const [draft, setDraft] = (0, import_react.useState)(props.value);
  const [editing, setEditing] = (0, import_react.useState)(false);
  if (!editing && draft !== props.value) setDraft(props.value);
  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== props.value) props.onCommit(next);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "input",
    {
      type: "text",
      value: draft,
      "aria-label": props.label,
      placeholder: props.placeholder,
      disabled: props.disabled,
      onFocus: () => {
        setEditing(true);
      },
      onChange: (event) => {
        setDraft(event.currentTarget.value);
      },
      onBlur: commit,
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setDraft(props.value);
          setEditing(false);
        }
      },
      style: { ...inputStyle, width: props.width ?? 180 }
    }
  );
}
function NumberField(props) {
  const [draft, setDraft] = (0, import_react.useState)(String(props.value));
  const [editing, setEditing] = (0, import_react.useState)(false);
  if (!editing && draft !== String(props.value)) setDraft(String(props.value));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "input",
    {
      type: "number",
      value: draft,
      min: props.min,
      max: props.max,
      step: props.step ?? 1,
      "aria-label": props.label,
      disabled: props.disabled,
      onFocus: () => {
        setEditing(true);
      },
      onChange: (event) => {
        setDraft(event.currentTarget.value);
      },
      onBlur: () => {
        setEditing(false);
        const parsed = Number(draft);
        if (!Number.isFinite(parsed) || parsed < props.min || parsed > props.max) {
          setDraft(String(props.value));
          return;
        }
        if (parsed !== props.value) props.onCommit(parsed);
      },
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setDraft(String(props.value));
          setEditing(false);
        }
      },
      style: { ...inputStyle, width: 100 }
    }
  );
}
function Notice(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      role: props.kind === "error" ? "alert" : "status",
      style: {
        fontSize: 12,
        lineHeight: 1.5,
        color: props.kind === "error" ? token.danger : token.textMuted,
        border: `1px solid ${props.kind === "error" ? token.danger : token.border}`,
        borderRadius: 6,
        padding: "6px 10px"
      },
      children: props.children
    }
  );
}

// src/client/use-config.ts
var import_react3 = require("react");

// src/shared/api-contract.ts
var API_PREFIX = "/api/dev-tool-ext";
var THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
var DEFAULT_EFFORT_LADDER = [
  { id: "off", name: "Off", description: "No reasoning budget; send nothing.", wire: null },
  { id: "low", name: "Low", description: "A short think before answering.", wire: "low" },
  { id: "medium", name: "Medium", description: "Balanced reasoning for everyday work.", wire: "medium" },
  { id: "high", name: "High", description: "Long reasoning for hard problems.", wire: "high" },
  { id: "max", name: "Max", description: "The most reasoning the model will do.", wire: "high" }
];

// src/client/api.ts
async function callApi(route, init) {
  try {
    const response = await fetch(`${API_PREFIX}${route}`, {
      method: init?.method ?? (init?.body === void 0 ? "GET" : "POST"),
      headers: init?.body === void 0 ? void 0 : { "content-type": "application/json" },
      body: init?.body === void 0 ? void 0 : JSON.stringify(init.body),
      signal: init?.signal ?? null,
      credentials: "same-origin"
    });
    const payload = await response.json();
    if (payload === void 0 || typeof payload !== "object") {
      return { ok: false, message: `unreadable response (HTTP ${response.status})` };
    }
    return payload;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, message: "cancelled" };
    }
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

// src/client/use-client-config.ts
var import_react2 = require("react");
var cached;
var inFlight;
var listeners = /* @__PURE__ */ new Set();
function publish() {
  for (const listener of listeners) listener();
}
async function load() {
  const result = await callApi("/config");
  if (result.ok) {
    cached = result.value.value;
    publish();
  }
}
function ensure() {
  if (cached !== void 0 || inFlight !== void 0) return;
  inFlight = load().finally(() => {
    inFlight = void 0;
  });
}
function invalidateClientConfig() {
  cached = void 0;
  inFlight = load().finally(() => {
    inFlight = void 0;
  });
}
function readClientConfig() {
  ensure();
  return cached;
}
function useClientConfig() {
  const [, bump] = (0, import_react2.useState)(0);
  (0, import_react2.useEffect)(() => {
    const listener = () => {
      bump((value) => value + 1);
    };
    listeners.add(listener);
    ensure();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return cached;
}

// src/client/use-config.ts
function useConfig() {
  const [view, setView] = (0, import_react3.useState)(void 0);
  const [error, setError] = (0, import_react3.useState)(void 0);
  const [busy, setBusy] = (0, import_react3.useState)(false);
  const [nonce, setNonce] = (0, import_react3.useState)(0);
  (0, import_react3.useEffect)(() => {
    const controller = new AbortController();
    void (async () => {
      const result = await callApi("/config", { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (result.ok) {
        setView(result.value);
        setError(void 0);
      } else if (result.message !== "cancelled") {
        setError(result.message);
      }
    })();
    return () => {
      controller.abort();
    };
  }, [nonce]);
  const reload = (0, import_react3.useCallback)(() => {
    setNonce((n) => n + 1);
  }, []);
  const set = (0, import_react3.useCallback)((path, value) => {
    setBusy(true);
    void (async () => {
      const current = view;
      const result = await callApi("/config/mutate", {
        body: {
          ops: [{ op: "set", path, value }],
          expectedRevision: current?.revision
        }
      });
      setBusy(false);
      if (result.ok) {
        setView(result.value);
        setError(void 0);
        invalidateClientConfig();
      } else {
        setError(result.message);
        reload();
      }
    })();
  }, [view, reload]);
  return { view, error, busy, reload, set };
}

// src/client/use-resource.ts
var import_react4 = require("react");
function useResource(route, enabled = true) {
  const [data, setData] = (0, import_react4.useState)(void 0);
  const [error, setError] = (0, import_react4.useState)(void 0);
  const [loading, setLoading] = (0, import_react4.useState)(false);
  const [nonce, setNonce] = (0, import_react4.useState)(0);
  (0, import_react4.useEffect)(() => {
    if (!enabled) {
      setData(void 0);
      setError(void 0);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    void (async () => {
      const result = await callApi(route, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setLoading(false);
      if (result.ok) {
        setData(result.value);
        setError(void 0);
      } else if (result.message !== "cancelled") {
        setError(result.message);
      }
    })();
    return () => {
      controller.abort();
    };
  }, [route, enabled, nonce]);
  const reload = (0, import_react4.useCallback)(() => {
    setNonce((value) => value + 1);
  }, []);
  return (0, import_react4.useMemo)(() => ({ data, error, loading, reload }), [data, error, loading, reload]);
}
function useCommand(onSettled) {
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const [error, setError] = (0, import_react4.useState)(void 0);
  const run = (0, import_react4.useCallback)(async (route, body) => {
    setBusy(true);
    setError(void 0);
    const result = await callApi(route, { method: "POST", body: body ?? {} });
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return false;
    }
    onSettled?.();
    return true;
  }, [onSettled]);
  const clearError = (0, import_react4.useCallback)(() => {
    setError(void 0);
  }, []);
  return (0, import_react4.useMemo)(() => ({ busy, error, run, clearError }), [busy, error, run, clearError]);
}

// src/client/use-locale.ts
var import_react5 = require("react");

// src/client/locales.ts
var LOCALE_NS = "dsh-dev-tool-ext";
var en = {
  // Section titles and descriptions
  "section.images": "Composer images",
  "section.images.desc": "An image entry at the top of the + menu, and drag-to-reorder for draft images.",
  "section.effort": "Reasoning effort",
  "section.effort.desc": "Declares each model's effort levels for third-party (pi-ai) routes, so the composer's effort control appears for those models.",
  "section.balance": "DeepSeek balance",
  "section.balance.desc": "Reads the account balance of the configured DeepSeek official API key. The key never reaches the browser.",
  "section.review": "Command review",
  "section.review.desc": "Screens high-risk tool calls with local patterns, then asks a second model to judge the ones that match. A review can only make a call stricter.",
  "section.explorer": "Project explorer",
  "section.explorer.desc": "The workspace directory tree and its uncommitted changes. Read-only: every git command behind it is a query.",
  "section.sessions": "Session records",
  "section.sessions.desc": "Delete stored sessions, with a trash you can restore from. The sidebar list refreshes on reload.",
  "section.plugins": "Plugin safety",
  "section.plugins.desc": "Quarantine a plugin so the next start skips it. Includes the rescue command for a harness that will not boot at all.",
  "section.checkpoints": "Checkpoints",
  "section.checkpoints.desc": "Per-session rollback through a shadow git repository. Your project's own git history, index, and stashes are never touched.",
  // Shared controls
  "common.enabled": "Enabled",
  "common.on": "On",
  "common.off": "Off",
  "common.refresh": "Refresh",
  "common.clear": "Clear",
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.reset": "Reset",
  "common.delete": "Delete",
  "common.restore": "Restore",
  "common.yes": "Yes",
  "common.no": "No",
  "common.loading": "Loading\u2026",
  "common.days": "days",
  "common.readonly": "No settings provider is mounted in this deployment, so changes cannot be stored. The values below are the ones the composition supplied.",
  // Images
  "images.button": "Image entry in the + menu",
  "images.button.hint": 'Adds "Add images" as the first entry of the + menu.',
  "images.drag": "Drag to reorder",
  "images.drag.hint": "Drag a thumbnail, or use its \u2039 \u203A buttons. Reordering is refused while a message is being sent.",
  "images.add": "Add images",
  "images.pickHint": "Attach images to this message",
  "images.remove": "Remove {name}",
  "images.earlier": "Move {name} earlier",
  "images.later": "Move {name} later",
  "images.busy": "The composer is busy sending; the image order was left as it was.",
  "images.drop": "Drop images to attach them",
  "images.dropLimits": "Drop up to {count} image(s), {size} each",
  "images.rail": "Draft images",
  "images.railMissing": "The image rail is not mounted",
  // Effort
  "effort.models": "Models and levels",
  "effort.none": "No third-party (pi-ai) providers are configured. Add one on the Models page first.",
  "effort.noEfforts": "no efforts",
  "effort.fromAdapter": "from the adapter: {list}",
  "effort.declare": "Declare",
  "effort.edit": "Edit",
  "effort.notLoaded": "configured, not loaded",
  "effort.level": "Level",
  "effort.sentAs": "Sent as",
  "effort.explain": 'The left column is what you pick in the composer. The right column is what the provider is sent \u2014 leave it empty only for "off", which sends nothing.',
  "effort.add": "Add:",
  "effort.remove": "Remove",
  "effort.noReasoning": "No reasoning",
  "effort.noReasoning.hint": "Record that this model does no reasoning at all",
  "effort.reset.hint": "Remove this plugin's override and inherit whatever the adapter says",
  "effort.sendNothing": "(send nothing)",
  "effort.required": "required",
  "effort.readonly": "No settings provider is mounted, so efforts cannot be stored.",
  // Vision (the image-modality declaration)
  "vision.on": "Images \u2713",
  "vision.off": "Images \u2715",
  "vision.hint": "Whether this model accepts image attachments. The host refuses images unless the model declares the image modality.",
  // Composer model menu (this plugin's replacement for the shipped one)
  "section.modelPicker": "Model menu",
  "section.modelPicker.desc": "The composer's model list, with each provider group collapsible and a filter by name.",
  "modelPicker.collapse": "Collapsible groups",
  "modelPicker.collapse.hint": "Off shows every provider expanded at all times, as the shipped menu did.",
  "picker.chooseModel": "Select model",
  "picker.triggerAria": "Select model, currently {model}",
  "picker.triggerAriaEffort": "Select model, currently {model}, reasoning {effort}",
  "picker.menuAria": "Model and reasoning level",
  "picker.model": "Model",
  "picker.effort": "Reasoning",
  "picker.providerDefault": "Default",
  "picker.loading": "Refreshing the model list\u2026",
  "picker.actionFailed": "The model operation failed: {message}",
  "picker.reload": "Reload",
  "picker.groupFailed": "{name} failed to load: {message}",
  "picker.noModels": "No models are available.",
  "picker.noMatch": "No model matches that.",
  "picker.noEfforts": "This model exposes no reasoning levels.",
  "picker.filter": "Filter models",
  "picker.collapseAll": "Collapse all",
  "picker.expandAll": "Expand all",
  // Composer effort control
  "effortPicker.label": "Reasoning effort",
  "effortPicker.none": "This model exposes no reasoning levels.",
  "effortPicker.default": "Provider default",
  "effortPicker.declaring": "Declaring\u2026",
  "effortPicker.declareStandard": "Enable standard levels (off/low/medium/high)",
  "effortPicker.notDescribed": "The installed catalog does not describe this route, so levels cannot be declared for it here. Spell the model out in the provider\u2019s model list on the Models page first.",
  "effortPicker.failed": "The model refused that effort level.",
  // Balance
  "balance.currency": "Currency",
  "balance.total": "Total",
  "balance.granted": "Granted",
  "balance.toppedUp": "Topped up",
  "balance.badge": "Composer chip",
  "balance.badge.hint": "Also show a compact balance chip in the composer, just left of the model selector.",
  "balance.reading": "Reading the balance\u2026",
  "balance.unavailable": "DeepSeek reports this account cannot currently serve requests.",
  "balance.noRows": "The API reported no balance rows.",
  "balance.keyFrom": "key from {source}",
  // Review
  "review.mode": "Mode",
  "review.mode.rules": "Local rules only",
  "review.mode.rulesLlm": "Rules, then model",
  "review.mode.all": "Every covered call",
  "review.provider": "Reviewer provider",
  "review.provider.hint": "The provider route the reviewer runs on. Any route configured on the Models page.",
  "review.model": "Reviewer model",
  "review.model.hint": "The model id the reviewer asks. Press Enter or click away to save.",
  "review.timeout": "Reviewer deadline",
  "review.timeout.hint": "How long to wait for a verdict before falling back to the rule below (1000\u2013120000 ms).",
  "review.deadline": "{ms} ms deadline",
  "review.onFailure": "On reviewer failure",
  "review.onFailure.hint": "What happens when the reviewer times out, errors, or has no credential.",
  "review.onFailure.ask": "Ask the user",
  "review.onFailure.deny": "Refuse the call",
  "review.onFailure.allow": "Allow and log",
  "review.tools": "Reviewed tools",
  "review.tools.hint": "Tool names subject to review; edit the list in settings.yaml.",
  "review.verdicts": "Recent verdicts",
  "review.empty": "No reviewed commands yet.",
  "review.count": "{n} most recent verdict(s).",
  "review.matched": "matched pattern:",
  "review.off": "Command review is switched off.",
  // Explorer
  "explorer.side": "Side",
  "explorer.side.left": "Left",
  "explorer.side.right": "Right",
  "explorer.defaultOpen": "Open by default",
  "explorer.gitignore": "Respect .gitignore",
  "explorer.preview": "Preview",
  "explorer.changes": "Changes",
  "explorer.files": "Files",
  "explorer.noRepo": "Not a git repository.",
  "explorer.noChanges": "No uncommitted changes.",
  "explorer.workspace": "workspace",
  "explorer.up": "\u2039 up",
  "explorer.truncated": "\u2026more entries than the configured cap; refine the path to see them.",
  "explorer.noDiff": "(no textual diff)",
  "explorer.diffFailed": "Could not read the diff: {message}",
  "explorer.title": "Project",
  "explorer.off": "The explorer is switched off.",
  // Change kinds
  "change.untracked": "untracked",
  "change.modified": "modified",
  "change.modifiedStaged": "modified, staged",
  "change.added": "added",
  "change.deleted": "deleted",
  "change.renamed": "renamed",
  "change.copied": "copied",
  "change.conflicted": "conflicted",
  "change.typeChanged": "type changed",
  "change.staged": "staged",
  "change.changed": "changed",
  // Sessions
  "sessions.trash": "Use trash",
  "sessions.trash.hint": "Off means a delete removes the transcript immediately.",
  "sessions.gc": "Collect unused attachments",
  "sessions.gc.hint": "On permanent delete, scan every remaining session before removing an image blob. Slow on a large history.",
  "sessions.stored": "Stored sessions",
  "sessions.none": "No stored sessions.",
  "sessions.confirmTrash": "Move to trash?",
  "sessions.confirmDelete": "Delete permanently?",
  "sessions.movedToTrash": "Moved to trash. The sidebar list refreshes on reload.",
  "sessions.deleted": "Deleted. The sidebar list refreshes on reload.",
  "sessions.restored": "Restored. Reload to see it in the sidebar.",
  "sessions.trashCount": "Trash ({n})",
  "sessions.emptyTrash": "Empty trash",
  "sessions.deleteForever": "Delete forever",
  "sessions.deletedAt": "deleted {when}",
  "sessions.off": "Session administration is switched off.",
  // Plugins
  "plugins.list": "Installed plugins and rescue",
  "plugins.none": "No third-party plugins are installed.",
  "plugins.quarantined": "quarantined",
  "plugins.quarantinedCount": "{n} plugin(s) are quarantined and will not load on the next start.",
  "plugins.enable": "Enable",
  "plugins.disable": "Disable",
  "plugins.enableAll": "Enable every quarantined plugin",
  "plugins.rescueTitle": "If the harness will not start",
  "plugins.rescueBody": "This page is part of the same plugin tree, so it cannot help once a plugin breaks the boot. The dsh-ext command ships with this plugin for exactly that case and needs nothing from the harness to run:",
  "plugins.rescueFile": "Quarantine is stored as disable rows in {file}, which the launcher composes after every bundle layer \u2014 so a disabled row wins and no flag is needed at start. Your own entries in that file are left untouched.",
  "plugins.off": "Plugin safety is switched off.",
  // Checkpoints
  "cp.snapshotOn": "Snapshot on",
  "cp.snapshotOn.turn": "Each turn",
  "cp.snapshotOn.tool": "Each mutating tool call",
  "cp.retention": "Retention",
  "cp.retention.hint": "Checkpoints older than this are pruned when the plugin loads. 0 keeps everything.",
  "cp.maxSize": "Skip files larger than",
  "cp.list": "Checkpoints and restore",
  "cp.take": "Take a checkpoint now",
  "cp.none": "No checkpoints have been taken for this workspace yet. One is recorded before the agent's first file change.",
  "cp.diff": "Diff",
  "cp.restore": "Restore\u2026",
  "cp.baseline": "baseline",
  "cp.noLabel": "(no label)",
  "cp.restoreTitle": "Restore checkpoint {id}?",
  "cp.restoreNoop": "Your working tree already matches this checkpoint; nothing would change.",
  "cp.restoreCount": "{n} file(s) would be written or removed. Your own git history, index, and stashes are not touched.",
  "cp.unprotected": "{n} of them are not tracked by your git, so this working copy is the only one:",
  "cp.andMore": "\u2026and {n} more",
  "cp.restoring": "Restoring\u2026",
  "cp.restored": "Restored. A checkpoint of the previous state was taken first, so this is undoable.",
  "cp.previewFailed": "Could not work out what a restore would change: {message}",
  "cp.emptyDiff": "(this checkpoint changed nothing textual)",
  "cp.checkpointN": "Checkpoint {id}",
  "cp.off": "Checkpoints are switched off.",
  "cp.justNow": "just now",
  "cp.minsAgo": "{n} min ago",
  "cp.hoursAgo": "{n} h ago",
  "cp.unknownTime": "unknown time"
};
var zh = {
  "section.images": "\u8F93\u5165\u6846\u56FE\u7247",
  "section.images.desc": "\u5728 + \u83DC\u5355\u6700\u4E0A\u9762\u52A0\u4E00\u6761\u56FE\u7247\u5165\u53E3\uFF0C\u8349\u7A3F\u56FE\u7247\u53EF\u62D6\u52A8\u6539\u987A\u5E8F\u3002",
  "section.effort": "\u63A8\u7406\u5F3A\u5EA6",
  "section.effort.desc": "\u4E3A\u7B2C\u4E09\u65B9\uFF08pi-ai\uFF09\u7EBF\u8DEF\u7684\u6BCF\u4E2A\u6A21\u578B\u58F0\u660E\u63A8\u7406\u6863\u4F4D\uFF0C\u58F0\u660E\u540E\u8F93\u5165\u6846\u81EA\u5E26\u7684\u5F3A\u5EA6\u9009\u62E9\u5668\u5C31\u4F1A\u5BF9\u8FD9\u4E9B\u6A21\u578B\u51FA\u73B0\u3002",
  "section.balance": "DeepSeek \u4F59\u989D",
  "section.balance.desc": "\u8BFB\u53D6\u5DF2\u914D\u7F6E\u7684 DeepSeek \u5B98\u65B9 API \u5BC6\u94A5\u7684\u8D26\u6237\u4F59\u989D\u3002\u5BC6\u94A5\u4E0D\u4F1A\u8FDB\u5165\u6D4F\u89C8\u5668\u3002",
  "section.review": "\u547D\u4EE4\u5BA1\u6838",
  "section.review.desc": "\u5148\u7528\u672C\u5730\u89C4\u5219\u7B5B\u67E5\u9AD8\u5371\u5DE5\u5177\u8C03\u7528\uFF0C\u547D\u4E2D\u7684\u518D\u4EA4\u7ED9\u7B2C\u4E8C\u4E2A\u6A21\u578B\u5224\u65AD\u3002\u5BA1\u6838\u53EA\u4F1A\u8BA9\u8C03\u7528\u66F4\u4E25\u683C\uFF0C\u4E0D\u4F1A\u653E\u5BBD\u3002",
  "section.explorer": "\u9879\u76EE\u6D4F\u89C8",
  "section.explorer.desc": "\u5DE5\u4F5C\u533A\u76EE\u5F55\u6811\u4E0E\u672A\u63D0\u4EA4\u7684\u6539\u52A8\u3002\u53EA\u8BFB\uFF1A\u80CC\u540E\u6BCF\u6761 git \u547D\u4EE4\u90FD\u662F\u67E5\u8BE2\u3002",
  "section.sessions": "\u4F1A\u8BDD\u8BB0\u5F55",
  "section.sessions.desc": "\u5220\u9664\u5DF2\u5B58\u4F1A\u8BDD\uFF0C\u5E26\u53EF\u6062\u590D\u7684\u56DE\u6536\u7AD9\u3002\u4FA7\u680F\u5217\u8868\u5728\u91CD\u65B0\u52A0\u8F7D\u540E\u5237\u65B0\u3002",
  "section.plugins": "\u63D2\u4EF6\u5B89\u5168",
  "section.plugins.desc": "\u9694\u79BB\u67D0\u4E2A\u63D2\u4EF6\uFF0C\u4E0B\u6B21\u542F\u52A8\u5C31\u4F1A\u8DF3\u8FC7\u5B83\u3002\u4E5F\u5305\u542B harness \u5B8C\u5168\u8D77\u4E0D\u6765\u65F6\u7684\u6551\u63F4\u547D\u4EE4\u3002",
  "section.checkpoints": "\u68C0\u67E5\u70B9",
  "section.checkpoints.desc": "\u901A\u8FC7\u5F71\u5B50 git \u4ED3\u5E93\u505A\u6309\u4F1A\u8BDD\u56DE\u6EDA\u3002\u4F60\u9879\u76EE\u81EA\u5DF1\u7684 git \u5386\u53F2\u3001\u7D22\u5F15\u548C stash \u7EDD\u4E0D\u4F1A\u88AB\u89E6\u78B0\u3002",
  "common.enabled": "\u542F\u7528",
  "common.on": "\u5F00",
  "common.off": "\u5173",
  "common.refresh": "\u5237\u65B0",
  "common.clear": "\u6E05\u7A7A",
  "common.close": "\u5173\u95ED",
  "common.cancel": "\u53D6\u6D88",
  "common.save": "\u4FDD\u5B58",
  "common.reset": "\u91CD\u7F6E",
  "common.delete": "\u5220\u9664",
  "common.restore": "\u6062\u590D",
  "common.yes": "\u786E\u5B9A",
  "common.no": "\u4E0D\u4E86",
  "common.loading": "\u52A0\u8F7D\u4E2D\u2026",
  "common.days": "\u5929",
  "common.readonly": "\u5F53\u524D\u90E8\u7F72\u6CA1\u6709\u6302\u8F7D\u8BBE\u7F6E\u63D0\u4F9B\u8005\uFF0C\u6539\u52A8\u65E0\u6CD5\u4FDD\u5B58\u3002\u4E0B\u9762\u663E\u793A\u7684\u662F\u7EC4\u5408\u4F20\u5165\u7684\u503C\u3002",
  "images.button": "+ \u83DC\u5355\u91CC\u7684\u56FE\u7247\u5165\u53E3",
  "images.button.hint": "\u5728 + \u83DC\u5355\u7684\u7B2C\u4E00\u6761\u52A0\u4E0A\u300C\u6DFB\u52A0\u56FE\u7247\u300D\u3002",
  "images.drag": "\u62D6\u52A8\u6539\u987A\u5E8F",
  "images.drag.hint": "\u62D6\u52A8\u7F29\u7565\u56FE\uFF0C\u6216\u7528\u5B83\u7684 \u2039 \u203A \u6309\u94AE\u3002\u6D88\u606F\u53D1\u9001\u4E2D\u4F1A\u62D2\u7EDD\u6539\u987A\u5E8F\u3002",
  "images.add": "\u6DFB\u52A0\u56FE\u7247",
  "images.pickHint": "\u4E3A\u8FD9\u6761\u6D88\u606F\u9644\u52A0\u56FE\u7247",
  "images.remove": "\u79FB\u9664 {name}",
  "images.earlier": "\u628A {name} \u5F80\u524D\u79FB",
  "images.later": "\u628A {name} \u5F80\u540E\u79FB",
  "images.busy": "\u8F93\u5165\u6846\u6B63\u5728\u53D1\u9001\uFF0C\u56FE\u7247\u987A\u5E8F\u4FDD\u6301\u539F\u6837\u3002",
  "images.drop": "\u62D6\u5165\u56FE\u7247\u5373\u53EF\u9644\u52A0",
  "images.dropLimits": "\u6700\u591A {count} \u5F20\uFF0C\u6BCF\u5F20 {size}",
  "images.rail": "\u8349\u7A3F\u56FE\u7247",
  "images.railMissing": "\u56FE\u7247\u680F\u672A\u6302\u8F7D",
  "effort.models": "\u6A21\u578B\u4E0E\u6863\u4F4D",
  "effort.none": "\u8FD8\u6CA1\u6709\u914D\u7F6E\u7B2C\u4E09\u65B9\uFF08pi-ai\uFF09\u4F9B\u5E94\u5546\u3002\u8BF7\u5148\u5728\u300C\u6A21\u578B\u300D\u9875\u9762\u6DFB\u52A0\u3002",
  "effort.noEfforts": "\u65E0\u6863\u4F4D",
  "effort.fromAdapter": "\u6765\u81EA\u9002\u914D\u5668\uFF1A{list}",
  "effort.declare": "\u58F0\u660E",
  "effort.edit": "\u7F16\u8F91",
  "effort.notLoaded": "\u5DF2\u914D\u7F6E\uFF0C\u672A\u52A0\u8F7D",
  "effort.level": "\u6863\u4F4D",
  "effort.sentAs": "\u5B9E\u9645\u53D1\u9001",
  "effort.explain": "\u5DE6\u5217\u662F\u4F60\u5728\u8F93\u5165\u6846\u91CC\u770B\u5230\u7684\u9009\u9879\uFF0C\u53F3\u5217\u662F\u5B9E\u9645\u53D1\u7ED9\u4F9B\u5E94\u5546\u7684\u503C \u2014\u2014 \u53EA\u6709 off \u53EF\u4EE5\u7559\u7A7A\uFF0C\u8868\u793A\u4EC0\u4E48\u90FD\u4E0D\u53D1\u3002",
  "effort.add": "\u6DFB\u52A0\uFF1A",
  "effort.remove": "\u79FB\u9664",
  "effort.noReasoning": "\u4E0D\u63A8\u7406",
  "effort.noReasoning.hint": "\u8BB0\u5F55\u8FD9\u4E2A\u6A21\u578B\u5B8C\u5168\u4E0D\u505A\u63A8\u7406",
  "effort.reset.hint": "\u79FB\u9664\u672C\u63D2\u4EF6\u7684\u8986\u76D6\uFF0C\u56DE\u5230\u9002\u914D\u5668\u81EA\u5DF1\u7684\u8BF4\u6CD5",
  "effort.sendNothing": "\uFF08\u4EC0\u4E48\u90FD\u4E0D\u53D1\uFF09",
  "effort.required": "\u5FC5\u586B",
  "effort.readonly": "\u6CA1\u6709\u6302\u8F7D\u8BBE\u7F6E\u63D0\u4F9B\u8005\uFF0C\u63A8\u7406\u6863\u4F4D\u65E0\u6CD5\u4FDD\u5B58\u3002",
  // 图片能力声明
  "vision.on": "\u652F\u6301\u56FE\u7247 \u2713",
  "vision.off": "\u652F\u6301\u56FE\u7247 \u2715",
  "vision.hint": "\u8BE5\u6A21\u578B\u662F\u5426\u63A5\u53D7\u56FE\u7247\u9644\u4EF6\u3002\u6A21\u578B\u672A\u58F0\u660E\u56FE\u7247\u6A21\u6001\u65F6\uFF0C\u5BBF\u4E3B\u4F1A\u62D2\u7EDD\u53D1\u9001\u56FE\u7247\u3002",
  // 输入框模型菜单
  "section.modelPicker": "\u6A21\u578B\u83DC\u5355",
  "section.modelPicker.desc": "\u8F93\u5165\u6846\u91CC\u7684\u6A21\u578B\u5217\u8868\uFF0C\u6309\u4F9B\u5E94\u5546\u5206\u7EC4\u6298\u53E0\uFF0C\u5E76\u652F\u6301\u6309\u540D\u79F0\u7B5B\u9009\u3002",
  "modelPicker.collapse": "\u5206\u7EC4\u53EF\u6298\u53E0",
  "modelPicker.collapse.hint": "\u5173\u95ED\u540E\u6240\u6709\u4F9B\u5E94\u5546\u59CB\u7EC8\u5C55\u5F00\uFF0C\u548C\u81EA\u5E26\u83DC\u5355\u4E00\u6837\u3002",
  "picker.chooseModel": "\u9009\u62E9\u6A21\u578B",
  "picker.triggerAria": "\u9009\u62E9\u6A21\u578B\uFF0C\u5F53\u524D {model}",
  "picker.triggerAriaEffort": "\u9009\u62E9\u6A21\u578B\uFF0C\u5F53\u524D {model}\uFF0C\u63A8\u7406\u7B49\u7EA7 {effort}",
  "picker.menuAria": "\u6A21\u578B\u4E0E\u63A8\u7406\u7B49\u7EA7",
  "picker.model": "\u6A21\u578B",
  "picker.effort": "\u63A8\u7406\u7B49\u7EA7",
  "picker.providerDefault": "\u9ED8\u8BA4",
  "picker.loading": "\u6B63\u5728\u5237\u65B0\u6A21\u578B\u5217\u8868\u2026",
  "picker.actionFailed": "\u6A21\u578B\u64CD\u4F5C\u5931\u8D25\uFF1A{message}",
  "picker.reload": "\u91CD\u65B0\u52A0\u8F7D",
  "picker.groupFailed": "{name} \u52A0\u8F7D\u5931\u8D25\uFF1A{message}",
  "picker.noModels": "\u6CA1\u6709\u53EF\u7528\u7684\u6A21\u578B\u3002",
  "picker.noMatch": "\u6CA1\u6709\u5339\u914D\u7684\u6A21\u578B\u3002",
  "picker.noEfforts": "\u8FD9\u4E2A\u6A21\u578B\u6CA1\u6709\u66B4\u9732\u63A8\u7406\u6863\u4F4D\u3002",
  "picker.filter": "\u7B5B\u9009\u6A21\u578B",
  "picker.collapseAll": "\u5168\u90E8\u6298\u53E0",
  "picker.expandAll": "\u5168\u90E8\u5C55\u5F00",
  "effortPicker.label": "\u63A8\u7406\u5F3A\u5EA6",
  "effortPicker.none": "\u8FD9\u4E2A\u6A21\u578B\u6CA1\u6709\u66B4\u9732\u63A8\u7406\u6863\u4F4D\u3002",
  "effortPicker.default": "\u4F9B\u5E94\u5546\u9ED8\u8BA4",
  "effortPicker.declaring": "\u6B63\u5728\u58F0\u660E\u2026",
  "effortPicker.declareStandard": "\u542F\u7528\u6807\u51C6\u6863\u4F4D\uFF08\u5173/\u4F4E/\u4E2D/\u9AD8\uFF09",
  "effortPicker.notDescribed": "\u5DF2\u5B89\u88C5\u7684\u6A21\u578B\u76EE\u5F55\u91CC\u6CA1\u6709\u8FD9\u4E2A\u8DEF\u7531\uFF0C\u6240\u4EE5\u4E0D\u80FD\u5728\u8FD9\u91CC\u4E3A\u5B83\u58F0\u660E\u6863\u4F4D\u3002\u5148\u5728\u300C\u6A21\u578B\u300D\u9875\u9762\u628A\u8FD9\u4E2A\u6A21\u578B\u5199\u8FDB\u4F9B\u5E94\u5546\u7684\u6A21\u578B\u5217\u8868\u3002",
  "effortPicker.failed": "\u6A21\u578B\u62D2\u7EDD\u4E86\u8FD9\u4E2A\u63A8\u7406\u6863\u4F4D\u3002",
  "balance.currency": "\u5E01\u79CD",
  "balance.total": "\u603B\u989D",
  "balance.granted": "\u8D60\u9001",
  "balance.toppedUp": "\u5145\u503C",
  "balance.badge": "\u8F93\u5165\u6846\u4F59\u989D\u6807\u8BB0",
  "balance.badge.hint": "\u5728\u8F93\u5165\u6846\u91CC\u3001\u6A21\u578B\u9009\u62E9\u5668\u5DE6\u8FB9\u663E\u793A\u4E00\u4E2A\u7D27\u51D1\u7684\u4F59\u989D\u6807\u8BB0\u3002",
  "balance.reading": "\u6B63\u5728\u8BFB\u53D6\u4F59\u989D\u2026",
  "balance.unavailable": "DeepSeek \u62A5\u544A\u8FD9\u4E2A\u8D26\u6237\u5F53\u524D\u65E0\u6CD5\u670D\u52A1\u8BF7\u6C42\u3002",
  "balance.noRows": "\u63A5\u53E3\u6CA1\u6709\u8FD4\u56DE\u4EFB\u4F55\u4F59\u989D\u884C\u3002",
  "balance.keyFrom": "\u5BC6\u94A5\u6765\u81EA {source}",
  "review.mode": "\u6A21\u5F0F",
  "review.mode.rules": "\u4EC5\u672C\u5730\u89C4\u5219",
  "review.mode.rulesLlm": "\u89C4\u5219\u547D\u4E2D\u540E\u4EA4\u6A21\u578B",
  "review.mode.all": "\u6240\u6709\u8986\u76D6\u7684\u8C03\u7528",
  "review.provider": "\u5BA1\u6838\u4F9B\u5E94\u5546",
  "review.provider.hint": "\u5BA1\u6838\u6A21\u578B\u8D70\u54EA\u4E2A\u4F9B\u5E94\u5546\u8DEF\u7531\u3002\u586B\u300C\u6A21\u578B\u300D\u9875\u91CC\u5DF2\u914D\u7F6E\u7684\u4EFB\u610F\u8DEF\u7531\u3002",
  "review.model": "\u5BA1\u6838\u6A21\u578B",
  "review.model.hint": "\u5BA1\u6838\u65F6\u8BE2\u95EE\u7684\u6A21\u578B id\u3002\u6309\u56DE\u8F66\u6216\u70B9\u51FB\u522B\u5904\u4FDD\u5B58\u3002",
  "review.timeout": "\u5BA1\u6838\u8D85\u65F6",
  "review.timeout.hint": "\u7B49\u5F85\u5BA1\u6838\u7ED3\u8BBA\u7684\u65F6\u957F\uFF0C\u8D85\u65F6\u540E\u6309\u4E0B\u9762\u90A3\u6761\u89C4\u5219\u5904\u7406\uFF081000\u2013120000 \u6BEB\u79D2\uFF09\u3002",
  "review.deadline": "{ms} \u6BEB\u79D2\u8D85\u65F6",
  "review.onFailure": "\u5BA1\u6838\u5931\u8D25\u65F6",
  "review.onFailure.hint": "\u5BA1\u6838\u6A21\u578B\u8D85\u65F6\u3001\u62A5\u9519\u6216\u6CA1\u6709\u51ED\u636E\u65F6\u600E\u4E48\u5904\u7406\u3002",
  "review.onFailure.ask": "\u8BE2\u95EE\u7528\u6237",
  "review.onFailure.deny": "\u62D2\u7EDD\u8C03\u7528",
  "review.onFailure.allow": "\u653E\u884C\u5E76\u8BB0\u5F55",
  "review.tools": "\u53D7\u5BA1\u5DE5\u5177",
  "review.tools.hint": "\u4F1A\u88AB\u5BA1\u6838\u7684\u5DE5\u5177\u540D\uFF1B\u5728 settings.yaml \u91CC\u6539\u8FD9\u4E2A\u5217\u8868\u3002",
  "review.verdicts": "\u6700\u8FD1\u7684\u5224\u5B9A",
  "review.empty": "\u8FD8\u6CA1\u6709\u5BA1\u6838\u8FC7\u4EFB\u4F55\u547D\u4EE4\u3002",
  "review.count": "\u6700\u8FD1 {n} \u6761\u5224\u5B9A\u3002",
  "review.matched": "\u547D\u4E2D\u89C4\u5219\uFF1A",
  "review.off": "\u547D\u4EE4\u5BA1\u6838\u5DF2\u5173\u95ED\u3002",
  "explorer.side": "\u505C\u9760\u4F4D\u7F6E",
  "explorer.side.left": "\u5DE6\u4FA7",
  "explorer.side.right": "\u53F3\u4FA7",
  "explorer.defaultOpen": "\u9ED8\u8BA4\u5C55\u5F00",
  "explorer.gitignore": "\u9075\u5FAA .gitignore",
  "explorer.preview": "\u9884\u89C8",
  "explorer.changes": "\u6539\u52A8",
  "explorer.files": "\u6587\u4EF6",
  "explorer.noRepo": "\u4E0D\u662F git \u4ED3\u5E93\u3002",
  "explorer.noChanges": "\u6CA1\u6709\u672A\u63D0\u4EA4\u7684\u6539\u52A8\u3002",
  "explorer.workspace": "\u5DE5\u4F5C\u533A",
  "explorer.up": "\u2039 \u4E0A\u4E00\u7EA7",
  "explorer.truncated": "\u2026\u6761\u76EE\u8D85\u8FC7\u914D\u7F6E\u4E0A\u9650\uFF0C\u7F29\u5C0F\u8DEF\u5F84\u8303\u56F4\u624D\u80FD\u770B\u5230\u5176\u4F59\u7684\u3002",
  "explorer.noDiff": "\uFF08\u6CA1\u6709\u6587\u672C\u5DEE\u5F02\uFF09",
  "explorer.diffFailed": "\u8BFB\u4E0D\u51FA\u5DEE\u5F02\uFF1A{message}",
  "explorer.title": "\u9879\u76EE",
  "explorer.off": "\u9879\u76EE\u6D4F\u89C8\u5DF2\u5173\u95ED\u3002",
  "change.untracked": "\u672A\u8DDF\u8E2A",
  "change.modified": "\u5DF2\u4FEE\u6539",
  "change.modifiedStaged": "\u5DF2\u4FEE\u6539\u5E76\u6682\u5B58",
  "change.added": "\u65B0\u589E",
  "change.deleted": "\u5DF2\u5220\u9664",
  "change.renamed": "\u5DF2\u91CD\u547D\u540D",
  "change.copied": "\u5DF2\u590D\u5236",
  "change.conflicted": "\u6709\u51B2\u7A81",
  "change.typeChanged": "\u7C7B\u578B\u53D8\u66F4",
  "change.staged": "\u5DF2\u6682\u5B58",
  "change.changed": "\u6709\u53D8\u52A8",
  "sessions.trash": "\u4F7F\u7528\u56DE\u6536\u7AD9",
  "sessions.trash.hint": "\u5173\u95ED\u540E\u5220\u9664\u4F1A\u7ACB\u5373\u79FB\u9664\u8BB0\u5F55\u6587\u4EF6\u3002",
  "sessions.gc": "\u6E05\u7406\u65E0\u7528\u9644\u4EF6",
  "sessions.gc.hint": "\u6C38\u4E45\u5220\u9664\u65F6\uFF0C\u5148\u626B\u63CF\u5176\u4F59\u6240\u6709\u4F1A\u8BDD\u518D\u79FB\u9664\u56FE\u7247\u6587\u4EF6\u3002\u5386\u53F2\u5F88\u5927\u65F6\u4F1A\u6162\u3002",
  "sessions.stored": "\u5DF2\u5B58\u4F1A\u8BDD",
  "sessions.none": "\u6CA1\u6709\u5DF2\u5B58\u4F1A\u8BDD\u3002",
  "sessions.confirmTrash": "\u79FB\u5230\u56DE\u6536\u7AD9\uFF1F",
  "sessions.confirmDelete": "\u6C38\u4E45\u5220\u9664\uFF1F",
  "sessions.movedToTrash": "\u5DF2\u79FB\u5230\u56DE\u6536\u7AD9\u3002\u4FA7\u680F\u5217\u8868\u5728\u91CD\u65B0\u52A0\u8F7D\u540E\u5237\u65B0\u3002",
  "sessions.deleted": "\u5DF2\u5220\u9664\u3002\u4FA7\u680F\u5217\u8868\u5728\u91CD\u65B0\u52A0\u8F7D\u540E\u5237\u65B0\u3002",
  "sessions.restored": "\u5DF2\u6062\u590D\u3002\u91CD\u65B0\u52A0\u8F7D\u5373\u53EF\u5728\u4FA7\u680F\u770B\u5230\u3002",
  "sessions.trashCount": "\u56DE\u6536\u7AD9\uFF08{n}\uFF09",
  "sessions.emptyTrash": "\u6E05\u7A7A\u56DE\u6536\u7AD9",
  "sessions.deleteForever": "\u6C38\u4E45\u5220\u9664",
  "sessions.deletedAt": "\u5220\u9664\u4E8E {when}",
  "sessions.off": "\u4F1A\u8BDD\u7BA1\u7406\u5DF2\u5173\u95ED\u3002",
  "plugins.list": "\u5DF2\u88C5\u63D2\u4EF6\u4E0E\u6551\u63F4",
  "plugins.none": "\u6CA1\u6709\u5B89\u88C5\u7B2C\u4E09\u65B9\u63D2\u4EF6\u3002",
  "plugins.quarantined": "\u5DF2\u9694\u79BB",
  "plugins.quarantinedCount": "\u6709 {n} \u4E2A\u63D2\u4EF6\u88AB\u9694\u79BB\uFF0C\u4E0B\u6B21\u542F\u52A8\u4E0D\u4F1A\u52A0\u8F7D\u3002",
  "plugins.enable": "\u542F\u7528",
  "plugins.disable": "\u7981\u7528",
  "plugins.enableAll": "\u542F\u7528\u6240\u6709\u88AB\u9694\u79BB\u7684\u63D2\u4EF6",
  "plugins.rescueTitle": "\u5982\u679C harness \u8D77\u4E0D\u6765",
  "plugins.rescueBody": "\u8FD9\u4E2A\u9875\u9762\u672C\u8EAB\u4E5F\u5728\u540C\u4E00\u68F5\u63D2\u4EF6\u6811\u91CC\uFF0C\u6240\u4EE5\u4E00\u65E6\u67D0\u4E2A\u63D2\u4EF6\u8BA9\u542F\u52A8\u5931\u8D25\uFF0C\u5B83\u5C31\u5E2E\u4E0D\u4E0A\u5FD9\u4E86\u3002dsh-ext \u547D\u4EE4\u968F\u672C\u63D2\u4EF6\u4E00\u8D77\u5B89\u88C5\uFF0C\u4E13\u4E3A\u8FD9\u79CD\u60C5\u51B5\u51C6\u5907\uFF0C\u8FD0\u884C\u65F6\u4E0D\u4F9D\u8D56 harness\uFF1A",
  "plugins.rescueFile": "\u9694\u79BB\u8BB0\u5F55\u5199\u5728 {file} \u7684 disable \u884C\u91CC\uFF0C\u542F\u52A8\u5668\u4F1A\u5728\u6240\u6709 bundle \u5C42\u4E4B\u540E\u518D\u5408\u6210\u8FD9\u4E00\u5C42 \u2014\u2014 \u6240\u4EE5 disable \u884C\u4E00\u5B9A\u751F\u6548\uFF0C\u542F\u52A8\u65F6\u4E0D\u9700\u8981\u52A0\u4EFB\u4F55\u53C2\u6570\u3002\u4F60\u81EA\u5DF1\u5199\u5728\u90A3\u4E2A\u6587\u4EF6\u91CC\u7684\u6761\u76EE\u4E0D\u4F1A\u88AB\u52A8\u3002",
  "plugins.off": "\u63D2\u4EF6\u5B89\u5168\u5DF2\u5173\u95ED\u3002",
  "cp.snapshotOn": "\u5FEB\u7167\u65F6\u673A",
  "cp.snapshotOn.turn": "\u6BCF\u8F6E\u5BF9\u8BDD",
  "cp.snapshotOn.tool": "\u6BCF\u6B21\u6539\u52A8\u6587\u4EF6\u7684\u5DE5\u5177\u8C03\u7528",
  "cp.retention": "\u4FDD\u7559\u671F",
  "cp.retention.hint": "\u63D2\u4EF6\u52A0\u8F7D\u65F6\u4F1A\u6E05\u6389\u65E9\u4E8E\u8FD9\u4E2A\u671F\u9650\u7684\u68C0\u67E5\u70B9\u30020 \u8868\u793A\u5168\u90E8\u4FDD\u7559\u3002",
  "cp.maxSize": "\u8DF3\u8FC7\u5927\u4E8E",
  "cp.list": "\u68C0\u67E5\u70B9\u4E0E\u6062\u590D",
  "cp.take": "\u7ACB\u5373\u521B\u5EFA\u68C0\u67E5\u70B9",
  "cp.none": "\u8FD9\u4E2A\u5DE5\u4F5C\u533A\u8FD8\u6CA1\u6709\u4EFB\u4F55\u68C0\u67E5\u70B9\u3002agent \u7B2C\u4E00\u6B21\u6539\u6587\u4EF6\u4E4B\u524D\u4F1A\u81EA\u52A8\u8BB0\u4E00\u4E2A\u3002",
  "cp.diff": "\u5DEE\u5F02",
  "cp.restore": "\u6062\u590D\u2026",
  "cp.baseline": "\u57FA\u7EBF",
  "cp.noLabel": "\uFF08\u65E0\u6807\u7B7E\uFF09",
  "cp.restoreTitle": "\u6062\u590D\u5230\u68C0\u67E5\u70B9 {id}\uFF1F",
  "cp.restoreNoop": "\u4F60\u7684\u5DE5\u4F5C\u533A\u5DF2\u7ECF\u548C\u8FD9\u4E2A\u68C0\u67E5\u70B9\u4E00\u81F4\uFF0C\u4E0D\u4F1A\u6709\u4EFB\u4F55\u53D8\u5316\u3002",
  "cp.restoreCount": "\u5C06\u5199\u5165\u6216\u5220\u9664 {n} \u4E2A\u6587\u4EF6\u3002\u4F60\u81EA\u5DF1\u7684 git \u5386\u53F2\u3001\u7D22\u5F15\u548C stash \u4E0D\u4F1A\u88AB\u89E6\u78B0\u3002",
  "cp.unprotected": "\u5176\u4E2D {n} \u4E2A\u6CA1\u6709\u88AB\u4F60\u7684 git \u8DDF\u8E2A\uFF0C\u4E5F\u5C31\u662F\u8BF4\u8FD9\u4EFD\u5DE5\u4F5C\u526F\u672C\u662F\u552F\u4E00\u7684\u4E00\u4EFD\uFF1A",
  "cp.andMore": "\u2026\u8FD8\u6709 {n} \u4E2A",
  "cp.restoring": "\u6B63\u5728\u6062\u590D\u2026",
  "cp.restored": "\u5DF2\u6062\u590D\u3002\u6062\u590D\u524D\u5148\u8BB0\u4E86\u4E00\u4E2A\u68C0\u67E5\u70B9\uFF0C\u6240\u4EE5\u8FD9\u4E00\u6B65\u53EF\u4EE5\u64A4\u9500\u3002",
  "cp.previewFailed": "\u7B97\u4E0D\u51FA\u8FD9\u6B21\u6062\u590D\u4F1A\u6539\u52A8\u4EC0\u4E48\uFF1A{message}",
  "cp.emptyDiff": "\uFF08\u8FD9\u4E2A\u68C0\u67E5\u70B9\u6CA1\u6709\u6587\u672C\u53D8\u5316\uFF09",
  "cp.checkpointN": "\u68C0\u67E5\u70B9 {id}",
  "cp.off": "\u68C0\u67E5\u70B9\u5DF2\u5173\u95ED\u3002",
  "cp.justNow": "\u521A\u521A",
  "cp.minsAgo": "{n} \u5206\u949F\u524D",
  "cp.hoursAgo": "{n} \u5C0F\u65F6\u524D",
  "cp.unknownTime": "\u65F6\u95F4\u672A\u77E5"
};
var DICTS = { en, zh };

// src/client/use-locale.ts
function runtime() {
  const holder = globalThis;
  return holder.__dshLocale__;
}
function provideLocale(face) {
  ;
  globalThis.__dshLocale__ = face;
}
var NO_SUBSCRIBE = () => () => {
};
function useLocaleId() {
  const face = runtime();
  const id = (0, import_react5.useSyncExternalStore)(
    face === void 0 ? NO_SUBSCRIBE : (fn) => face.subscribe(fn),
    () => {
      const active = face?.getLocale()?.id;
      return typeof active === "string" ? active : documentLanguage();
    },
    () => documentLanguage()
  );
  return id.toLowerCase().startsWith("zh") ? "zh" : "en";
}
function documentLanguage() {
  try {
    return document.documentElement.lang || "en";
  } catch {
    return "en";
  }
}
function interpolate(text, values) {
  if (values === void 0) return text;
  return text.replace(/\{(\w+)\}/g, (whole, key) => {
    const value = values[key];
    return value === void 0 ? whole : String(value);
  });
}
function translate(key, values) {
  const active = runtime()?.getLocale()?.id;
  const id = typeof active === "string" ? active : documentLanguage();
  const dict = id.toLowerCase().startsWith("zh") ? zh : en;
  return interpolate(dict[key] ?? en[key] ?? key, values);
}
function useT() {
  const locale = useLocaleId();
  const dict = locale === "zh" ? zh : en;
  return (key, values) => interpolate(dict[key] ?? en[key] ?? key, values);
}

// src/client/BalanceView.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function BalanceCard(props) {
  const t = useT();
  const view = useResource("/balance", props.enabled);
  if (!props.enabled) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("section.balance") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    view.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Notice, { kind: "error", children: view.error }),
    view.data === void 0 && view.error === void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("balance.reading") }),
    view.data !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      !view.data.available && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Notice, { kind: "error", children: t("balance.unavailable") }),
      view.data.rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("balance.noRows") }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("table", { style: { borderCollapse: "collapse", fontSize: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("tr", { children: [t("balance.currency"), t("balance.total"), t("balance.granted"), t("balance.toppedUp")].map((heading) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "th",
          {
            style: { textAlign: "left", fontWeight: 500, fontSize: 11, color: token.textMuted, padding: "0 12px 4px 0" },
            children: heading
          },
          heading
        )) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("tbody", { children: view.data.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { style: { padding: "2px 12px 2px 0" }, children: row.currency }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { style: { padding: "2px 12px 2px 0", color: token.accent }, children: row.totalBalance }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { style: { padding: "2px 12px 2px 0", color: token.textMuted }, children: row.grantedBalance }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { style: { padding: "2px 12px 2px 0", color: token.textMuted }, children: row.toppedUpBalance })
        ] }, row.currency)) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { fontSize: 10, color: token.textMuted }, children: [
          new Date(view.data.fetchedAt).toLocaleTimeString(),
          " \xB7 ",
          t("balance.keyFrom", { source: view.data.credentialSource })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { flex: 1 } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", onClick: view.reload, style: { ...buttonStyle, fontSize: 11 }, children: t("common.refresh") })
      ] })
    ] })
  ] });
}
function BalanceBadge() {
  const view = useResource("/balance");
  const primary = view.data?.rows[0];
  if (primary === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "span",
    {
      "data-dsh-plugin": "dsh-dev-tool-ext",
      "data-dsh-part": "balance-badge",
      title: `DeepSeek balance \xB7 key from ${view.data?.credentialSource ?? "unknown source"}`,
      style: {
        fontSize: 11,
        color: view.data?.available === false ? token.danger : token.textMuted,
        padding: "2px 6px",
        border: `1px solid ${token.border}`,
        borderRadius: 999,
        whiteSpace: "nowrap"
      },
      children: [
        primary.totalBalance,
        " ",
        primary.currency
      ]
    }
  );
}

// src/client/AuditPanel.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var VERDICT_COLOUR = {
  allow: "textMuted",
  ask: "accent",
  deny: "danger"
};
function AuditPanel(props) {
  const t = useT();
  const view = useResource("/review/audit", props.enabled);
  const command = useCommand(view.reload);
  if (!props.enabled) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("review.off") });
  }
  const entries = view.data?.entries ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    view.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Notice, { kind: "error", children: view.error }),
    command.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Notice, { kind: "error", children: command.error }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { fontSize: 11, color: token.textMuted }, children: entries.length === 0 ? t("review.empty") : t("review.count", { n: entries.length }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { flex: 1 } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: view.reload, style: { ...buttonStyle, fontSize: 11 }, children: t("common.refresh") }),
      entries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          disabled: command.busy,
          onClick: () => {
            void command.run("/review/audit/clear");
          },
          style: { ...buttonStyle, fontSize: 11 },
          children: t("common.clear")
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflow: "auto" }, children: entries.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "li",
      {
        style: { borderBottom: `1px solid ${token.border}`, paddingBottom: 4 },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "baseline" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { fontSize: 11, fontWeight: 600, color: token[VERDICT_COLOUR[entry.verdict]] }, children: entry.verdict }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { style: { fontSize: 10, color: token.textMuted }, children: entry.tool }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { flex: 1 } }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { style: { fontSize: 10, color: token.textMuted }, children: [
              entry.decidedBy,
              " \xB7 ",
              new Date(entry.at).toLocaleTimeString()
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("pre", { style: {
            margin: "2px 0 0",
            fontSize: 11,
            lineHeight: 1.4,
            fontFamily: "ui-monospace, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: token.text
          }, children: entry.command }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 11, color: token.textMuted }, children: entry.reason }),
          entry.matched !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { fontSize: 10, color: token.textMuted }, children: [
            t("review.matched"),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: entry.matched })
          ] })
        ]
      },
      `${entry.at}-${index}`
    )) })
  ] });
}

// src/client/SessionsPanel.tsx
var import_react6 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
function size(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function stamp(at) {
  return Number.isFinite(at) && at > 0 ? new Date(at).toLocaleString() : "unknown";
}
function SessionsPanel(props) {
  const t = useT();
  const list = useResource("/sessions", props.enabled);
  const command = useCommand(list.reload);
  const [confirming, setConfirming] = (0, import_react6.useState)(void 0);
  const [note, setNote] = (0, import_react6.useState)(void 0);
  if (!props.enabled) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("sessions.off") });
  }
  const trash = list.data?.trash ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    list.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Notice, { kind: "error", children: list.error }),
    command.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Notice, { kind: "error", children: command.error }),
    note !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Notice, { kind: "info", children: note }),
    list.data === void 0 && list.error === void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("common.loading") }),
    list.data !== void 0 && list.data.sessions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("sessions.none") }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0 }, children: (list.data?.sessions ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "li",
      {
        style: { display: "flex", gap: 8, alignItems: "baseline", padding: "5px 2px", borderBottom: `1px solid ${token.border}` },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 12, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: row.title }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { fontSize: 10, color: token.textMuted }, children: [
              stamp(row.updatedAt),
              " \xB7 ",
              size(row.sizeBytes),
              row.workspace !== void 0 && ` \xB7 ${row.workspace}`
            ] })
          ] }),
          confirming === row.id ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 11, color: token.danger }, children: t(props.trashEnabled ? "sessions.confirmTrash" : "sessions.confirmDelete") }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              "button",
              {
                type: "button",
                disabled: command.busy,
                onClick: () => {
                  void command.run("/sessions/delete", { sessionId: row.id }).then((ok) => {
                    setConfirming(void 0);
                    if (ok) {
                      setNote(props.trashEnabled ? t("sessions.movedToTrash") : t("sessions.deleted"));
                    }
                  });
                },
                style: { ...buttonStyle, fontSize: 11, borderColor: token.danger, color: token.danger },
                children: t("common.yes")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", onClick: () => {
              setConfirming(void 0);
            }, style: { ...buttonStyle, fontSize: 11 }, children: t("common.no") })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              disabled: command.busy,
              onClick: () => {
                setConfirming(row.id);
              },
              style: { ...buttonStyle, fontSize: 11 },
              children: t("common.delete")
            }
          )
        ]
      },
      row.id
    )) }),
    trash.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { paddingTop: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { style: { fontSize: 12 }, children: t("sessions.trashCount", { n: trash.length }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { flex: 1 } }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            disabled: command.busy,
            onClick: () => {
              void command.run("/sessions/trash/purge", { all: true });
            },
            style: { ...buttonStyle, fontSize: 11, borderColor: token.danger, color: token.danger },
            children: t("sessions.emptyTrash")
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ul", { style: { listStyle: "none", margin: "4px 0 0", padding: 0 }, children: trash.map((row) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("li", { style: { display: "flex", gap: 8, alignItems: "baseline", padding: "4px 2px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 12, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: row.title }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { fontSize: 10, color: token.textMuted }, children: [
            t("sessions.deletedAt", { when: stamp(row.deletedAt) }),
            " \xB7 ",
            size(row.sizeBytes)
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            disabled: command.busy,
            onClick: () => {
              void command.run("/sessions/restore", { trashId: row.id }).then((ok) => {
                if (ok) setNote(t("sessions.restored"));
              });
            },
            style: { ...buttonStyle, fontSize: 11 },
            children: t("common.restore")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            disabled: command.busy,
            onClick: () => {
              void command.run("/sessions/trash/purge", { trashId: row.id });
            },
            style: { ...buttonStyle, fontSize: 11 },
            children: t("sessions.deleteForever")
          }
        )
      ] }, row.id)) })
    ] })
  ] });
}

// src/client/PluginsPanel.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function PluginsPanel(props) {
  const t = useT();
  const view = useResource("/plugins", props.enabled);
  const command = useCommand(view.reload);
  if (!props.enabled) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("plugins.off") });
  }
  const plugins = view.data?.plugins ?? [];
  const third = plugins.filter((row) => !row.builtin);
  const quarantined = view.data?.quarantine ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    view.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Notice, { kind: "error", children: view.error }),
    command.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Notice, { kind: "error", children: command.error }),
    quarantined.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Notice, { kind: "info", children: t("plugins.quarantinedCount", { n: quarantined.length }) }),
    third.length === 0 && view.data !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("plugins.none") }),
    third.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0 }, children: third.map((row) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
      "li",
      {
        style: { display: "flex", gap: 8, alignItems: "center", padding: "5px 2px", borderBottom: `1px solid ${token.border}` },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontSize: 12, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: row.name }),
            row.version !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontSize: 10, color: token.textMuted }, children: row.version })
          ] }),
          row.quarantined && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontSize: 10, color: token.danger }, children: t("plugins.quarantined") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "button",
            {
              type: "button",
              disabled: command.busy,
              onClick: () => {
                void command.run("/plugins/quarantine", { row: row.name, quarantined: !row.quarantined });
              },
              style: {
                ...buttonStyle,
                fontSize: 11,
                borderColor: row.quarantined ? token.border : token.danger,
                color: row.quarantined ? token.text : token.danger
              },
              children: row.quarantined ? t("plugins.enable") : t("plugins.disable")
            }
          )
        ]
      },
      row.name
    )) }),
    quarantined.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        type: "button",
        disabled: command.busy,
        onClick: () => {
          void command.run("/plugins/quarantine/clear");
        },
        style: { ...buttonStyle, alignSelf: "flex-start", fontSize: 11 },
        children: t("plugins.enableAll")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { border: `1px solid ${token.border}`, borderRadius: 6, padding: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { style: { fontSize: 12 }, children: t("plugins.rescueTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { style: { fontSize: 12, color: token.textMuted, margin: "6px 0" }, children: t("plugins.rescueBody") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { style: {
        ...inputStyle,
        margin: 0,
        padding: 8,
        fontSize: 11,
        lineHeight: 1.6,
        fontFamily: "ui-monospace, monospace",
        whiteSpace: "pre-wrap"
      }, children: `npx dsh-plugin-dev-tool-ext dsh-ext safe      # start without any third-party plugin
npx dsh-plugin-dev-tool-ext dsh-ext skip <name>   # skip one plugin
npx dsh-plugin-dev-tool-ext dsh-ext uninstall <name>
npx dsh-plugin-dev-tool-ext dsh-ext restore       # re-enable everything` }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { style: { fontSize: 11, color: token.textMuted, margin: "6px 0 0" }, children: t("plugins.rescueFile", { file: view.data?.quarantineFile ?? "$DSH_HOME/cordis.patch.yml" }) })
    ] })
  ] });
}

// src/client/EffortsPanel.tsx
var import_react7 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function toDraft(rungs) {
  return rungs.map((rung) => ({ id: rung.id, wire: rung.wire ?? "" }));
}
function ModelEditor(props) {
  const [rungs, setRungs] = (0, import_react7.useState)(() => toDraft(
    props.initial.length > 0 ? props.initial : DEFAULT_EFFORT_LADDER
  ));
  const t = useT();
  const [error, setError] = (0, import_react7.useState)(void 0);
  const [busy, setBusy] = (0, import_react7.useState)(false);
  const save = (0, import_react7.useCallback)(async (efforts) => {
    setBusy(true);
    setError(void 0);
    const result = await callApi("/efforts/set", {
      method: "POST",
      body: { provider: props.provider, model: props.model, efforts, expectedRevision: props.revision }
    });
    setBusy(false);
    if (result.ok) {
      props.onSaved();
      props.onClose();
    } else {
      setError(result.message);
    }
  }, [props]);
  const available = THINKING_LEVELS.filter((level) => !rungs.some((rung) => rung.id === level));
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: `1px solid ${token.accent}`, borderRadius: 6, padding: 10, margin: "4px 0" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { style: { fontSize: 12 }, children: props.model }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: { fontSize: 11, color: token.textMuted, margin: "4px 0 8px" }, children: t("effort.explain") }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { style: { textAlign: "left", fontWeight: 500, fontSize: 11, color: token.textMuted, padding: "0 0 4px" }, children: t("effort.level") }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { style: { textAlign: "left", fontWeight: 500, fontSize: 11, color: token.textMuted, padding: "0 0 4px" }, children: t("effort.sentAs") }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", {})
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tbody", { children: rungs.map((rung, index) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { style: { padding: "2px 6px 2px 0" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("code", { children: rung.id }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { style: { padding: "2px 6px 2px 0" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            type: "text",
            value: rung.wire,
            placeholder: rung.id === "off" ? t("effort.sendNothing") : t("effort.required"),
            "aria-label": `Wire value for ${rung.id}`,
            disabled: props.disabled || busy,
            onChange: (event) => {
              const next = [...rungs];
              const target = next[index];
              if (target === void 0) return;
              next[index] = { ...target, wire: event.currentTarget.value };
              setRungs(next);
            },
            style: {
              font: "inherit",
              fontSize: 12,
              width: "100%",
              color: token.text,
              background: "transparent",
              border: `1px solid ${token.border}`,
              borderRadius: 4,
              padding: "2px 6px"
            }
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { style: { padding: "2px 0", textAlign: "right" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            disabled: props.disabled || busy,
            onClick: () => {
              setRungs(rungs.filter((_, at) => at !== index));
            },
            style: { ...buttonStyle, fontSize: 11 },
            children: t("effort.remove")
          }
        ) })
      ] }, rung.id)) })
    ] }),
    available.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 11, color: token.textMuted, alignSelf: "center" }, children: t("effort.add") }),
      available.map((level) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          type: "button",
          disabled: props.disabled || busy,
          onClick: () => {
            const known = DEFAULT_EFFORT_LADDER.find((rung) => rung.id === level);
            const next = [...rungs, { id: level, wire: known?.wire ?? (level === "off" ? "" : level) }];
            next.sort((a, b) => THINKING_LEVELS.indexOf(a.id) - THINKING_LEVELS.indexOf(b.id));
            setRungs(next);
          },
          style: { ...buttonStyle, fontSize: 11 },
          children: level
        },
        level
      ))
    ] }),
    error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { paddingTop: 8 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Notice, { kind: "error", children: error }) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 6, marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          type: "button",
          disabled: props.disabled || busy,
          onClick: () => {
            void save(rungs.map((rung) => ({ id: rung.id, wire: rung.wire.length === 0 ? null : rung.wire })));
          },
          style: { ...buttonStyle, borderColor: token.accent, color: token.accent },
          children: busy ? t("common.loading") : t("common.save")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          type: "button",
          disabled: props.disabled || busy,
          onClick: () => {
            void save(false);
          },
          title: t("effort.noReasoning.hint"),
          style: buttonStyle,
          children: t("effort.noReasoning")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          type: "button",
          disabled: props.disabled || busy,
          onClick: () => {
            void save(void 0);
          },
          title: t("effort.reset.hint"),
          style: buttonStyle,
          children: t("common.reset")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { flex: 1 } }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", disabled: busy, onClick: props.onClose, style: buttonStyle, children: t("common.close") })
    ] })
  ] });
}
function EffortsPanel(props) {
  const t = useT();
  const view = useResource("/efforts", props.enabled);
  const [editing, setEditing] = (0, import_react7.useState)(void 0);
  const [busyVision, setBusyVision] = (0, import_react7.useState)(void 0);
  const [visionError, setVisionError] = (0, import_react7.useState)(void 0);
  const toggleVision = (0, import_react7.useCallback)(async (provider, model, next) => {
    setBusyVision(model);
    setVisionError(void 0);
    const result = await callApi("/vision/set", {
      method: "POST",
      body: { provider, model, vision: next, expectedRevision: view.data?.revision }
    });
    setBusyVision(void 0);
    if (result.ok) view.reload();
    else setVisionError(result.message);
  }, [view]);
  if (!props.enabled) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("section.effort") });
  }
  const providers = view.data?.providers ?? [];
  const readOnly = view.data?.writable === false;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    view.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Notice, { kind: "error", children: view.error }),
    readOnly && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Notice, { kind: "info", children: t("effort.readonly") }),
    visionError !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Notice, { kind: "error", children: visionError }),
    view.data !== void 0 && providers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("effort.none") }),
    providers.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "baseline", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { style: { fontSize: 12 }, children: provider.displayName }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("code", { style: { fontSize: 10, color: token.textMuted }, children: provider.provider }),
        !provider.live && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 10, color: token.textMuted }, children: t("effort.notLoaded") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { style: { listStyle: "none", margin: "4px 0 0", padding: 0 }, children: provider.models.map((model) => {
        const isEditing = editing?.provider === provider.provider && editing.model === model.id;
        const declared = model.overrideEfforts.length > 0;
        const inherited = model.adapterEfforts.length > 0;
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("li", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", padding: "3px 2px", borderBottom: `1px solid ${token.border}` }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { flex: 1, minWidth: 0, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: model.id }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 10, color: token.textMuted, flex: "0 0 auto" }, children: declared ? model.overrideEfforts.map((rung) => rung.id).join(" \xB7 ") : inherited ? t("effort.fromAdapter", { list: model.adapterEfforts.map((rung) => rung.id).join(" \xB7 ") }) : t("effort.noEfforts") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "button",
              {
                type: "button",
                disabled: readOnly || busyVision === model.id,
                title: t("vision.hint"),
                onClick: () => {
                  void toggleVision(provider.provider, model.id, model.vision !== true);
                },
                style: {
                  ...buttonStyle,
                  fontSize: 11,
                  borderColor: model.vision === true ? token.accent : token.border,
                  color: model.vision === true ? token.accent : token.textMuted
                },
                children: model.vision === true ? t("vision.on") : t("vision.off")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "button",
              {
                type: "button",
                onClick: () => {
                  setEditing(isEditing ? void 0 : { provider: provider.provider, model: model.id });
                },
                style: { ...buttonStyle, fontSize: 11 },
                children: isEditing ? t("common.close") : declared ? t("effort.edit") : t("effort.declare")
              }
            )
          ] }),
          isEditing && view.data !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            ModelEditor,
            {
              provider: provider.provider,
              model: model.id,
              initial: model.overrideEfforts,
              revision: view.data.revision,
              disabled: readOnly,
              onSaved: view.reload,
              onClose: () => {
                setEditing(void 0);
              }
            }
          )
        ] }, model.id);
      }) })
    ] }, provider.provider))
  ] });
}

// src/client/CheckpointsPanel.tsx
var import_react8 = require("react");
var import_jsx_runtime7 = require("react/jsx-runtime");
function when(at, relative) {
  if (!Number.isFinite(at) || at <= 0) return "\u2014";
  const date = new Date(at);
  const elapsed = Date.now() - at;
  if (elapsed < 6e4) return relative.justNow;
  if (elapsed < 36e5) return relative.mins(Math.round(elapsed / 6e4));
  if (elapsed < 864e5) return relative.hours(Math.round(elapsed / 36e5));
  return date.toLocaleString();
}
function CheckpointsPanel(props) {
  const t = useT();
  const relative = {
    justNow: t("cp.justNow"),
    mins: (n) => t("cp.minsAgo", { n }),
    hours: (n) => t("cp.hoursAgo", { n })
  };
  const scope = props.sessionId === void 0 ? "" : `?session=${encodeURIComponent(props.sessionId)}`;
  const list = useResource(`/checkpoints${scope}`, props.enabled);
  const command = useCommand(list.reload);
  const [pending, setPending] = (0, import_react8.useState)(void 0);
  const [previewing, setPreviewing] = (0, import_react8.useState)(false);
  const [diff, setDiff] = (0, import_react8.useState)(void 0);
  const [note, setNote] = (0, import_react8.useState)(void 0);
  const askPreview = (0, import_react8.useCallback)(async (id) => {
    setPreviewing(true);
    setNote(void 0);
    const result = await callApi(`/checkpoints/preview?id=${encodeURIComponent(id)}`);
    setPreviewing(false);
    if (result.ok) setPending(result.value);
    else setNote(t("cp.previewFailed", { message: result.message }));
  }, []);
  const confirmRestore = (0, import_react8.useCallback)(async () => {
    if (pending === void 0) return;
    const ok = await command.run("/checkpoints/restore", {
      id: pending.checkpointId,
      session: props.sessionId,
      confirm: true
    });
    if (ok) {
      setNote(t("cp.restored"));
      setPending(void 0);
    }
  }, [command, pending, props.sessionId]);
  const showDiff = (0, import_react8.useCallback)(async (id) => {
    setDiff({ id, patch: "Loading\u2026" });
    const result = await callApi(`/checkpoints/diff?id=${encodeURIComponent(id)}`);
    setDiff({
      id,
      patch: result.ok ? result.value.patch.length === 0 ? t("cp.emptyDiff") : result.value.patch : `Could not read the diff: ${result.message}`
    });
  }, []);
  if (!props.enabled) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("cp.off") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { "data-dsh-plugin": "dsh-dev-tool-ext", "data-dsh-part": "checkpoints", style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "button",
        {
          type: "button",
          disabled: command.busy,
          onClick: () => {
            void command.run("/checkpoints/snapshot", { session: props.sessionId, label: "manual checkpoint" });
          },
          style: buttonStyle,
          children: t("cp.take")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { flex: 1 } }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", onClick: list.reload, style: { ...buttonStyle, fontSize: 11 }, children: t("common.refresh") })
    ] }),
    list.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Notice, { kind: "error", children: list.error }),
    command.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Notice, { kind: "error", children: command.error }),
    note !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Notice, { kind: "info", children: note }),
    pending !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { border: `1px solid ${token.danger}`, borderRadius: 6, padding: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { style: { fontSize: 12, color: token.text }, children: t("cp.restoreTitle", { id: pending.checkpointId.slice(0, 8) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { fontSize: 12, color: token.textMuted, margin: "6px 0" }, children: pending.affected.length === 0 ? t("cp.restoreNoop") : t("cp.restoreCount", { n: pending.affected.length }) }),
      pending.unprotected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { margin: "6px 0" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { fontSize: 12, color: token.danger }, children: t("cp.unprotected", { n: pending.unprotected.length }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("ul", { style: { margin: "4px 0 0", paddingLeft: 18, fontSize: 11, color: token.textMuted, maxHeight: 120, overflow: "auto" }, children: [
          pending.unprotected.slice(0, 40).map((path) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("li", { children: path }, path)),
          pending.unprotected.length > 40 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("li", { children: t("cp.andMore", { n: pending.unprotected.length - 40 }) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", gap: 6, marginTop: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            type: "button",
            disabled: command.busy,
            onClick: () => {
              void confirmRestore();
            },
            style: { ...buttonStyle, borderColor: token.danger, color: token.danger },
            children: command.busy ? t("cp.restoring") : t("common.restore")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", onClick: () => {
          setPending(void 0);
        }, style: buttonStyle, children: t("common.cancel") })
      ] })
    ] }),
    list.data?.exists === false && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Notice, { kind: "info", children: t("cp.none") }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }, children: (list.data?.checkpoints ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
      "li",
      {
        style: {
          display: "flex",
          gap: 8,
          alignItems: "baseline",
          padding: "4px 2px",
          borderBottom: `1px solid ${token.border}`
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", { style: { fontSize: 11, color: token.accent, flex: "0 0 auto" }, children: row.id.slice(0, 8) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { style: { flex: 1, minWidth: 0, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
            row.label.length === 0 ? t("cp.noLabel") : row.label,
            row.baseline && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { style: { color: token.textMuted }, children: [
              " \xB7 ",
              t("cp.baseline")
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { fontSize: 10, color: token.textMuted, flex: "0 0 auto" }, children: when(row.at, relative) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", onClick: () => {
            void showDiff(row.id);
          }, style: { ...buttonStyle, fontSize: 11 }, children: t("cp.diff") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              type: "button",
              disabled: previewing || command.busy,
              onClick: () => {
                void askPreview(row.id);
              },
              style: { ...buttonStyle, fontSize: 11 },
              children: t("cp.restore")
            }
          )
        ]
      },
      row.id
    )) }),
    diff !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { borderTop: `1px solid ${token.border}`, paddingTop: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { style: { fontSize: 11 }, children: t("cp.checkpointN", { id: diff.id.slice(0, 8) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { flex: 1 } }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", onClick: () => {
          setDiff(void 0);
        }, style: { ...buttonStyle, fontSize: 11 }, children: t("common.close") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("pre", { style: {
        margin: 0,
        maxHeight: 260,
        overflow: "auto",
        fontSize: 11,
        lineHeight: 1.45,
        fontFamily: "ui-monospace, monospace",
        color: token.text
      }, children: diff.patch })
    ] })
  ] });
}

// src/client/ExplorerPanel.tsx
var import_react9 = require("react");
var import_jsx_runtime8 = require("react/jsx-runtime");
function formatSize(bytes) {
  if (bytes === void 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function describeChange(change, t) {
  if (change.untracked) return t("change.untracked");
  const letter = change.staged ? change.index : change.worktree;
  switch (letter) {
    case "M":
      return t(change.staged ? "change.modifiedStaged" : "change.modified");
    case "A":
      return t("change.added");
    case "D":
      return t("change.deleted");
    case "R":
      return t("change.renamed");
    case "C":
      return t("change.copied");
    case "U":
      return t("change.conflicted");
    case "T":
      return t("change.typeChanged");
    default:
      return t(change.staged ? "change.staged" : "change.changed");
  }
}
function ChangeList(props) {
  const t = useT();
  const { status } = props;
  if (!status.isRepository) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 12, color: token.textMuted, padding: "8px 0" }, children: t("explorer.noRepo") });
  }
  if (status.changes.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 12, color: token.textMuted, padding: "8px 0" }, children: t("explorer.noChanges") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0 }, children: status.changes.map((change) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    "button",
    {
      type: "button",
      onClick: () => {
        props.onOpenDiff(change);
      },
      style: {
        ...buttonStyle,
        display: "flex",
        width: "100%",
        gap: 8,
        alignItems: "baseline",
        border: "none",
        background: "transparent",
        textAlign: "left",
        padding: "3px 4px"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          "span",
          {
            "aria-hidden": "true",
            style: {
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              color: change.untracked ? token.textMuted : token.accent,
              flex: "0 0 auto"
            },
            children: [
              change.index,
              change.worktree
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
          change.from !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { style: { color: token.textMuted }, children: [
            change.from,
            " \u2192 "
          ] }),
          change.path
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { fontSize: 10, color: token.textMuted, flex: "0 0 auto" }, children: describeChange(change, t) })
      ]
    }
  ) }, `${change.index}${change.worktree} ${change.path}`)) });
}
function Tree(props) {
  const t = useT();
  const [path, setPath] = (0, import_react9.useState)("");
  const scope = [
    props.workspace === void 0 ? void 0 : `&workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === void 0 ? void 0 : `&session=${encodeURIComponent(props.sessionId)}`
  ].filter(Boolean).join("");
  const tree = useResource(`/explorer/tree?path=${encodeURIComponent(path)}${scope}`);
  const segments = path.length === 0 ? [] : path.split("/");
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", fontSize: 11, paddingBottom: 4 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", onClick: () => {
        setPath("");
      }, style: crumbStyle, children: t("explorer.workspace") }),
      segments.map((segment, index) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { color: token.textMuted }, children: "/" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            type: "button",
            onClick: () => {
              setPath(segments.slice(0, index + 1).join("/"));
            },
            style: crumbStyle,
            children: segment
          }
        )
      ] }, `${segment}-${index}`))
    ] }),
    tree.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Notice, { kind: "error", children: tree.error }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("ul", { style: { listStyle: "none", margin: 0, padding: 0 }, children: [
      path.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          type: "button",
          onClick: () => {
            setPath(segments.slice(0, -1).join("/"));
          },
          style: { ...rowStyle, color: token.textMuted },
          children: t("explorer.up")
        }
      ) }),
      (tree.data?.entries ?? []).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("li", { children: [
        entry.kind === "directory" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", onClick: () => {
          setPath(entry.path);
        }, style: rowStyle, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { "aria-hidden": "true", style: { color: token.accent }, children: "\u25B8" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }, children: entry.name })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { ...rowStyle, cursor: "default" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { "aria-hidden": "true", style: { opacity: 0 }, children: "\u25B8" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }, children: entry.name }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { fontSize: 10, color: token.textMuted }, children: formatSize(entry.size) })
        ] }),
        entry.truncated === true && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 10, color: token.textMuted, padding: "2px 4px" }, children: t("explorer.truncated") })
      ] }, entry.path))
    ] })
  ] });
}
var crumbStyle = {
  ...buttonStyle,
  border: "none",
  background: "transparent",
  padding: "1px 3px",
  fontSize: 11,
  color: token.accent
};
var rowStyle = {
  ...buttonStyle,
  display: "flex",
  width: "100%",
  gap: 6,
  alignItems: "center",
  border: "none",
  background: "transparent",
  textAlign: "left",
  padding: "3px 4px",
  fontSize: 12
};
function ExplorerPanel(props) {
  const t = useT();
  const [tab, setTab] = (0, import_react9.useState)("changes");
  const [diff, setDiff] = (0, import_react9.useState)(void 0);
  const scope = [
    props.workspace === void 0 ? void 0 : `workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === void 0 ? void 0 : `session=${encodeURIComponent(props.sessionId)}`
  ].filter(Boolean).join("&");
  const query = scope.length === 0 ? "" : `?${scope}`;
  const status = useResource(`/explorer/status${query}`);
  (0, import_react9.useEffect)(() => {
    const timer = window.setInterval(() => {
      status.reload();
    }, 5e3);
    return () => {
      window.clearInterval(timer);
    };
  }, [status.reload]);
  const openDiff = (0, import_react9.useCallback)(async (change) => {
    setDiff({ path: change.path, patch: t("common.loading") });
    const result = await callApi(
      `/explorer/diff?path=${encodeURIComponent(change.path)}&staged=${change.staged ? "1" : "0"}${scope.length === 0 ? "" : `&${scope}`}`
    );
    setDiff(result.ok ? { path: change.path, patch: result.value.patch.length === 0 ? t("explorer.noDiff") : result.value.patch } : { path: change.path, patch: t("explorer.diffFailed", { message: result.message }) });
  }, [scope]);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { "data-dsh-plugin": "dsh-dev-tool-ext", "data-dsh-part": "explorer", style: { display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
      ["changes", "files"].map((name2) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          type: "button",
          onClick: () => {
            setTab(name2);
          },
          "aria-pressed": tab === name2,
          style: {
            ...buttonStyle,
            fontSize: 11,
            padding: "2px 8px",
            borderColor: tab === name2 ? token.accent : token.border,
            color: tab === name2 ? token.accent : token.text
          },
          children: name2 === "changes" ? t("explorer.changes") : t("explorer.files")
        },
        name2
      )),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { flex: 1 } }),
      status.data?.branch !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { style: { fontSize: 11, color: token.textMuted }, children: [
        status.data.branch,
        (status.data.ahead ?? 0) > 0 && ` \u2191${status.data.ahead}`,
        (status.data.behind ?? 0) > 0 && ` \u2193${status.data.behind}`
      ] })
    ] }),
    status.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Notice, { kind: "error", children: status.error }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { overflow: "auto", minHeight: 0 }, children: tab === "changes" ? status.data === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("common.loading") }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ChangeList, { status: status.data, onOpenDiff: openDiff }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Tree, { workspace: props.workspace, sessionId: props.sessionId }) }),
    diff !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { borderTop: `1px solid ${token.border}`, paddingTop: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("strong", { style: { fontSize: 11, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }, children: diff.path }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", onClick: () => {
          setDiff(void 0);
        }, style: { ...buttonStyle, fontSize: 11 }, children: t("common.close") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("pre", { style: {
        margin: 0,
        maxHeight: 220,
        overflow: "auto",
        fontSize: 11,
        lineHeight: 1.45,
        fontFamily: "ui-monospace, monospace",
        color: token.text
      }, children: diff.patch })
    ] })
  ] });
}

// src/client/SettingsPage.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
function Disclosure(props) {
  const [open2, setOpen] = (0, import_react10.useState)(props.defaultOpen === true);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { paddingTop: 4 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      "button",
      {
        type: "button",
        "aria-expanded": open2,
        onClick: () => {
          setOpen(!open2);
        },
        style: { ...buttonStyle, fontSize: 11, padding: "2px 8px" },
        children: [
          open2 ? "\u25BE" : "\u25B8",
          " ",
          props.label
        ]
      }
    ),
    open2 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { paddingTop: 8 }, children: props.children })
  ] });
}
function SettingsPage() {
  const t = useT();
  const { view, error, busy, set } = useConfig();
  if (view === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { padding: 16, fontSize: 13, color: token.textMuted }, children: error === void 0 ? t("common.loading") : error });
  }
  const c = view.value;
  const disabled = busy || !view.writable;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { padding: "0 4px 24px", color: token.text }, "data-dsh-plugin": "dsh-dev-tool-ext", children: [
    !view.writable && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { paddingTop: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Notice, { kind: "info", children: t("common.readonly") }) }),
    error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { paddingTop: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Notice, { kind: "error", children: error }) }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      Section,
      {
        title: t("section.images"),
        description: t("section.images.desc"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("common.enabled"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("section.images"),
                  checked: c.imageComposer.enabled,
                  disabled,
                  onChange: (next) => {
                    set(["imageComposer", "enabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("images.button"),
              hint: t("images.button.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("images.button"),
                  checked: c.imageComposer.pickerButton,
                  disabled: disabled || !c.imageComposer.enabled,
                  onChange: (next) => {
                    set(["imageComposer", "pickerButton"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("images.drag"),
              hint: t("images.drag.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("images.drag"),
                  checked: c.imageComposer.dragReorder,
                  disabled: disabled || !c.imageComposer.enabled,
                  onChange: (next) => {
                    set(["imageComposer", "dragReorder"], next);
                  }
                }
              )
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      Section,
      {
        title: t("section.effort"),
        description: t("section.effort.desc"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("common.enabled"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("section.effort"),
                  checked: c.reasoningEffort.enabled,
                  disabled,
                  onChange: (next) => {
                    set(["reasoningEffort", "enabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Disclosure, { label: t("effort.models"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(EffortsPanel, { enabled: c.reasoningEffort.enabled }) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      Section,
      {
        title: t("section.modelPicker"),
        description: t("section.modelPicker.desc"),
        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          Row,
          {
            label: t("modelPicker.collapse"),
            hint: t("modelPicker.collapse.hint"),
            control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              Toggle,
              {
                label: t("modelPicker.collapse"),
                checked: c.modelPicker.groupCollapse,
                disabled,
                onChange: (next) => {
                  set(["modelPicker", "groupCollapse"], next);
                }
              }
            )
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      Section,
      {
        title: t("section.balance"),
        description: t("section.balance.desc"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("common.enabled"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("section.balance"),
                  checked: c.deepseekBalance.enabled,
                  disabled,
                  onChange: (next) => {
                    set(["deepseekBalance", "enabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("balance.badge"),
              hint: t("balance.badge.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("balance.badge"),
                  checked: c.deepseekBalance.headerBadge,
                  disabled: disabled || !c.deepseekBalance.enabled,
                  onChange: (next) => {
                    set(["deepseekBalance", "headerBadge"], next);
                  }
                }
              )
            }
          ),
          c.deepseekBalance.enabled && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { paddingTop: 4 }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(BalanceCard, { enabled: true }) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      Section,
      {
        title: t("section.review"),
        description: t("section.review.desc"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("common.enabled"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("section.review"),
                  checked: c.commandReview.enabled,
                  disabled,
                  onChange: (next) => {
                    set(["commandReview", "enabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("review.mode"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Select,
                {
                  label: t("review.mode"),
                  value: c.commandReview.mode,
                  disabled: disabled || !c.commandReview.enabled,
                  onChange: (next) => {
                    set(["commandReview", "mode"], next);
                  },
                  options: [
                    { value: "rules-only", label: t("review.mode.rules") },
                    { value: "rules+llm", label: t("review.mode.rulesLlm") },
                    { value: "all", label: t("review.mode.all") }
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("review.provider"),
              hint: t("review.provider.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                TextField,
                {
                  label: t("review.provider"),
                  value: c.commandReview.provider,
                  disabled: disabled || !c.commandReview.enabled,
                  onCommit: (next) => {
                    set(["commandReview", "provider"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("review.model"),
              hint: t("review.model.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                TextField,
                {
                  label: t("review.model"),
                  value: c.commandReview.model,
                  disabled: disabled || !c.commandReview.enabled,
                  onCommit: (next) => {
                    set(["commandReview", "model"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("review.timeout"),
              hint: t("review.timeout.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                NumberField,
                {
                  label: t("review.timeout"),
                  value: c.commandReview.timeoutMs,
                  min: 1e3,
                  max: 12e4,
                  step: 500,
                  disabled: disabled || !c.commandReview.enabled,
                  onCommit: (next) => {
                    set(["commandReview", "timeoutMs"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("review.onFailure"),
              hint: t("review.onFailure.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Select,
                {
                  label: t("review.onFailure"),
                  value: c.commandReview.onFailure,
                  disabled: disabled || !c.commandReview.enabled,
                  onChange: (next) => {
                    set(["commandReview", "onFailure"], next);
                  },
                  options: [
                    { value: "ask", label: t("review.onFailure.ask") },
                    { value: "deny", label: t("review.onFailure.deny") },
                    { value: "allow", label: t("review.onFailure.allow") }
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("review.tools"),
              hint: t("review.tools.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { style: { fontSize: 11, color: token.textMuted }, children: c.commandReview.tools.join(", ") })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Disclosure, { label: t("review.verdicts"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(AuditPanel, { enabled: c.commandReview.enabled }) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      Section,
      {
        title: t("section.explorer"),
        description: t("section.explorer.desc"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("common.enabled"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("section.explorer"),
                  checked: c.explorer.enabled,
                  disabled,
                  onChange: (next) => {
                    set(["explorer", "enabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("explorer.side"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Select,
                {
                  label: t("explorer.side"),
                  value: c.explorer.side,
                  disabled: disabled || !c.explorer.enabled,
                  onChange: (next) => {
                    set(["explorer", "side"], next);
                  },
                  options: [{ value: "left", label: t("explorer.side.left") }, { value: "right", label: t("explorer.side.right") }]
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("explorer.defaultOpen"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("explorer.defaultOpen"),
                  checked: c.explorer.defaultOpen,
                  disabled: disabled || !c.explorer.enabled,
                  onChange: (next) => {
                    set(["explorer", "defaultOpen"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("explorer.gitignore"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("explorer.gitignore"),
                  checked: c.explorer.respectGitignore,
                  disabled: disabled || !c.explorer.enabled,
                  onChange: (next) => {
                    set(["explorer", "respectGitignore"], next);
                  }
                }
              )
            }
          ),
          c.explorer.enabled && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Disclosure, { label: t("explorer.preview"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { border: `1px solid ${token.border}`, borderRadius: 8, padding: 8, maxHeight: 300, overflow: "hidden", display: "flex" }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ExplorerPanel, {}) }) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      Section,
      {
        title: t("section.sessions"),
        description: t("section.sessions.desc"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("common.enabled"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("section.sessions"),
                  checked: c.sessionAdmin.enabled,
                  disabled,
                  onChange: (next) => {
                    set(["sessionAdmin", "enabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("sessions.trash"),
              hint: t("sessions.trash.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("sessions.trash"),
                  checked: c.sessionAdmin.trashEnabled,
                  disabled: disabled || !c.sessionAdmin.enabled,
                  onChange: (next) => {
                    set(["sessionAdmin", "trashEnabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("sessions.gc"),
              hint: t("sessions.gc.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("sessions.gc"),
                  checked: c.sessionAdmin.attachmentGc,
                  disabled: disabled || !c.sessionAdmin.enabled,
                  onChange: (next) => {
                    set(["sessionAdmin", "attachmentGc"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Disclosure, { label: t("sessions.stored"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SessionsPanel, { enabled: c.sessionAdmin.enabled, trashEnabled: c.sessionAdmin.trashEnabled }) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      Section,
      {
        title: t("section.plugins"),
        description: t("section.plugins.desc"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("common.enabled"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("section.plugins"),
                  checked: c.pluginSafety.enabled,
                  disabled,
                  onChange: (next) => {
                    set(["pluginSafety", "enabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Disclosure, { label: t("plugins.list"), defaultOpen: c.pluginSafety.quarantine.length > 0, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PluginsPanel, { enabled: c.pluginSafety.enabled }) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      Section,
      {
        title: t("section.checkpoints"),
        description: t("section.checkpoints.desc"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("common.enabled"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Toggle,
                {
                  label: t("section.checkpoints"),
                  checked: c.checkpoints.enabled,
                  disabled,
                  onChange: (next) => {
                    set(["checkpoints", "enabled"], next);
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("cp.snapshotOn"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Select,
                {
                  label: t("cp.snapshotOn"),
                  value: c.checkpoints.snapshotOn,
                  disabled: disabled || !c.checkpoints.enabled,
                  onChange: (next) => {
                    set(["checkpoints", "snapshotOn"], next);
                  },
                  options: [
                    { value: "turn", label: t("cp.snapshotOn.turn") },
                    { value: "tool", label: t("cp.snapshotOn.tool") }
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("cp.retention"),
              hint: t("cp.retention.hint"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { style: { fontSize: 11, color: token.textMuted }, children: [
                c.checkpoints.retentionDays,
                " ",
                t("common.days")
              ] })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Row,
            {
              label: t("cp.maxSize"),
              control: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { style: { fontSize: 11, color: token.textMuted }, children: [
                c.checkpoints.maxFileSizeMb,
                " MB"
              ] })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Disclosure, { label: t("cp.list"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CheckpointsPanel, { enabled: c.checkpoints.enabled }) })
        ]
      }
    )
  ] });
}

// src/client/ComposerImages.tsx
var import_react11 = require("react");

// src/client/picker-channel.ts
var handler;
var listeners2 = /* @__PURE__ */ new Set();
function provideImagePicker(next) {
  handler = next;
  for (const listener of listeners2) listener();
  return () => {
    if (handler !== next) return;
    handler = void 0;
    for (const listener of listeners2) listener();
  };
}
function openImagePicker() {
  handler?.();
}
function hasImagePicker() {
  return handler !== void 0;
}

// src/client/ComposerImages.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
var THUMB = 56;
function applyOrder(actions, current, next) {
  if (next.length !== current.length) return false;
  const currentSet = new Set(current);
  if (next.some((id) => !currentSet.has(id))) return false;
  for (const id of current) actions.removeImage(id);
  const accepted = actions.addImages(next);
  if (!accepted) {
    actions.addImages(current);
    return false;
  }
  return true;
}
function ComposerImages(props) {
  const { attachments, canAcceptDrop, dropLimits, onAddImages, onRemoveImage, input, actions, dragEnabled } = props;
  const t = useT();
  const [dragging, setDragging] = (0, import_react11.useState)(void 0);
  const [over, setOver] = (0, import_react11.useState)(void 0);
  const [fileOver, setFileOver] = (0, import_react11.useState)(false);
  const [refused, setRefused] = (0, import_react11.useState)(false);
  const fileInput = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (!refused) return;
    const timer = window.setTimeout(() => {
      setRefused(false);
    }, 2600);
    return () => {
      window.clearTimeout(timer);
    };
  }, [refused]);
  const reorderable = dragEnabled && actions !== void 0 && input?.phase === "plain" && attachments.length > 1;
  const commitMove = (0, import_react11.useCallback)((from, to) => {
    if (actions === void 0 || input === void 0 || from === to) return;
    const ids = [...input.imageIds];
    const fromIndex = ids.indexOf(from);
    const toIndex = ids.indexOf(to);
    if (fromIndex < 0 || toIndex < 0) return;
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, from);
    if (!applyOrder(actions, input.imageIds, ids)) setRefused(true);
  }, [actions, input]);
  const nudge = (0, import_react11.useCallback)((id, delta) => {
    if (actions === void 0 || input === void 0) return;
    const ids = [...input.imageIds];
    const index = ids.indexOf(id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= ids.length) return;
    const moved = ids[index];
    const displaced = ids[target];
    if (moved === void 0 || displaced === void 0) return;
    ids[index] = displaced;
    ids[target] = moved;
    if (!applyOrder(actions, input.imageIds, ids)) setRefused(true);
  }, [actions, input]);
  const pick = (0, import_react11.useCallback)(() => {
    fileInput.current?.click();
  }, []);
  (0, import_react11.useEffect)(() => provideImagePicker(pick), [pick]);
  const onPicked = (0, import_react11.useCallback)((files) => {
    if (files === null || files.length === 0) return;
    const images = [...files].filter((file) => file.type.startsWith("image/"));
    if (images.length > 0) onAddImages(images);
    if (fileInput.current !== null) fileInput.current.value = "";
  }, [onAddImages]);
  const onDragStart = (id) => (event) => {
    if (!reorderable) return;
    setDragging(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-dsh-draft-image", id);
  };
  const onDragOver = (id) => (event) => {
    if (!reorderable || dragging === void 0) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOver(id);
  };
  const onDrop = (id) => (event) => {
    if (!reorderable || dragging === void 0) return;
    event.preventDefault();
    event.stopPropagation();
    commitMove(dragging, id);
    setDragging(void 0);
    setOver(void 0);
  };
  const endDrag = () => {
    setDragging(void 0);
    setOver(void 0);
  };
  const isFileDrag = (event) => event.dataTransfer.types.includes("Files") && !event.dataTransfer.types.includes("application/x-dsh-draft-image");
  const onFileDragOver = (event) => {
    if (!canAcceptDrop || !isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setFileOver(true);
  };
  const onFileDrop = (event) => {
    if (!canAcceptDrop || !isFileDrag(event)) return;
    event.preventDefault();
    setFileOver(false);
    const images = [...event.dataTransfer.files].filter((file) => file.type.startsWith("image/"));
    if (images.length > 0) onAddImages(images);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "div",
    {
      "data-dsh-plugin": "dsh-dev-tool-ext",
      "data-dsh-part": "composer-images",
      onDragOver: onFileDragOver,
      onDragLeave: () => {
        setFileOver(false);
      },
      onDrop: onFileDrop,
      style: fileOver ? { outline: `2px dashed ${token.accent}`, outlineOffset: 2, borderRadius: 8 } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "input",
          {
            ref: fileInput,
            type: "file",
            accept: "image/*",
            multiple: true,
            hidden: true,
            "aria-hidden": "true",
            tabIndex: -1,
            onChange: (event) => {
              onPicked(event.currentTarget.files);
            }
          }
        ),
        attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "div",
          {
            role: "list",
            "aria-label": t("images.rail"),
            style: { display: "flex", flexWrap: "wrap", gap: 8, padding: "6px 0 2px" },
            children: attachments.map((attachment, index) => {
              const isOver = over === attachment.id && dragging !== attachment.id;
              return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
                "div",
                {
                  role: "listitem",
                  draggable: reorderable,
                  onDragStart: onDragStart(attachment.id),
                  onDragOver: onDragOver(attachment.id),
                  onDragLeave: () => {
                    if (over === attachment.id) setOver(void 0);
                  },
                  onDrop: onDrop(attachment.id),
                  onDragEnd: endDrag,
                  title: reorderable ? `${attachment.file.name} \u2014 drag to reorder` : attachment.file.name,
                  style: {
                    position: "relative",
                    width: THUMB,
                    height: THUMB,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `1px solid ${isOver ? token.accent : token.border}`,
                    outline: isOver ? `2px solid ${token.accent}` : "none",
                    outlineOffset: -2,
                    opacity: dragging === attachment.id ? 0.4 : 1,
                    cursor: reorderable ? "grab" : "default",
                    background: token.surface,
                    transition: "opacity 120ms ease, outline-color 120ms ease"
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                      "img",
                      {
                        src: attachment.previewUrl,
                        alt: attachment.file.name,
                        draggable: false,
                        style: { width: "100%", height: "100%", objectFit: "cover", display: "block" }
                      }
                    ),
                    reorderable && // Keyboard equivalent of the drag. Visually quiet, but present
                    // in the tab order: a reorder no one can reach by keyboard is
                    // a reorder half the users do not have.
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { position: "absolute", left: 2, bottom: 2, display: "flex", gap: 2 }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                        "button",
                        {
                          type: "button",
                          "aria-label": `Move ${attachment.file.name} earlier`,
                          disabled: index === 0,
                          onClick: () => {
                            nudge(attachment.id, -1);
                          },
                          style: nudgeStyle,
                          children: "\u2039"
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                        "button",
                        {
                          type: "button",
                          "aria-label": `Move ${attachment.file.name} later`,
                          disabled: index === attachments.length - 1,
                          onClick: () => {
                            nudge(attachment.id, 1);
                          },
                          style: nudgeStyle,
                          children: "\u203A"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                      "button",
                      {
                        type: "button",
                        "aria-label": `Remove ${attachment.file.name}`,
                        onClick: () => {
                          onRemoveImage(attachment.id);
                        },
                        style: {
                          position: "absolute",
                          top: 2,
                          right: 2,
                          width: 18,
                          height: 18,
                          lineHeight: "16px",
                          fontSize: 12,
                          padding: 0,
                          borderRadius: 9,
                          border: "none",
                          cursor: "pointer",
                          color: "#fff",
                          background: "rgba(0,0,0,0.55)"
                        },
                        children: "\xD7"
                      }
                    )
                  ]
                },
                attachment.id
              );
            })
          }
        ),
        fileOver && attachments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "div",
          {
            role: "status",
            style: {
              fontSize: 11,
              color: token.accent,
              padding: "8px 10px",
              textAlign: "center"
            },
            children: dropLimits === void 0 ? "Drop images to attach them" : `Drop up to ${dropLimits.count} image(s), ${dropLimits.size} each`
          }
        ),
        refused && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { role: "status", style: { fontSize: 11, color: token.textMuted, paddingBottom: 4 }, children: "The composer is busy sending; the image order was left as it was." })
      ]
    }
  );
}
var nudgeStyle = {
  width: 16,
  height: 16,
  padding: 0,
  fontSize: 11,
  lineHeight: "14px",
  borderRadius: 4,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  background: "rgba(0,0,0,0.55)"
};

// src/client/SidePanel.tsx
var import_react13 = require("react");

// src/client/panel-state.ts
var import_react12 = require("react");
var STORAGE_KEY = "dsh-dev-tool-ext:side-panel-open";
var open;
var listeners3 = /* @__PURE__ */ new Set();
function read(fallback2) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? fallback2 : stored === "1";
  } catch {
    return fallback2;
  }
}
function setPanelOpen(next) {
  if (open === next) return;
  open = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
  }
  for (const listener of [...listeners3]) listener();
}
function usePanelOpen(fallback2) {
  const [, bump] = (0, import_react12.useState)(0);
  if (open === void 0) open = read(fallback2);
  (0, import_react12.useEffect)(() => {
    const listener = () => {
      bump((n) => n + 1);
    };
    listeners3.add(listener);
    return () => {
      listeners3.delete(listener);
    };
  }, []);
  return open;
}

// src/client/SidePanel.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
var PANEL_WIDTH = 340;
function centreColumn() {
  const overlay = document.querySelector("[data-shell-overlay]");
  const frame = overlay?.parentElement;
  if (frame === null || frame === void 0) return void 0;
  const columns = [...frame.children].filter(
    (child) => child instanceof HTMLElement && !child.hasAttribute("data-shell-overlay")
  );
  return columns[1];
}
function SidePanel(props) {
  const t = useT();
  const open2 = usePanelOpen(props.defaultOpen);
  (0, import_react13.useEffect)(() => {
    const centre = centreColumn();
    if (centre === void 0) return;
    const edge = props.side === "right" ? "paddingInlineEnd" : "paddingInlineStart";
    const previous = centre.style[edge];
    centre.style[edge] = open2 ? `${PANEL_WIDTH}px` : previous;
    const previousTransition = centre.style.transition;
    centre.style.transition = "padding var(--ds-transition-duration-slow, 200ms) var(--ds-ease-in-out, ease)";
    return () => {
      centre.style[edge] = previous;
      centre.style.transition = previousTransition;
    };
  }, [open2, props.side]);
  (0, import_react13.useEffect)(() => {
    if (!open2) return;
    const onKey = (event) => {
      if (event.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open2]);
  if (!open2) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    "div",
    {
      "data-dsh-plugin": "dsh-dev-tool-ext",
      "data-dsh-part": "side-panel",
      style: {
        position: "absolute",
        top: 0,
        bottom: 0,
        ...props.side === "right" ? { right: 0 } : { left: 0 },
        width: PANEL_WIDTH,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        padding: 10,
        gap: 8,
        color: token.text,
        background: token.surfaceBase,
        borderLeft: props.side === "right" ? `1px solid ${token.border}` : "none",
        borderRight: props.side === "left" ? `1px solid ${token.border}` : "none",
        overflow: "hidden",
        // The overlay layer is click-through; this subtree opts back in.
        pointerEvents: "auto"
      },
      "aria-label": t("explorer.title"),
      children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(ExplorerPanel, {})
    }
  );
}

// src/client/ModelPicker.tsx
var import_react14 = require("react");

// src/client/icons.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var iconButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  padding: 0,
  border: 0,
  borderRadius: "50%",
  background: "transparent",
  color: "var(--dsw-alias-label-primary, currentColor)",
  cursor: "pointer"
};
function PanelRightIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "0.68", y: "1.2", width: "14.64", height: "13.6", rx: "2.6", stroke: "currentColor", strokeWidth: "1.36" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M10.46 1.88V14.12", stroke: "currentColor", strokeWidth: "1.36" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M11.14 2.56H14.64V13.44H11.14V2.56Z", fill: "currentColor", opacity: "0.55" })
  ] });
}
function PanelLeftIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "0.68", y: "1.2", width: "14.64", height: "13.6", rx: "2.6", stroke: "currentColor", strokeWidth: "1.36" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M5.54 1.88V14.12", stroke: "currentColor", strokeWidth: "1.36" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: "M1.36 2.56H4.86V13.44H1.36V2.56Z", fill: "currentColor", opacity: "0.55" })
  ] });
}
function ChevronIcon(props) {
  const size2 = props.size ?? 14;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    "svg",
    {
      width: size2,
      height: size2,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
      style: {
        flex: "0 0 auto",
        transform: props.open ? "rotate(90deg)" : "none",
        transition: "transform 120ms ease"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        "path",
        {
          d: "M6 4L10 8L6 12",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function CheckIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    "path",
    {
      d: "M3.2 8.6L6.1 11.5L12.8 4.8",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}

// src/client/host-css.ts
var REQUIRED = [
  "root",
  "trigger",
  "triggerLabel",
  "triggerEffort",
  "chevron",
  "chevronOpen",
  "menu",
  "cell",
  "cellLabel",
  "cellValue",
  "cellChevron",
  "groups",
  "group",
  "groupTitle",
  "option",
  "optionCopy",
  "selected",
  "modelName",
  "description",
  "check",
  "empty",
  "status",
  "error",
  "warning",
  "retry"
];
var resolved;
function probe() {
  if (typeof document === "undefined") return null;
  const seen = /* @__PURE__ */ new Map();
  const pattern = /\.((?:_[A-Za-z0-9]+_)|(?:[A-Za-z0-9]+_))([A-Za-z][A-Za-z0-9]*)\b/g;
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      const selector = rule.selectorText;
      if (selector === void 0 || selector === null) continue;
      for (const match of selector.matchAll(pattern)) {
        const [, prefix, local] = match;
        if (prefix === void 0 || local === void 0) continue;
        if (!REQUIRED.includes(local)) continue;
        let bucket = seen.get(prefix);
        if (bucket === void 0) {
          bucket = /* @__PURE__ */ new Set();
          seen.set(prefix, bucket);
        }
        bucket.add(local);
      }
    }
  }
  for (const [prefix, names] of seen) {
    if (names.size !== REQUIRED.length) continue;
    const table = {};
    for (const name2 of REQUIRED) table[name2] = `${prefix}${name2}`;
    return table;
  }
  return null;
}
function hostModelClasses() {
  if (resolved === void 0) {
    try {
      resolved = probe();
    } catch {
      resolved = null;
    }
  }
  return resolved;
}

// src/client/ModelPicker.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var COLLAPSE_KEY = "dsh-dev-tool-ext:model-groups-collapsed";
function readCollapsed() {
  try {
    const raw = window.localStorage.getItem(COLLAPSE_KEY);
    if (raw === null) return /* @__PURE__ */ new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((id) => typeof id === "string")) : /* @__PURE__ */ new Set();
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function writeCollapsed(ids) {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...ids]));
  } catch {
  }
}
function ModelPicker(props) {
  const { locked, available, directory, load: load2, select, collapsible } = props;
  const t = useT();
  const host = hostModelClasses();
  const state = (0, import_react14.useSyncExternalStore)(
    (0, import_react14.useCallback)((fn) => directory.subscribe(fn), [directory]),
    (0, import_react14.useCallback)(() => directory.getSnapshot(), [directory])
  );
  const [open2, setOpen] = (0, import_react14.useState)(false);
  const [pane, setPane] = (0, import_react14.useState)("root");
  const [collapsed, setCollapsed] = (0, import_react14.useState)(readCollapsed);
  const [filter, setFilter] = (0, import_react14.useState)("");
  const lastAction = (0, import_react14.useRef)("load");
  const rootRef = (0, import_react14.useRef)(null);
  const triggerRef = (0, import_react14.useRef)(null);
  const itemRefs = (0, import_react14.useRef)([]);
  const id = (0, import_react14.useId)();
  const current = state.current;
  const currentModel = (0, import_react14.useMemo)(() => {
    if (current === null) return void 0;
    for (const group of state.groups) {
      if (group.id !== current.provider) continue;
      for (const model of group.models) if (model.id === current.model) return model;
    }
    return void 0;
  }, [state.groups, current]);
  const reasoning = currentModel?.reasoning;
  const effectiveEffort = current?.reasoningEffort ?? reasoning?.defaultEffort;
  const effortLabel = reasoning === void 0 ? void 0 : effectiveEffort === void 0 ? t("picker.providerDefault") : reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort;
  const effortChoices = (0, import_react14.useMemo)(() => {
    if (reasoning === void 0) return [];
    const rows = [];
    if (reasoning.defaultEffort === void 0) {
      rows.push({ key: "provider-default", effort: void 0, label: t("picker.providerDefault") });
    }
    for (const effort of reasoning.efforts) {
      rows.push({
        key: `effort:${effort.id}`,
        effort: effort.id,
        label: effort.name,
        ...effort.description === void 0 ? {} : { description: effort.description }
      });
    }
    return rows;
  }, [reasoning, t]);
  const busy = state.status === "selecting";
  const modelLabel = currentModel?.name ?? t("picker.chooseModel");
  const reload = (0, import_react14.useCallback)(() => {
    lastAction.current = "load";
    load2();
  }, [load2]);
  (0, import_react14.useEffect)(() => {
    if (available) reload();
  }, [available, reload]);
  (0, import_react14.useEffect)(() => {
    if (!open2) return;
    const closeOutside = (event) => {
      if (rootRef.current?.contains(event.target) !== true) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
    };
  }, [open2]);
  if (!available) return null;
  const close = (restoreFocus = false) => {
    setOpen(false);
    setPane("root");
    setFilter("");
    if (restoreFocus) queueMicrotask(() => {
      triggerRef.current?.focus();
    });
  };
  const show = () => {
    setPane("root");
    setOpen(true);
    reload();
  };
  const settle = (accepted) => {
    if (accepted && rootRef.current !== null) close(true);
  };
  const choose = (selection) => {
    if (current?.provider === selection.provider && current.model === selection.model) {
      close(true);
      return;
    }
    lastAction.current = "select";
    void select(selection).then(settle);
  };
  const chooseEffort = (effort) => {
    if (current === null) return;
    if (effectiveEffort === effort) {
      close(true);
      return;
    }
    lastAction.current = "select";
    void select({
      provider: current.provider,
      model: current.model,
      ...effort === void 0 ? {} : { reasoningEffort: effort }
    }).then(settle);
  };
  const toggleGroup = (groupId) => {
    const next = new Set(collapsed);
    if (next.has(groupId)) next.delete(groupId);
    else next.add(groupId);
    setCollapsed(next);
    writeCollapsed(next);
  };
  const setAll = (collapse) => {
    const next = collapse ? new Set(state.groups.map((group) => group.id)) : /* @__PURE__ */ new Set();
    setCollapsed(next);
    writeCollapsed(next);
  };
  const moveFocus = (offset) => {
    const items = itemRefs.current.filter((item) => item !== null);
    if (items.length === 0) return;
    const active = items.findIndex((item) => item === document.activeElement);
    items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus();
  };
  const onRootKeyDown = (event) => {
    if (event.key === "Escape" && open2) {
      event.preventDefault();
      if (pane !== "root") setPane("root");
      else close(true);
      return;
    }
    if (!open2) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(event.key === "ArrowDown" ? 1 : -1);
    }
  };
  const onBlur = (event) => {
    if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget) === true) return;
    close();
  };
  itemRefs.current = [];
  const itemRef = () => {
    const at = itemRefs.current.length;
    itemRefs.current.push(null);
    return (node) => {
      itemRefs.current[at] = node;
    };
  };
  const needle = filter.trim().toLowerCase();
  const visible = (0, import_react14.useMemo)(() => state.groups.map((group) => ({
    group,
    models: needle.length === 0 ? group.models : group.models.filter((model) => model.name.toLowerCase().includes(needle) || model.id.toLowerCase().includes(needle))
  })).filter((entry) => needle.length === 0 || entry.models.length > 0), [state.groups, needle]);
  const cx = (...names) => names.filter(Boolean).join(" ");
  const fb = host === null ? fallback : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
    "div",
    {
      ref: rootRef,
      className: host?.root,
      style: fb?.root,
      onKeyDown: onRootKeyDown,
      onBlur,
      "data-dsh-plugin": "dsh-dev-tool-ext",
      "data-dsh-part": "model-picker",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          "button",
          {
            ref: triggerRef,
            type: "button",
            className: host?.trigger,
            style: fb?.trigger,
            "aria-label": effortLabel === void 0 ? t("picker.triggerAria", { model: modelLabel }) : t("picker.triggerAriaEffort", { model: modelLabel, effort: effortLabel }),
            "aria-haspopup": "menu",
            "aria-expanded": open2,
            "aria-controls": open2 ? `${id}-menu` : void 0,
            title: effortLabel === void 0 ? modelLabel : `${modelLabel} \xB7 ${effortLabel}`,
            disabled: locked,
            onClick: () => {
              if (open2) close();
              else show();
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.triggerLabel, style: fb?.triggerLabel, children: modelLabel }),
              effortLabel !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.triggerEffort, style: fb?.triggerEffort, children: effortLabel }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: cx(host?.chevron, open2 && host?.chevronOpen), style: fb?.chevron, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ChevronIcon, { open: open2, size: 14 }) })
            ]
          }
        ),
        open2 && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          "div",
          {
            id: `${id}-menu`,
            className: host?.menu,
            style: fb?.menu,
            role: "menu",
            "aria-label": t("picker.menuAria"),
            "aria-busy": state.status === "loading" || busy,
            children: [
              pane === "root" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                  "button",
                  {
                    ref: itemRef(),
                    type: "button",
                    role: "menuitem",
                    className: host?.cell,
                    style: fb?.cell,
                    onClick: () => {
                      setPane("model");
                    },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.cellLabel, style: fb?.cellLabel, children: t("picker.model") }),
                      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.cellValue, style: fb?.cellValue, children: modelLabel }),
                      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.cellChevron, style: fb?.cellChevron, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ChevronIcon, { open: false, size: 14 }) })
                    ]
                  }
                ),
                reasoning !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                  "button",
                  {
                    ref: itemRef(),
                    type: "button",
                    role: "menuitem",
                    className: host?.cell,
                    style: fb?.cell,
                    onClick: () => {
                      setPane("effort");
                    },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.cellLabel, style: fb?.cellLabel, children: t("picker.effort") }),
                      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.cellValue, style: fb?.cellValue, children: effortLabel }),
                      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.cellChevron, style: fb?.cellChevron, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ChevronIcon, { open: false, size: 14 }) })
                    ]
                  }
                )
              ] }),
              pane === "model" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
                state.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: host?.status, style: fb?.status, children: t("picker.loading") }),
                state.error !== null && lastAction.current === "load" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: host?.error, style: fb?.error, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: t("picker.actionFailed", { message: state.error }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", className: host?.retry, style: fb?.retry, onClick: reload, children: t("picker.reload") })
                ] }),
                state.failures.map((failure) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: host?.warning, style: fb?.warning, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: t("picker.groupFailed", { name: failure.name, message: failure.message }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", className: host?.retry, style: fb?.retry, onClick: reload, children: t("picker.reload") })
                ] }, failure.id)),
                collapsible && state.groups.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: toolbarStyle, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    "input",
                    {
                      type: "text",
                      value: filter,
                      placeholder: t("picker.filter"),
                      "aria-label": t("picker.filter"),
                      onChange: (event) => {
                        setFilter(event.currentTarget.value);
                      },
                      style: filterStyle
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", onClick: () => {
                    setAll(true);
                  }, style: miniButtonStyle, children: t("picker.collapseAll") }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", onClick: () => {
                    setAll(false);
                  }, style: miniButtonStyle, children: t("picker.expandAll") })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: cx(host?.groups, "scrollable"), style: fb?.groups, children: visible.map(({ group, models }) => {
                  const headingId = `${id}-${group.id}`;
                  const shut = collapsible && collapsed.has(group.id) && needle.length === 0;
                  const holdsCurrent = current?.provider === group.id;
                  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                    "section",
                    {
                      role: "group",
                      "aria-labelledby": headingId,
                      className: host?.group,
                      style: fb?.group,
                      children: [
                        collapsible ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                          "button",
                          {
                            ref: itemRef(),
                            type: "button",
                            id: headingId,
                            "aria-expanded": !shut,
                            onClick: () => {
                              toggleGroup(group.id);
                            },
                            className: host?.groupTitle,
                            style: { ...groupHeaderStyle, ...fb === void 0 ? {} : fb.groupTitle },
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ChevronIcon, { open: !shut, size: 12 }),
                              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { style: groupNameStyle, children: group.name }),
                              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { style: countStyle, children: models.length }),
                              shut && holdsCurrent && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { style: dotStyle, "aria-hidden": "true", children: "\u25CF" })
                            ]
                          }
                        ) : (
                          // Feature off: a plain heading, exactly as the shipped
                          // selector rendered it. A button that collapses nothing
                          // would still take a tab stop and still look pressable.
                          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { id: headingId, className: host?.groupTitle, style: fb?.groupTitle, children: group.name })
                        ),
                        !shut && models.map((model) => {
                          const selected = current?.provider === group.id && current.model === model.id;
                          return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                            "button",
                            {
                              ref: itemRef(),
                              type: "button",
                              role: "menuitemradio",
                              "aria-checked": selected,
                              className: cx(host?.option, selected && host?.selected),
                              style: fb === void 0 ? void 0 : { ...fb.option, ...selected ? fb.selected : {} },
                              title: model.name,
                              disabled: busy,
                              onClick: () => {
                                choose({ provider: group.id, model: model.id });
                              },
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: host?.optionCopy, style: fb?.optionCopy, children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.modelName, style: fb?.modelName, children: model.name }),
                                  model.description !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.description, style: fb?.description, children: model.description })
                                ] }),
                                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.check, style: fb?.check, children: selected ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(CheckIcon, { size: 16 }) : null })
                              ]
                            },
                            model.id
                          );
                        })
                      ]
                    },
                    group.id
                  );
                }) }),
                state.status === "ready" && visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: host?.empty, style: fb?.empty, children: needle.length === 0 ? t("picker.noModels") : t("picker.noMatch") })
              ] }),
              pane === "effort" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
                state.error !== null && lastAction.current === "load" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: host?.error, style: fb?.error, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: t("picker.actionFailed", { message: state.error }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", className: host?.retry, style: fb?.retry, onClick: reload, children: t("picker.reload") })
                ] }),
                effortChoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: host?.empty, style: fb?.empty, children: t("picker.noEfforts") }) : effortChoices.map((level) => {
                  const selected = effectiveEffort === level.effort;
                  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                    "button",
                    {
                      ref: itemRef(),
                      type: "button",
                      role: "menuitemradio",
                      "aria-checked": selected,
                      className: cx(host?.option, selected && host?.selected),
                      style: fb === void 0 ? void 0 : { ...fb.option, ...selected ? fb.selected : {} },
                      disabled: busy,
                      onClick: () => {
                        chooseEffort(level.effort);
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: host?.optionCopy, style: fb?.optionCopy, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.modelName, style: fb?.modelName, children: level.label }),
                          level.description !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.description, style: fb?.description, children: level.description })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: host?.check, style: fb?.check, children: selected ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(CheckIcon, { size: 16 }) : null })
                      ]
                    },
                    level.key
                  );
                })
              ] })
            ]
          }
        )
      ]
    }
  );
}
var groupHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  width: "100%",
  border: 0,
  background: "transparent",
  cursor: "pointer",
  font: "inherit",
  color: token.textMuted
};
var groupNameStyle = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textAlign: "left"
};
var countStyle = {
  fontSize: 10,
  opacity: 0.7,
  fontVariantNumeric: "tabular-nums"
};
var dotStyle = { fontSize: 8, color: token.accent };
var toolbarStyle = {
  display: "flex",
  gap: 4,
  padding: "4px 6px 6px",
  borderBottom: `1px solid ${token.border}`
};
var filterStyle = {
  flex: 1,
  minWidth: 0,
  font: "inherit",
  fontSize: 12,
  color: token.text,
  background: token.surface,
  border: `1px solid ${token.border}`,
  borderRadius: 6,
  padding: "3px 7px"
};
var miniButtonStyle = {
  font: "inherit",
  fontSize: 11,
  color: token.textSecondary,
  background: "transparent",
  border: `1px solid ${token.border}`,
  borderRadius: 6,
  padding: "3px 6px",
  cursor: "pointer",
  whiteSpace: "nowrap"
};
var fallback = {
  root: { position: "relative", display: "inline-flex" },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    maxWidth: 260,
    font: "inherit",
    fontSize: 12,
    color: token.text,
    background: token.surface,
    border: `1px solid ${token.border}`,
    borderRadius: 8,
    padding: "4px 8px",
    cursor: "pointer"
  },
  triggerLabel: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  triggerEffort: { fontSize: 11, color: token.textMuted },
  chevron: { display: "inline-flex", color: token.textMuted },
  menu: {
    position: "absolute",
    bottom: "calc(100% + 6px)",
    right: 0,
    zIndex: 30,
    minWidth: 300,
    maxWidth: 380,
    padding: 4,
    background: "var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-layer-2, #1e1e1e))",
    border: `1px solid ${token.border}`,
    borderRadius: 10,
    boxShadow: "0 8px 28px rgba(0,0,0,0.34)"
  },
  cell: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    font: "inherit",
    fontSize: 12,
    color: token.text,
    background: "transparent",
    border: 0,
    borderRadius: 6,
    padding: "7px 8px",
    cursor: "pointer"
  },
  cellLabel: { flex: "0 0 auto", color: token.textMuted },
  cellValue: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" },
  cellChevron: { display: "inline-flex", color: token.textMuted },
  groups: { maxHeight: 320, overflowY: "auto", display: "block" },
  group: { display: "block", padding: "2px 0" },
  groupTitle: { padding: "5px 6px" },
  option: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    font: "inherit",
    fontSize: 12,
    color: token.text,
    textAlign: "left",
    background: "transparent",
    border: 0,
    borderRadius: 6,
    padding: "6px 8px",
    cursor: "pointer"
  },
  selected: { background: token.hover, color: token.accent },
  optionCopy: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  modelName: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  description: { fontSize: 10, color: token.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  check: { flex: "0 0 auto", display: "inline-flex", color: token.accent, width: 16 },
  empty: { fontSize: 12, color: token.textMuted, padding: "8px 10px" },
  status: { fontSize: 12, color: token.textMuted, padding: "6px 8px" },
  error: { display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: token.danger, padding: "6px 8px" },
  warning: { display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: token.warn, padding: "6px 8px" },
  retry: {
    font: "inherit",
    fontSize: 11,
    color: token.accent,
    background: "transparent",
    border: `1px solid ${token.border}`,
    borderRadius: 5,
    padding: "1px 5px",
    cursor: "pointer"
  }
};

// src/client/index.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
var name = "dsh-dev-tool-ext-client";
var inject = ["slots"];
var SHADOW_PRIORITY = -10;
function trySlot(label, register) {
  try {
    register();
  } catch (error) {
    console.warn(
      `[dsh-dev-tool-ext] the "${label}" surface could not be registered, so that one feature is unavailable. Everything else still loaded.`,
      error
    );
  }
}
function apply(ctx) {
  installLocale(ctx);
  trySlot("settings page", () => {
    ctx.slots.inject("settings.section", () => ctx.slots.register({
      name: "settings.section",
      id: "dsh-dev-tool-ext",
      order: 720,
      label: () => document.documentElement.lang.startsWith("zh") ? "\u5F00\u53D1\u5DE5\u5177" : "Dev Tools"
    }, SettingsPage));
  });
  registerComposerImages(ctx);
  registerModelPicker(ctx);
  registerBalanceBadge(ctx);
  registerSidePanel(ctx);
  registerExplorerToggles(ctx);
}
function installLocale(ctx) {
  try {
    const locale = ctx.get("locale");
    if (locale === void 0) return;
    if (typeof locale.register === "function") {
      for (const [id, dict] of Object.entries(DICTS)) {
        ctx.effect(() => locale.register(LOCALE_NS, id, dict), `dsh-dev-tool-ext: ${id} dictionary`);
      }
    }
    if (typeof locale.subscribe === "function" && typeof locale.getSnapshot === "function") {
      provideLocale({
        getSnapshot: locale.getSnapshot.bind(locale),
        subscribe: locale.subscribe.bind(locale),
        getLocale: (locale.getLocale ?? (() => void 0)).bind(locale)
      });
    }
  } catch (error) {
    console.warn("[dsh-dev-tool-ext] the locale runtime was unavailable; text stays in English.", error);
  }
}
function registerComposerImages(ctx) {
  trySlot("composer image rail", () => {
    ctx.slots.inject("conversation.input.attachments", () => ctx.slots.register({
      name: "conversation.input.attachments",
      priority: SHADOW_PRIORITY,
      registrant: "dsh-dev-tool-ext"
    }, function DevToolAttachments(props) {
      const config = useClientConfig();
      const input = props.useInput((state) => state);
      if (config?.imageComposer.enabled !== true) return null;
      return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        ComposerImages,
        {
          attachments: props.attachments,
          canAcceptDrop: props.canAcceptDrop,
          onAddImages: props.onAddImages,
          onRemoveImage: props.onRemoveImage,
          dropLimits: props.dropLimits,
          input,
          actions: props.inputActions,
          dragEnabled: config.imageComposer.dragReorder
        }
      );
    }));
  });
  registerImageTrigger(ctx);
}
function registerImageTrigger(ctx) {
  trySlot("composer image command", () => {
    ctx.inject(["inputTriggers"], (scoped) => {
      const triggers = scoped.inputTriggers;
      if (triggers?.registerSource === void 0) return;
      scoped.effect(() => triggers.registerSource({
        trigger: "/",
        name: "dsh-dev-tool-ext-image",
        order: -1,
        showGroupTitle: false,
        candidates: async (_session, req) => {
          const config = readClientConfig();
          if (config?.imageComposer.enabled !== true || !config.imageComposer.pickerButton) return [];
          if (!hasImagePicker()) return [];
          const query = req.query.trim().toLowerCase();
          const label = translate("images.add");
          if (query.length > 0 && !"image".startsWith(query) && !"\u56FE\u7247".startsWith(query) && !label.toLowerCase().startsWith(query)) return [];
          return [{ name: label, description: translate("images.pickHint") }];
        },
        onPick: () => {
          openImagePicker();
          return "handled";
        }
      }), "dsh-dev-tool-ext: image trigger source");
    });
  });
}
function registerModelPicker(ctx) {
  trySlot("composer model select", () => {
    ctx.inject(["slots", "modelDirectories", "sessions"], (scope) => {
      const models = scope.modelDirectories;
      const sessions = scope.sessions;
      scope.slots.inject("conversation.input.model", () => scope.slots.register({
        name: "conversation.input.model",
        priority: SHADOW_PRIORITY,
        registrant: "dsh-dev-tool-ext",
        inject: (sessionId) => {
          const directory = models.directoryFor(sessionId);
          const available = sessions.subagentAddress(sessionId) === void 0;
          return {
            available,
            directory: directory.store,
            load: () => {
              if (available) directory.load().catch(() => {
              });
            },
            select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false)
          };
        }
      }, function DevToolModelSelect(props) {
        const config = useClientConfig();
        return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          ModelPicker,
          {
            locked: props.locked,
            available: props.available,
            directory: props.directory,
            load: props.load,
            select: props.select,
            collapsible: config?.modelPicker.groupCollapse ?? false
          }
        );
      }));
    });
  });
}
function registerBalanceBadge(ctx) {
  trySlot("balance badge", () => {
    ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
      name: "conversation.input.right",
      id: "dsh-dev-tool-ext-balance",
      order: 0,
      registrant: "dsh-dev-tool-ext"
    }, function DevToolBalanceBadge() {
      const config = useClientConfig();
      if (config?.deepseekBalance.enabled !== true || !config.deepseekBalance.headerBadge) return null;
      return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(BalanceBadge, {});
    }));
  });
}
function registerSidePanel(ctx) {
  trySlot("project side panel", () => {
    ctx.slots.inject("shell.overlay", () => ctx.slots.register({
      name: "shell.overlay",
      id: "dsh-dev-tool-ext-explorer",
      order: 40,
      registrant: "dsh-dev-tool-ext"
    }, function DevToolSidePanel() {
      const config = useClientConfig();
      if (config?.explorer.enabled !== true) return null;
      return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(SidePanel, { side: config.explorer.side, defaultOpen: config.explorer.defaultOpen });
    }));
  });
}
function registerExplorerToggles(ctx) {
  trySlot("explorer toggle", () => {
    ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
      name: "conversation.session.header.utilities",
      id: "dsh-dev-tool-ext-explorer-toggle",
      order: 70,
      registrant: "dsh-dev-tool-ext"
    }, function DevToolExplorerToggle() {
      const t = useT();
      const config = useClientConfig();
      const open2 = usePanelOpen(config?.explorer.defaultOpen ?? false);
      if (config?.explorer.enabled !== true) return null;
      const Icon = config.explorer.side === "right" ? PanelRightIcon : PanelLeftIcon;
      return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        "button",
        {
          type: "button",
          "aria-label": t("explorer.title"),
          "aria-pressed": open2,
          title: t("explorer.title"),
          onClick: () => {
            setPanelOpen(!open2);
          },
          style: {
            ...iconButtonStyle,
            color: open2 ? "var(--dsw-alias-label-primary, currentColor)" : "var(--dsw-alias-label-secondary, currentColor)",
            background: open2 ? "var(--dsw-alias-button-floating-fill, transparent)" : "transparent"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Icon, {})
        }
      );
    }));
  });
}
function useLocalToggle(key, fallback2) {
  const read2 = () => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback2 : stored === "1";
    } catch {
      return fallback2;
    }
  };
  const [open2, setOpen] = (0, import_react15.useState)(read2);
  const write = (next) => {
    setOpen(next);
    try {
      window.localStorage.setItem(key, next ? "1" : "0");
    } catch {
    }
  };
  return [open2, write];
}

return module.exports;
	}
});

