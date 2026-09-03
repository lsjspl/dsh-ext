window.__ModuleLoader__.load({
	id: "dsh-ext",
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
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
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
var import_react24 = require("react");

// src/client/SettingsPage.tsx
var import_react14 = require("react");

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
      style: { padding: "18px 0 20px", color: token.text },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            "data-dsh-part": "section-header",
            style: {
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 12px",
              borderLeft: `3px solid ${token.accent}`,
              background: token.hover
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { margin: 0, fontSize: 15, lineHeight: 1.35, fontWeight: 600, color: token.text }, children: props.title }),
                props.description !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: "4px 0 0", fontSize: 11, lineHeight: 1.5, color: token.textMuted }, children: props.description })
              ] }),
              props.action !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flex: "0 0 auto", alignSelf: "flex-start", paddingTop: 1 }, children: props.action })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            "data-dsh-part": "section-items",
            style: {
              marginLeft: 15,
              paddingLeft: 14,
              borderLeft: `1px solid ${token.border}`,
              display: "flex",
              flexDirection: "column"
            },
            children: props.children
          }
        )
      ]
    }
  );
}
function Row(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      "data-dsh-part": "setting-row",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 18,
        justifyContent: "space-between",
        minHeight: 42,
        padding: "9px 4px 9px 0",
        borderBottom: `1px solid color-mix(in srgb, ${token.border} 55%, transparent)`
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, lineHeight: 1.35, fontWeight: 500, color: token.text }, children: props.label }),
          props.hint !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, lineHeight: 1.45, color: token.textMuted, marginTop: 3 }, children: props.hint })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flex: "0 0 auto", maxWidth: "55%" }, children: props.control })
      ]
    }
  );
}
function Toggle(props) {
  const disabled = props.disabled === true;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": props.checked,
      "aria-label": props.label,
      disabled,
      onClick: () => {
        props.onChange(!props.checked);
      },
      style: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: 36,
        height: 20,
        padding: 2,
        border: `1px solid ${props.checked ? token.accent : token.border}`,
        borderRadius: 999,
        background: props.checked ? token.accent : token.surface,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background 140ms ease, border-color 140ms ease, opacity 140ms ease",
        flex: "0 0 auto"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          "aria-hidden": "true",
          style: {
            display: "block",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: props.checked ? "var(--dsw-alias-bg-base, #fff)" : token.textMuted,
            boxShadow: "0 1px 2px color-mix(in srgb, #000 35%, transparent)",
            transform: props.checked ? "translateX(16px)" : "translateX(0)",
            transition: "transform 140ms ease, background 140ms ease"
          }
        }
      )
    }
  );
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
var INDENT = 14;
var rowStyle = {
  ...buttonStyle,
  display: "flex",
  width: "100%",
  gap: 7,
  alignItems: "center",
  border: "none",
  background: "transparent",
  textAlign: "left",
  padding: "5px 6px",
  fontSize: 15
};
function TextField(props) {
  const [draft, setDraft] = (0, import_react.useState)(props.value);
  const [editing, setEditing] = (0, import_react.useState)(false);
  if (!editing && draft !== props.value) setDraft(props.value);
  const commit2 = () => {
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
      onBlur: commit2,
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
function TextAreaField(props) {
  const [draft, setDraft] = (0, import_react.useState)(props.value);
  const [editing, setEditing] = (0, import_react.useState)(false);
  if (!editing && draft !== props.value) setDraft(props.value);
  const commit2 = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== props.value) props.onCommit(next);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "textarea",
    {
      value: draft,
      "aria-label": props.label,
      placeholder: props.placeholder,
      disabled: props.disabled,
      rows: props.rows ?? 6,
      onFocus: () => {
        setEditing(true);
      },
      onChange: (event) => {
        setDraft(event.currentTarget.value);
      },
      onBlur: commit2,
      onKeyDown: (event) => {
        if (event.key === "Escape") {
          setDraft(props.value);
          setEditing(false);
          event.currentTarget.blur();
        }
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") event.currentTarget.blur();
      },
      style: {
        ...inputStyle,
        width: props.width ?? 320,
        resize: "vertical",
        fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
        lineHeight: 1.45
      }
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

// src/client/use-resource.ts
var import_react2 = require("react");

// src/shared/api-contract.ts
var API_PREFIX = "/api/dsh-ext";
var THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
var DEFAULT_EFFORT_LADDER = [
  { id: "off", name: "Off", description: "No reasoning budget; send nothing.", wire: null },
  { id: "minimal", name: "Minimal", description: "The smallest non-zero reasoning effort.", wire: "minimal" },
  { id: "low", name: "Low", description: "A short think before answering.", wire: "low" },
  { id: "medium", name: "Medium", description: "Balanced reasoning for everyday work.", wire: "medium" },
  { id: "high", name: "High", description: "Long reasoning for hard problems.", wire: "high" },
  { id: "xhigh", name: "Extra high", description: "Extended reasoning beyond high.", wire: "xhigh" },
  { id: "max", name: "Max", description: "The most reasoning the model will do.", wire: "max" }
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

// src/client/use-resource.ts
function useResource(route, enabled = true) {
  const [data, setData] = (0, import_react2.useState)(void 0);
  const [error, setError] = (0, import_react2.useState)(void 0);
  const [loading, setLoading] = (0, import_react2.useState)(false);
  const [nonce, setNonce] = (0, import_react2.useState)(0);
  (0, import_react2.useEffect)(() => {
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
  const reload = (0, import_react2.useCallback)(() => {
    setNonce((value) => value + 1);
  }, []);
  return (0, import_react2.useMemo)(() => ({ data, error, loading, reload }), [data, error, loading, reload]);
}
function useCommand(onSettled) {
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(void 0);
  const run = (0, import_react2.useCallback)(async (route, body) => {
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
  const clearError = (0, import_react2.useCallback)(() => {
    setError(void 0);
  }, []);
  return (0, import_react2.useMemo)(() => ({ busy, error, run, clearError }), [busy, error, run, clearError]);
}

// src/client/use-config.ts
var import_react4 = require("react");

// src/client/use-client-config.ts
var import_react3 = require("react");
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
  const [, bump] = (0, import_react3.useState)(0);
  (0, import_react3.useEffect)(() => {
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
  const [view, setView] = (0, import_react4.useState)(void 0);
  const [error, setError] = (0, import_react4.useState)(void 0);
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const [nonce, setNonce] = (0, import_react4.useState)(0);
  (0, import_react4.useEffect)(() => {
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
  const reload = (0, import_react4.useCallback)(() => {
    setNonce((n) => n + 1);
  }, []);
  const setMany = (0, import_react4.useCallback)((ops) => {
    setBusy(true);
    void (async () => {
      const result = await callApi("/config/mutate", {
        body: {
          ops: ops.map((op) => ({ op: "set", path: op.path, value: op.value })),
          expectedRevision: view?.revision
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
  const set2 = (0, import_react4.useCallback)((path, value) => {
    setMany([{ path, value }]);
  }, [setMany]);
  return { view, error, busy, reload, set: set2, setMany };
}

// src/client/BalanceView.tsx
var import_react6 = require("react");

// src/client/use-locale.ts
var import_react5 = require("react");

// src/client/locales.ts
var LOCALE_NS = "dsh-ext";
var en = {
  // Section titles and descriptions
  "section.images": "Composer images",
  "section.images.desc": "An image entry at the top of the + menu, and drag-to-reorder for draft images.",
  // Settings tabs
  "tab.input": "Input & models",
  "tab.balance": "Balance",
  "tab.review": "Review",
  "tab.files": "Files",
  "tab.sessions": "Sessions",
  "tab.plugins": "Plugins",
  // Balance extras
  "balance.peak": "Peak",
  "balance.offPeak": "Off-peak",
  "balance.poll": "Poll interval (seconds)",
  "balance.poll.hint": "The balance chip refreshes itself every N seconds. 0 disables polling.",
  "balance.peakWindows": "Peak windows (Beijing time)",
  "balance.peakWindows.hint": "Official defaults converted to Beijing time: weekdays 09:00-12:00 and 14:00-18:00; rates are half outside these windows. Comma-separated HH:MM-HH:MM.",
  "balance.peakWeekdays": "Weekends are off-peak",
  "balance.peakWeekdays.hint": "Official scheme: Saturdays and Sundays bill at off-peak rates all day.",
  "balance.badge.title": "DeepSeek balance \xB7 peak windows {windows} (Beijing time) \xB7 key from {source}",
  "section.effort": "Reasoning effort",
  "section.effort.desc": "Declares each model's effort levels for third-party (pi-ai) routes, so the composer's effort control appears for those models.",
  "section.balance": "DeepSeek balance",
  "section.balance.desc": "Reads the account balance of the configured DeepSeek official API key. The key never reaches the browser.",
  "section.review": "Command review",
  "section.review.desc": "Screens high-risk tool calls with local patterns, then asks a second model to judge the ones that match. A review can only make a call stricter.",
  "section.explorer": "Project explorer",
  "section.explorer.desc": "The workspace directory tree and its uncommitted changes. Read-only: every git command behind it is a query.",
  "section.sessions": "Sessions",
  "section.sessions.desc": "The recycle bin is in the sidebar foot, beside Settings. Turning session administration off hides the bin and lets undo/edit leave the original session in place.",
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
  "files.attach": "Attach a file",
  "files.attachHint": "Pick a file from this computer and attach it",
  "files.notImage": "{name} is not an image, so its text was added to the message instead.",
  "files.unreadable": "{name} could not be attached: it is neither an image nor text.",
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
  "effort.defaultFull": "Full efforts by default",
  "effort.defaultFull.hint": "Models without an explicit override receive off, minimal, low, medium, high, xhigh, and max.",
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
  "vision.defaultAll": "Images on by default",
  "vision.defaultAll.hint": "Models without an explicit modality declaration are configured for text and image input.",
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
  "review.writeOnly": "Review writes only",
  "review.writeOnly.hint": "Skip calls the host classifies as read-only; shell commands fall back to the read-only patterns below.",
  "review.denyPatterns": "High-risk rules",
  "review.denyPatterns.hint": "One regular expression per line. In rules modes, matching writes are escalated or sent to the model.",
  "review.readPatterns": "Read-only command rules",
  "review.readPatterns.hint": "One whole-command regular expression per line. Used only when the tool has no read-only metadata.",
  "review.absoluteDelete": "Absolutely prohibit deletion",
  "review.absoluteDelete.hint": "Recognized deletion operations are denied immediately. The model and human approval cannot override this.",
  "review.deletePatterns": "Deletion rules",
  "review.deletePatterns.hint": "One regular expression per line, matched against the tool name plus the command or arguments.",
  "review.verdicts": "Recent verdicts",
  "review.empty": "No reviewed commands yet.",
  "review.count": "{n} most recent verdict(s).",
  "review.matched": "matched pattern:",
  "review.off": "Command review is switched off.",
  "review.modelPick": "Reviewer model",
  "review.modelPick.hint": "Pick the reviewer from the configured routes; the provider follows the chosen model.",
  "review.autoChip": "Auto review",
  "review.autoChip.hint": "Every write command is adjudicated by the reviewer model first; commands whose risk the model cannot judge escalate to you.",
  // Explorer
  "explorer.side": "Side",
  "explorer.side.left": "Left",
  "explorer.side.right": "Right",
  "explorer.defaultOpen": "Open by default",
  "explorer.gitignore": "Respect .gitignore",
  "explorer.preview": "Preview",
  "explorer.changes": "Review",
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
  "explorer.resize": "Resize the panel",
  "explorer.openEditor": "Open in",
  "explorer.openLabel": "Open",
  "explorer.openEditorFailed": "Could not open: {message}",
  "explorer.openWith.explorer": "File Explorer",
  "explorer.openWith.vscode": "VS Code",
  "explorer.openWith.idea": "IntelliJ IDEA",
  "explorer.viewFailed": "Could not read the file: {message}",
  "explorer.truncatedFile": "\u2026only the first {lines} lines are shown.",
  "explorer.close": "Close the preview",
  "explorer.workspacePick": "Workspace",
  "explorer.views": "Views",
  "explorer.newTab": "Add a view",
  "explorer.closeTab": "Close tab",
  "explorer.unmodified": "{n} unmodified lines",
  "explorer.filterAll": "All",
  "explorer.filterStaged": "Staged",
  "explorer.filterUnstaged": "Unstaged",
  "explorer.reviewGroup": "Group by folder",
  "explorer.reviewFlat": "Flat list",
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
  "sessions.gc": "Collect unused attachments",
  "sessions.gc.hint": "On permanent delete, scan every remaining session before removing an image blob. Slow on a large history.",
  "sessions.updatedAt": "updated {when}",
  "sessions.trashCount": "Recycle bin ({n})",
  "sessions.trashButton": "Recycle bin",
  "sessions.trashEmpty": "The recycle bin is empty.",
  "sessions.emptyTrash": "Empty recycle bin",
  "sessions.emptyTrashConfirm": "Delete every archived session for good? This cannot be undone.",
  "sessions.deleteForever": "Delete forever",
  "sessions.deleteForeverConfirm": "Delete \u201C{title}\u201D for good? This cannot be undone.",
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
  "cp.restoreAnswer": "Restore workspace to before this answer",
  "cp.rollback": "Rollback",
  "cp.restoreAnswerUnavailable": "This answer made no restorable file changes",
  "cp.restoreAnswerTitle": "Restore this answer\u2019s changes?",
  "cp.restoreAnswerHint": "Restore workspace files to the checkpoint before this answer\u2019s first file change. The conversation stays intact. {n} path(s) currently differ from it.",
  "cp.restoreAnswerNoop": "No tracked workspace files differ from this checkpoint. Git metadata (.git) is intentionally excluded and cannot be restored here.",
  "cp.restoreWorkspace": "Workspace: {path}",
  "cp.baseline": "baseline",
  "cp.noLabel": "(no label)",
  "cp.restoreTitle": "Restore checkpoint {id}?",
  "cp.restoreNoop": "Your working tree already matches this checkpoint; nothing would change.",
  "cp.restoreCount": "{n} file(s) would be written or removed. Your own git history, index, and stashes are not touched.",
  "cp.unprotected": "{n} of them are not tracked by your git, so this working copy is the only one:",
  "cp.andMore": "\u2026and {n} more",
  "cp.restoring": "Restoring\u2026",
  "cp.forkFailed": "Workspace files are restored, but switching the chat to the branch failed: {message}",
  "cp.forkUnavailable": "Workspace files are restored, but the chat branch point could not be located. Reopen the conversation to continue.",
  "turn.filesChanged": "{n} file(s) changed",
  "turn.checking": "Checking for file changes\u2026",
  "turn.toggleList": "Toggle the file list",
  "turn.review": "Review",
  "turn.open": "Open",
  "turn.edit": "Edit",
  "turn.copy": "Copy",
  "turn.copied": "Copied",
  "turn.undo": "Undo",
  "turn.undoTitle": "Undo this turn?",
  "turn.undoHint": "Workspace files go back to before this turn\u2019s {n} file change(s), and this turn and everything after it leave the branch (the original session keeps every record).",
  "turn.editTitle": "Edit this turn\u2019s question",
  "turn.editHint": "Sending restores the files to before this turn, removes this turn and everything after it from the branch, then re-answers with the edited question.",
  "turn.sendEdit": "Send & re-answer",
  "turn.stillRunning": "This turn is still running",
  "turn.firstTurnNoFork": "The session\u2019s first turn has no earlier branch point to cut at, so it cannot be undone or edited",
  "turn.firstTurnUndo": "This is the session\u2019s first turn \u2014 there is no earlier point to cut the chat at. The workspace files are restored, and a new session on the same project is opened.",
  "turn.trashFailed": "Files restored and a new session opened, but the original session could not be archived into the recycle bin (session admin may be off).",
  "turn.editSendFailed": "The branch was created, but re-sending failed: {message}. You can send the question manually in the new session.",
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
  // Settings tabs
  "tab.input": "\u8F93\u5165\u4E0E\u6A21\u578B",
  "tab.balance": "\u4F59\u989D",
  "tab.review": "\u5BA1\u67E5",
  "tab.files": "\u6587\u4EF6",
  "tab.sessions": "\u4F1A\u8BDD",
  "tab.plugins": "\u63D2\u4EF6",
  // Balance extras
  "balance.peak": "\u9AD8\u5CF0",
  "balance.offPeak": "\u4F4E\u8C37",
  "balance.poll": "\u8F6E\u8BE2\u95F4\u9694\uFF08\u79D2\uFF09",
  "balance.poll.hint": "\u4F59\u989D\u6587\u5B57\u6BCF N \u79D2\u81EA\u52A8\u5237\u65B0\u30020 \u8868\u793A\u4E0D\u8F6E\u8BE2\u3002",
  "balance.peakWindows": "\u9AD8\u5CF0\u65F6\u6BB5\uFF08\u5317\u4EAC\u65F6\u95F4\uFF09",
  "balance.peakWindows.hint": "\u5B98\u65B9\u65F6\u6BB5\u6362\u7B97\u4E3A\u5317\u4EAC\u65F6\u95F4\uFF1A\u5468\u4E00\u81F3\u5468\u4E94 09:00-12:00 \u4E0E 14:00-18:00\uFF0C\u7A97\u53E3\u5916\u534A\u4EF7\u3002\u9017\u53F7\u5206\u9694 HH:MM-HH:MM\u3002",
  "balance.peakWeekdays": "\u5468\u672B\u4E0D\u8BA1\u9AD8\u5CF0",
  "balance.peakWeekdays.hint": "\u5B98\u65B9\u89C4\u5219\uFF1A\u5468\u516D\u5468\u65E5\u5168\u5929\u6309\u4F4E\u8C37\u8BA1\u4EF7\u3002",
  "balance.badge.title": "DeepSeek \u4F59\u989D \xB7 \u9AD8\u5CF0\u7A97\u53E3 {windows}\uFF08\u5317\u4EAC\u65F6\u95F4\uFF09\xB7 key \u6765\u6E90 {source}",
  "section.effort": "\u63A8\u7406\u5F3A\u5EA6",
  "section.effort.desc": "\u4E3A\u7B2C\u4E09\u65B9\uFF08pi-ai\uFF09\u7EBF\u8DEF\u7684\u6BCF\u4E2A\u6A21\u578B\u58F0\u660E\u63A8\u7406\u6863\u4F4D\uFF0C\u58F0\u660E\u540E\u8F93\u5165\u6846\u81EA\u5E26\u7684\u5F3A\u5EA6\u9009\u62E9\u5668\u5C31\u4F1A\u5BF9\u8FD9\u4E9B\u6A21\u578B\u51FA\u73B0\u3002",
  "section.balance": "DeepSeek \u4F59\u989D",
  "section.balance.desc": "\u8BFB\u53D6\u5DF2\u914D\u7F6E\u7684 DeepSeek \u5B98\u65B9 API \u5BC6\u94A5\u7684\u8D26\u6237\u4F59\u989D\u3002\u5BC6\u94A5\u4E0D\u4F1A\u8FDB\u5165\u6D4F\u89C8\u5668\u3002",
  "section.review": "\u547D\u4EE4\u5BA1\u6838",
  "section.review.desc": "\u5148\u7528\u672C\u5730\u89C4\u5219\u7B5B\u67E5\u9AD8\u5371\u5DE5\u5177\u8C03\u7528\uFF0C\u547D\u4E2D\u7684\u518D\u4EA4\u7ED9\u7B2C\u4E8C\u4E2A\u6A21\u578B\u5224\u65AD\u3002\u5BA1\u6838\u53EA\u4F1A\u8BA9\u8C03\u7528\u66F4\u4E25\u683C\uFF0C\u4E0D\u4F1A\u653E\u5BBD\u3002",
  "section.explorer": "\u9879\u76EE\u6D4F\u89C8",
  "section.explorer.desc": "\u5DE5\u4F5C\u533A\u76EE\u5F55\u6811\u4E0E\u672A\u63D0\u4EA4\u7684\u6539\u52A8\u3002\u53EA\u8BFB\uFF1A\u80CC\u540E\u6BCF\u6761 git \u547D\u4EE4\u90FD\u662F\u67E5\u8BE2\u3002",
  "section.sessions": "\u4F1A\u8BDD",
  "section.sessions.desc": "\u56DE\u6536\u7AD9\u5728\u4FA7\u680F\u5E95\u90E8\u3001\u300C\u8BBE\u7F6E\u300D\u65C1\u8FB9\u3002\u5173\u95ED\u4F1A\u8BDD\u7BA1\u7406\u4F1A\u9690\u85CF\u56DE\u6536\u7AD9\uFF0C\u64A4\u9500/\u7F16\u8F91\u65F6\u539F\u4F1A\u8BDD\u4E5F\u4F1A\u7559\u5728\u5217\u8868\u91CC\u3002",
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
  "files.attach": "\u9644\u52A0\u6587\u4EF6",
  "files.attachHint": "\u4ECE\u672C\u673A\u9009\u4E00\u4E2A\u6587\u4EF6\u9644\u52A0\u8FDB\u6765",
  "files.notImage": "{name} \u4E0D\u662F\u56FE\u7247\uFF0C\u5DF2\u628A\u5B83\u7684\u6587\u672C\u5185\u5BB9\u52A0\u8FDB\u6D88\u606F\u3002",
  "files.unreadable": "{name} \u65E0\u6CD5\u9644\u52A0\uFF1A\u65E2\u4E0D\u662F\u56FE\u7247\uFF0C\u4E5F\u4E0D\u662F\u6587\u672C\u3002",
  "images.remove": "\u79FB\u9664 {name}",
  "images.earlier": "\u628A {name} \u5F80\u524D\u79FB",
  "images.later": "\u628A {name} \u5F80\u540E\u79FB",
  "images.busy": "\u8F93\u5165\u6846\u6B63\u5728\u53D1\u9001\uFF0C\u56FE\u7247\u987A\u5E8F\u4FDD\u6301\u539F\u6837\u3002",
  "images.drop": "\u62D6\u5165\u56FE\u7247\u5373\u53EF\u9644\u52A0",
  "images.dropLimits": "\u6700\u591A {count} \u5F20\uFF0C\u6BCF\u5F20 {size}",
  "images.rail": "\u8349\u7A3F\u56FE\u7247",
  "images.railMissing": "\u56FE\u7247\u680F\u672A\u6302\u8F7D",
  "effort.models": "\u6A21\u578B\u4E0E\u6863\u4F4D",
  "effort.defaultFull": "\u9ED8\u8BA4\u5B8C\u6574\u63A8\u7406\u6863\u4F4D",
  "effort.defaultFull.hint": "\u6CA1\u6709\u663E\u5F0F\u8986\u76D6\u7684\u6A21\u578B\u9ED8\u8BA4\u62E5\u6709 off\u3001minimal\u3001low\u3001medium\u3001high\u3001xhigh\u3001max \u5168\u90E8\u6863\u4F4D\u3002",
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
  "vision.defaultAll": "\u9ED8\u8BA4\u652F\u6301\u56FE\u7247",
  "vision.defaultAll.hint": "\u6CA1\u6709\u663E\u5F0F\u58F0\u660E\u8F93\u5165\u6A21\u6001\u7684\u6A21\u578B\u9ED8\u8BA4\u914D\u7F6E\u4E3A\u540C\u65F6\u652F\u6301\u6587\u5B57\u548C\u56FE\u7247\u3002",
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
  "review.writeOnly": "\u53EA\u5BA1\u67E5\u5199\u64CD\u4F5C",
  "review.writeOnly.hint": "\u5BBF\u4E3B\u5224\u5B9A\u4E3A\u53EA\u8BFB\u7684\u8C03\u7528\u76F4\u63A5\u653E\u884C\uFF1B\u6CA1\u6709\u53EA\u8BFB\u5143\u6570\u636E\u7684 Shell \u547D\u4EE4\u518D\u4F7F\u7528\u4E0B\u65B9\u53EA\u8BFB\u89C4\u5219\u5224\u65AD\u3002",
  "review.denyPatterns": "\u9AD8\u98CE\u9669\u89C4\u5219",
  "review.denyPatterns.hint": "\u6BCF\u884C\u4E00\u4E2A\u6B63\u5219\u8868\u8FBE\u5F0F\u3002\u89C4\u5219\u6A21\u5F0F\u4E0B\uFF0C\u547D\u4E2D\u7684\u5199\u64CD\u4F5C\u4F1A\u5347\u7EA7\u4EBA\u5DE5\u6216\u4EA4\u7ED9\u6A21\u578B\u5224\u65AD\u3002",
  "review.readPatterns": "\u53EA\u8BFB\u547D\u4EE4\u89C4\u5219",
  "review.readPatterns.hint": "\u6BCF\u884C\u4E00\u4E2A\u5339\u914D\u6574\u6761\u547D\u4EE4\u7684\u6B63\u5219\u8868\u8FBE\u5F0F\uFF1B\u4EC5\u5728\u5DE5\u5177\u6CA1\u6709\u53EA\u8BFB\u5143\u6570\u636E\u65F6\u4F7F\u7528\u3002",
  "review.absoluteDelete": "\u7EDD\u5BF9\u7981\u6B62\u5220\u9664",
  "review.absoluteDelete.hint": "\u8BC6\u522B\u5230\u5220\u9664\u64CD\u4F5C\u540E\u7ACB\u5373\u62D2\u7EDD\uFF0C\u6A21\u578B\u548C\u4EBA\u5DE5\u5BA1\u6279\u90FD\u4E0D\u80FD\u8986\u76D6\u3002",
  "review.deletePatterns": "\u5220\u9664\u64CD\u4F5C\u89C4\u5219",
  "review.deletePatterns.hint": "\u6BCF\u884C\u4E00\u4E2A\u6B63\u5219\u8868\u8FBE\u5F0F\uFF0C\u540C\u65F6\u5339\u914D\u5DE5\u5177\u540D\u548C\u547D\u4EE4\u6216\u53C2\u6570\u5185\u5BB9\u3002",
  "review.verdicts": "\u6700\u8FD1\u7684\u5224\u5B9A",
  "review.empty": "\u8FD8\u6CA1\u6709\u5BA1\u6838\u8FC7\u4EFB\u4F55\u547D\u4EE4\u3002",
  "review.count": "\u6700\u8FD1 {n} \u6761\u5224\u5B9A\u3002",
  "review.matched": "\u547D\u4E2D\u89C4\u5219\uFF1A",
  "review.off": "\u547D\u4EE4\u5BA1\u6838\u5DF2\u5173\u95ED\u3002",
  "review.modelPick": "\u5BA1\u67E5\u6A21\u578B",
  "review.modelPick.hint": "\u4ECE\u5DF2\u914D\u7F6E\u7684\u8DEF\u7531\u91CC\u9009\u62E9\u5BA1\u67E5\u6A21\u578B\uFF1B\u4F9B\u5E94\u5546\u968F\u6240\u9009\u6A21\u578B\u81EA\u52A8\u786E\u5B9A\u3002",
  "review.autoChip": "\u81EA\u52A8\u5BA1\u6838",
  "review.autoChip.hint": "\u6240\u6709\u5199\u547D\u4EE4\u5148\u4EA4\u5BA1\u67E5\u6A21\u578B\u5224\u5B9A\uFF0C\u6A21\u578B\u65E0\u6CD5\u5224\u65AD\u98CE\u9669\u65F6\u518D\u8BE2\u95EE\u7528\u6237\u3002",
  "explorer.side": "\u505C\u9760\u4F4D\u7F6E",
  "explorer.side.left": "\u5DE6\u4FA7",
  "explorer.side.right": "\u53F3\u4FA7",
  "explorer.defaultOpen": "\u9ED8\u8BA4\u5C55\u5F00",
  "explorer.gitignore": "\u9075\u5FAA .gitignore",
  "explorer.preview": "\u9884\u89C8",
  "explorer.changes": "\u5BA1\u67E5",
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
  "explorer.resize": "\u8C03\u6574\u9762\u677F\u5BBD\u5EA6",
  "explorer.openEditor": "\u6253\u5F00\u65B9\u5F0F",
  "explorer.openLabel": "\u6253\u5F00",
  "explorer.openEditorFailed": "\u6253\u4E0D\u5F00\uFF1A{message}",
  "explorer.openWith.explorer": "\u8D44\u6E90\u7BA1\u7406\u5668",
  "explorer.openWith.vscode": "VS Code",
  "explorer.openWith.idea": "IntelliJ IDEA",
  "explorer.viewFailed": "\u8BFB\u4E0D\u51FA\u8FD9\u4E2A\u6587\u4EF6\uFF1A{message}",
  "explorer.truncatedFile": "\u2026\u53EA\u663E\u793A\u524D {lines} \u884C\u3002",
  "explorer.close": "\u5173\u95ED\u9884\u89C8",
  "explorer.workspacePick": "\u5DE5\u4F5C\u533A",
  "explorer.views": "\u89C6\u56FE",
  "explorer.newTab": "\u65B0\u5EFA\u6807\u7B7E\u9875",
  "explorer.closeTab": "\u5173\u95ED\u6807\u7B7E\u9875",
  "explorer.unmodified": "{n} \u884C\u672A\u4FEE\u6539",
  "explorer.filterAll": "\u5168\u90E8",
  "explorer.filterStaged": "\u5DF2\u6682\u5B58",
  "explorer.filterUnstaged": "\u672A\u6682\u5B58",
  "explorer.reviewGroup": "\u6309\u6587\u4EF6\u5939\u5206\u7EC4",
  "explorer.reviewFlat": "\u5E73\u94FA\u5217\u8868",
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
  "sessions.gc": "\u6E05\u7406\u65E0\u7528\u9644\u4EF6",
  "sessions.gc.hint": "\u6C38\u4E45\u5220\u9664\u65F6\uFF0C\u5148\u626B\u63CF\u5176\u4F59\u6240\u6709\u4F1A\u8BDD\u518D\u79FB\u9664\u56FE\u7247\u6587\u4EF6\u3002\u5386\u53F2\u5F88\u5927\u65F6\u4F1A\u6162\u3002",
  "sessions.updatedAt": "\u66F4\u65B0\u4E8E {when}",
  "sessions.trashCount": "\u56DE\u6536\u7AD9\uFF08{n}\uFF09",
  "sessions.trashButton": "\u56DE\u6536\u7AD9",
  "sessions.trashEmpty": "\u56DE\u6536\u7AD9\u662F\u7A7A\u7684\u3002",
  "sessions.emptyTrash": "\u6E05\u7A7A\u56DE\u6536\u7AD9",
  "sessions.emptyTrashConfirm": "\u6C38\u4E45\u5220\u9664\u6240\u6709\u5DF2\u5F52\u6863\u4F1A\u8BDD\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002",
  "sessions.deleteForever": "\u6C38\u4E45\u5220\u9664",
  "sessions.deleteForeverConfirm": "\u6C38\u4E45\u5220\u9664\u300C{title}\u300D\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002",
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
  "cp.restoreAnswer": "\u6062\u590D\u5230\u6B64\u56DE\u7B54\u4E4B\u524D",
  "cp.rollback": "\u56DE\u6EDA",
  "cp.restoreAnswerUnavailable": "\u6B64\u56DE\u7B54\u6CA1\u6709\u53EF\u6062\u590D\u7684\u6587\u4EF6\u6539\u52A8",
  "cp.restoreAnswerTitle": "\u6062\u590D\u6B64\u56DE\u7B54\u7684\u6539\u52A8\uFF1F",
  "cp.restoreAnswerHint": "\u628A\u5DE5\u4F5C\u533A\u6587\u4EF6\u6062\u590D\u5230\u8FD9\u6761\u56DE\u7B54\u7B2C\u4E00\u6B21\u4FEE\u6539\u6587\u4EF6\u4E4B\u524D\u7684\u68C0\u67E5\u70B9\uFF1B\u804A\u5929\u8BB0\u5F55\u4FDD\u6301\u4E0D\u53D8\u3002\u5F53\u524D\u6709 {n} \u4E2A\u8DEF\u5F84\u4E0E\u8BE5\u68C0\u67E5\u70B9\u4E0D\u540C\u3002",
  "cp.restoreAnswerNoop": "\u5F53\u524D\u6CA1\u6709\u53EF\u6062\u590D\u7684\u5DE5\u4F5C\u533A\u6587\u4EF6\u5DEE\u5F02\u3002Git \u5143\u6570\u636E\uFF08.git\uFF09\u4F1A\u88AB\u523B\u610F\u6392\u9664\uFF0C\u4E0D\u80FD\u5728\u8FD9\u91CC\u6062\u590D\u3002",
  "cp.restoreWorkspace": "\u6062\u590D\u9879\u76EE\uFF1A{path}",
  "cp.baseline": "\u57FA\u7EBF",
  "cp.noLabel": "\uFF08\u65E0\u6807\u7B7E\uFF09",
  "cp.restoreTitle": "\u6062\u590D\u5230\u68C0\u67E5\u70B9 {id}\uFF1F",
  "cp.restoreNoop": "\u4F60\u7684\u5DE5\u4F5C\u533A\u5DF2\u7ECF\u548C\u8FD9\u4E2A\u68C0\u67E5\u70B9\u4E00\u81F4\uFF0C\u4E0D\u4F1A\u6709\u4EFB\u4F55\u53D8\u5316\u3002",
  "cp.restoreCount": "\u5C06\u5199\u5165\u6216\u5220\u9664 {n} \u4E2A\u6587\u4EF6\u3002\u4F60\u81EA\u5DF1\u7684 git \u5386\u53F2\u3001\u7D22\u5F15\u548C stash \u4E0D\u4F1A\u88AB\u89E6\u78B0\u3002",
  "cp.unprotected": "\u5176\u4E2D {n} \u4E2A\u6CA1\u6709\u88AB\u4F60\u7684 git \u8DDF\u8E2A\uFF0C\u4E5F\u5C31\u662F\u8BF4\u8FD9\u4EFD\u5DE5\u4F5C\u526F\u672C\u662F\u552F\u4E00\u7684\u4E00\u4EFD\uFF1A",
  "cp.andMore": "\u2026\u8FD8\u6709 {n} \u4E2A",
  "cp.restoring": "\u6B63\u5728\u6062\u590D\u2026",
  "cp.forkFailed": "\u5DE5\u4F5C\u533A\u6587\u4EF6\u5DF2\u6062\u590D\uFF0C\u4F46\u628A\u804A\u5929\u5207\u6362\u5230\u5206\u652F\u65F6\u5931\u8D25\uFF1A{message}",
  "cp.forkUnavailable": "\u5DE5\u4F5C\u533A\u6587\u4EF6\u5DF2\u6062\u590D\uFF0C\u4F46\u6CA1\u80FD\u5B9A\u4F4D\u804A\u5929\u5206\u652F\u7684\u4F4D\u7F6E\u3002\u91CD\u65B0\u6253\u5F00\u8FD9\u4E2A\u4F1A\u8BDD\u5373\u53EF\u7EE7\u7EED\u3002",
  "turn.filesChanged": "{n} \u4E2A\u6587\u4EF6\u5DF2\u66F4\u6539",
  "turn.checking": "\u6B63\u5728\u68C0\u67E5\u6587\u4EF6\u6539\u52A8\u2026",
  "turn.toggleList": "\u5C55\u5F00\u6216\u6536\u8D77\u6587\u4EF6\u5217\u8868",
  "turn.review": "\u5BA1\u67E5",
  "turn.open": "\u6253\u5F00",
  "turn.edit": "\u7F16\u8F91",
  "turn.copy": "\u590D\u5236",
  "turn.copied": "\u5DF2\u590D\u5236",
  "turn.undo": "\u64A4\u9500",
  "turn.undoTitle": "\u64A4\u9500\u8FD9\u4E00\u8F6E\uFF1F",
  "turn.undoHint": "\u5DE5\u4F5C\u533A\u6587\u4EF6\u5C06\u6062\u590D\u5230\u672C\u8F6E {n} \u4E2A\u6587\u4EF6\u6539\u52A8\u4E4B\u524D\uFF1B\u8FD9\u4E00\u8F6E\u53CA\u4E4B\u540E\u7684\u5BF9\u8BDD\u4F1A\u4ECE\u5F53\u524D\u5206\u652F\u79FB\u9664\uFF08\u539F\u4F1A\u8BDD\u4FDD\u7559\u5B8C\u6574\u8BB0\u5F55\uFF09\u3002",
  "turn.editTitle": "\u7F16\u8F91\u8FD9\u4E00\u8F6E\u7684\u63D0\u95EE",
  "turn.editHint": "\u53D1\u9001\u540E\uFF1A\u6587\u4EF6\u5148\u6062\u590D\u5230\u672C\u8F6E\u6539\u52A8\u4E4B\u524D\uFF0C\u8FD9\u4E00\u8F6E\u53CA\u4E4B\u540E\u7684\u5BF9\u8BDD\u4ECE\u5F53\u524D\u5206\u652F\u79FB\u9664\uFF0C\u7136\u540E\u7528\u4FEE\u6539\u540E\u7684\u63D0\u95EE\u91CD\u65B0\u56DE\u7B54\u3002",
  "turn.sendEdit": "\u53D1\u9001\u5E76\u91CD\u65B0\u56DE\u7B54",
  "turn.stillRunning": "\u672C\u8F6E\u8FD8\u5728\u8FDB\u884C\u4E2D",
  "turn.firstTurnNoFork": "\u4F1A\u8BDD\u7684\u7B2C\u4E00\u8F6E\u6CA1\u6709\u66F4\u65E9\u7684\u5206\u652F\u70B9\uFF0C\u65E0\u6CD5\u64A4\u9500\u6216\u7F16\u8F91",
  "turn.firstTurnUndo": "\u8FD9\u662F\u4F1A\u8BDD\u7684\u7B2C\u4E00\u8F6E\uFF0C\u6CA1\u6709\u66F4\u65E9\u7684\u4F4D\u7F6E\u53EF\u4EE5\u5207\u65AD\u804A\u5929\u3002\u5DE5\u4F5C\u533A\u6587\u4EF6\u4F1A\u6062\u590D\uFF0C\u5E76\u5C06\u5728\u540C\u4E00\u9879\u76EE\u65B0\u5EFA\u4E00\u4E2A\u4F1A\u8BDD\u3002",
  "turn.trashFailed": "\u6587\u4EF6\u5DF2\u6062\u590D\u5E76\u65B0\u5EFA\u4E86\u4F1A\u8BDD\uFF0C\u4F46\u539F\u4F1A\u8BDD\u672A\u80FD\u5F52\u6863\u8FDB\u56DE\u6536\u7AD9\uFF08\u4F1A\u8BDD\u7BA1\u7406\u53EF\u80FD\u5DF2\u5173\u95ED\uFF09\u3002",
  "turn.editSendFailed": "\u5206\u652F\u5DF2\u521B\u5EFA\uFF0C\u4F46\u91CD\u65B0\u53D1\u9001\u5931\u8D25\uFF1A{message}\u3002\u53EF\u4EE5\u5728\u65B0\u4F1A\u8BDD\u91CC\u624B\u52A8\u53D1\u9001\u8FD9\u6761\u63D0\u95EE\u3002",
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
function isPeakNow(windows, weekdaysOnly, now = /* @__PURE__ */ new Date()) {
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1e3);
  if (weekdaysOnly) {
    const day = beijing.getUTCDay();
    if (day === 0 || day === 6) return false;
  }
  const minutes = beijing.getUTCHours() * 60 + beijing.getUTCMinutes();
  return windows.some((window2) => {
    const match = /^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/.exec(window2);
    if (match === null) return false;
    const start = Number(match[1]) * 60 + Number(match[2]);
    const end = Number(match[3]) * 60 + Number(match[4]);
    return start <= end ? minutes >= start && minutes < end : minutes >= start || minutes < end;
  });
}
var HURT_CLASS = "dsh-ext-hurt";
var DROP_CLASS = "dsh-ext-drop";
var badgeStylesInjected = false;
function injectBadgeStyles() {
  if (badgeStylesInjected || typeof document === "undefined") return;
  badgeStylesInjected = true;
  const style2 = document.createElement("style");
  style2.dataset.dshPlugin = "dsh-ext";
  style2.textContent = `
@keyframes dsh-ext-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  75% { transform: translateX(-1px); }
}
.${HURT_CLASS} { animation: dsh-ext-shake 0.4s ease-in-out 2; }
@keyframes dsh-ext-fall {
  0% { opacity: 1; transform: translateY(2px); }
  100% { opacity: 0; transform: translateY(-16px); }
}
.${DROP_CLASS} {
  position: absolute; top: -8px; right: 0;
  font-size: 10px; font-weight: 600; line-height: 1;
  pointer-events: none; white-space: nowrap;
  animation: dsh-ext-fall 1.3s ease-out forwards;
}
`;
  document.head.appendChild(style2);
}
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
  const t = useT();
  injectBadgeStyles();
  const config = useClientConfig();
  const balance = config?.deepseekBalance;
  const pollSeconds = balance?.pollSeconds ?? 30;
  const peakWindows = balance?.peakWindowsBeijing ?? ["09:00-12:00", "14:00-18:00"];
  const weekdaysOnly = balance?.peakWeekdaysOnly ?? true;
  const view = useResource("/balance?refresh=1");
  const reloadRef = (0, import_react6.useRef)(view.reload);
  reloadRef.current = view.reload;
  (0, import_react6.useEffect)(() => {
    if (pollSeconds <= 0) return;
    const timer = window.setInterval(() => {
      reloadRef.current();
    }, pollSeconds * 1e3);
    return () => {
      window.clearInterval(timer);
    };
  }, [pollSeconds]);
  const primary = view.data?.rows[0];
  const total = (0, import_react6.useMemo)(() => primary === void 0 ? void 0 : Number.parseFloat(primary.totalBalance), [primary]);
  const previous = (0, import_react6.useRef)(void 0);
  const [drop, setDrop] = (0, import_react6.useState)(void 0);
  (0, import_react6.useEffect)(() => {
    if (total === void 0 || Number.isNaN(total)) return;
    const before = previous.current;
    previous.current = total;
    if (before !== void 0 && total < before) {
      setDrop({ amount: total - before, seq: Date.now() });
    }
  }, [total]);
  (0, import_react6.useEffect)(() => {
    if (drop === void 0) return;
    const timer = window.setTimeout(() => {
      setDrop(void 0);
    }, 1400);
    return () => {
      window.clearTimeout(timer);
    };
  }, [drop]);
  const peak = (0, import_react6.useMemo)(
    () => isPeakNow(peakWindows, weekdaysOnly),
    // Re-evaluated whenever the data (and thus roughly the minute) changes;
    // a wall-clock timer for the boundary minute is not worth a tick.
    [peakWindows, weekdaysOnly, view.data]
  );
  if (primary === void 0) return null;
  const hurt = drop !== void 0;
  const peakText = t(peak ? "balance.peak" : "balance.offPeak");
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "span",
    {
      "data-dsh-plugin": "dsh-ext",
      "data-dsh-part": "balance-badge",
      title: t("balance.badge.title", {
        windows: peakWindows.join(", "),
        source: view.data?.credentialSource ?? "unknown"
      }),
      className: hurt ? HURT_CLASS : void 0,
      style: {
        position: "relative",
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        fontSize: 11,
        whiteSpace: "nowrap",
        color: view.data?.available === false ? token.danger : token.textMuted
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { color: peak ? token.warn : token.success }, children: peakText }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: hurt ? { color: token.danger } : void 0, children: [
          primary.totalBalance,
          " ",
          primary.currency
        ] }),
        drop !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: DROP_CLASS, style: { color: token.danger }, children: drop.amount.toFixed(2) }, drop.seq)
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
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflow: "auto" }, children: entries.map((entry, index2) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
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
      `${entry.at}-${index2}`
    )) })
  ] });
}

// src/client/PluginsPanel.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function PluginsPanel(props) {
  const t = useT();
  const view = useResource("/plugins", props.enabled);
  const command = useCommand(view.reload);
  if (!props.enabled) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("plugins.off") });
  }
  const plugins = view.data?.plugins ?? [];
  const third = plugins.filter((row) => !row.builtin);
  const quarantined = view.data?.quarantine ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    view.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Notice, { kind: "error", children: view.error }),
    command.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Notice, { kind: "error", children: command.error }),
    quarantined.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Notice, { kind: "info", children: t("plugins.quarantinedCount", { n: quarantined.length }) }),
    third.length === 0 && view.data !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("plugins.none") }),
    third.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0 }, children: third.map((row) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "li",
      {
        style: { display: "flex", gap: 8, alignItems: "center", padding: "5px 2px", borderBottom: `1px solid ${token.border}` },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 12, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: row.name }),
            row.version !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 10, color: token.textMuted }, children: row.version })
          ] }),
          row.quarantined && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 10, color: token.danger }, children: t("plugins.quarantined") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              disabled: command.busy,
              onClick: () => {
                void command.run("/plugins/quarantine", { name: row.name, row: row.name, quarantined: !row.quarantined });
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
    quarantined.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { border: `1px solid ${token.border}`, borderRadius: 6, padding: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { style: { fontSize: 12 }, children: t("plugins.rescueTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { fontSize: 12, color: token.textMuted, margin: "6px 0" }, children: t("plugins.rescueBody") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("pre", { style: {
        ...inputStyle,
        margin: 0,
        padding: 8,
        fontSize: 11,
        lineHeight: 1.6,
        fontFamily: "ui-monospace, monospace",
        whiteSpace: "pre-wrap"
      }, children: `npx dsh-ext safe        # start without any third-party plugin
npx dsh-ext skip <name>     # skip one plugin
npx dsh-ext uninstall <name>
npx dsh-ext restore         # re-enable everything` }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { fontSize: 11, color: token.textMuted, margin: "6px 0 0" }, children: t("plugins.rescueFile", { file: view.data?.quarantineFile ?? "$DSH_HOME/cordis.patch.yml" }) })
    ] })
  ] });
}

// src/client/EffortsPanel.tsx
var import_react7 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { border: `1px solid ${token.accent}`, borderRadius: 6, padding: 10, margin: "4px 0" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { style: { fontSize: 12 }, children: props.model }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { style: { fontSize: 11, color: token.textMuted, margin: "4px 0 8px" }, children: t("effort.explain") }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("th", { style: { textAlign: "left", fontWeight: 500, fontSize: 11, color: token.textMuted, padding: "0 0 4px" }, children: t("effort.level") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("th", { style: { textAlign: "left", fontWeight: 500, fontSize: 11, color: token.textMuted, padding: "0 0 4px" }, children: t("effort.sentAs") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("th", {})
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("tbody", { children: rungs.map((rung, index2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("td", { style: { padding: "2px 6px 2px 0" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: rung.id }) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("td", { style: { padding: "2px 6px 2px 0" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "input",
          {
            type: "text",
            value: rung.wire,
            placeholder: rung.id === "off" ? t("effort.sendNothing") : t("effort.required"),
            "aria-label": `Wire value for ${rung.id}`,
            disabled: props.disabled || busy,
            onChange: (event) => {
              const next = [...rungs];
              const target = next[index2];
              if (target === void 0) return;
              next[index2] = { ...target, wire: event.currentTarget.value };
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
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("td", { style: { padding: "2px 0", textAlign: "right" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            type: "button",
            disabled: props.disabled || busy,
            onClick: () => {
              setRungs(rungs.filter((_2, at) => at !== index2));
            },
            style: { ...buttonStyle, fontSize: 11 },
            children: t("effort.remove")
          }
        ) })
      ] }, rung.id)) })
    ] }),
    available.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontSize: 11, color: token.textMuted, alignSelf: "center" }, children: t("effort.add") }),
      available.map((level) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
    error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { paddingTop: 8 }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Notice, { kind: "error", children: error }) }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 6, marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { flex: 1 } }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: busy, onClick: props.onClose, style: buttonStyle, children: t("common.close") })
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
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("section.effort") });
  }
  const providers = view.data?.providers ?? [];
  const readOnly = view.data?.writable === false;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    view.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Notice, { kind: "error", children: view.error }),
    readOnly && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Notice, { kind: "info", children: t("effort.readonly") }),
    visionError !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Notice, { kind: "error", children: visionError }),
    view.data !== void 0 && providers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("effort.none") }),
    providers.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", alignItems: "baseline", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { style: { fontSize: 12 }, children: provider.displayName }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { style: { fontSize: 10, color: token.textMuted }, children: provider.provider }),
        !provider.live && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontSize: 10, color: token.textMuted }, children: t("effort.notLoaded") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ul", { style: { listStyle: "none", margin: "4px 0 0", padding: 0 }, children: provider.models.map((model) => {
        const isEditing = editing?.provider === provider.provider && editing.model === model.id;
        const declared = model.overrideEfforts.length > 0;
        const inherited = model.adapterEfforts.length > 0;
        return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("li", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 8, alignItems: "center", padding: "3px 2px", borderBottom: `1px solid ${token.border}` }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { flex: 1, minWidth: 0, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: model.id }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontSize: 10, color: token.textMuted, flex: "0 0 auto" }, children: declared ? model.overrideEfforts.map((rung) => rung.id).join(" \xB7 ") : inherited ? t("effort.fromAdapter", { list: model.adapterEfforts.map((rung) => rung.id).join(" \xB7 ") }) : t("effort.noEfforts") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
          isEditing && view.data !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
var import_jsx_runtime6 = require("react/jsx-runtime");
function when(at, relative) {
  if (!Number.isFinite(at) || at <= 0) return "\u2014";
  const date2 = new Date(at);
  const elapsed = Date.now() - at;
  if (elapsed < 6e4) return relative.justNow;
  if (elapsed < 36e5) return relative.mins(Math.round(elapsed / 6e4));
  if (elapsed < 864e5) return relative.hours(Math.round(elapsed / 36e5));
  return date2.toLocaleString();
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
  const [diff2, setDiff] = (0, import_react8.useState)(void 0);
  const [note, setNote] = (0, import_react8.useState)(void 0);
  const askPreview = (0, import_react8.useCallback)(async (id) => {
    setPreviewing(true);
    setNote(void 0);
    const scope2 = props.sessionId === void 0 ? "" : `&session=${encodeURIComponent(props.sessionId)}`;
    const result = await callApi(`/checkpoints/preview?id=${encodeURIComponent(id)}${scope2}`);
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
    const scope2 = props.sessionId === void 0 ? "" : `&session=${encodeURIComponent(props.sessionId)}`;
    const result = await callApi(`/checkpoints/diff?id=${encodeURIComponent(id)}${scope2}`);
    setDiff({
      id,
      patch: result.ok ? result.value.patch.length === 0 ? t("cp.emptyDiff") : result.value.patch : `Could not read the diff: ${result.message}`
    });
  }, []);
  if (!props.enabled) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: token.textMuted }, children: t("cp.off") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { "data-dsh-plugin": "dsh-ext", "data-dsh-part": "checkpoints", style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { flex: 1 } }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", onClick: list.reload, style: { ...buttonStyle, fontSize: 11 }, children: t("common.refresh") })
    ] }),
    list.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Notice, { kind: "error", children: list.error }),
    command.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Notice, { kind: "error", children: command.error }),
    note !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Notice, { kind: "info", children: note }),
    pending !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: `1px solid ${token.danger}`, borderRadius: 6, padding: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { style: { fontSize: 12, color: token.text }, children: t("cp.restoreTitle", { id: pending.checkpointId.slice(0, 8) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: { fontSize: 12, color: token.textMuted, margin: "6px 0" }, children: pending.affected.length === 0 ? t("cp.restoreNoop") : t("cp.restoreCount", { n: pending.affected.length }) }),
      pending.unprotected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { margin: "6px 0" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: token.danger }, children: t("cp.unprotected", { n: pending.unprotected.length }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("ul", { style: { margin: "4px 0 0", paddingLeft: 18, fontSize: 11, color: token.textMuted, maxHeight: 120, overflow: "auto" }, children: [
          pending.unprotected.slice(0, 40).map((path) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("li", { children: path }, path)),
          pending.unprotected.length > 40 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("li", { children: t("cp.andMore", { n: pending.unprotected.length - 40 }) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 6, marginTop: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", onClick: () => {
          setPending(void 0);
        }, style: buttonStyle, children: t("common.cancel") })
      ] })
    ] }),
    list.data?.exists === false && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Notice, { kind: "info", children: t("cp.none") }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }, children: (list.data?.checkpoints ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
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
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("code", { style: { fontSize: 11, color: token.accent, flex: "0 0 auto" }, children: row.id.slice(0, 8) }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { flex: 1, minWidth: 0, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
            row.label.length === 0 ? t("cp.noLabel") : row.label,
            row.baseline && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { color: token.textMuted }, children: [
              " \xB7 ",
              t("cp.baseline")
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 10, color: token.textMuted, flex: "0 0 auto" }, children: when(row.at, relative) }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", onClick: () => {
            void showDiff(row.id);
          }, style: { ...buttonStyle, fontSize: 11 }, children: t("cp.diff") }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
    diff2 !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { borderTop: `1px solid ${token.border}`, paddingTop: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { style: { fontSize: 11 }, children: t("cp.checkpointN", { id: diff2.id.slice(0, 8) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { flex: 1 } }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", onClick: () => {
          setDiff(void 0);
        }, style: { ...buttonStyle, fontSize: 11 }, children: t("common.close") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("pre", { style: {
        margin: 0,
        maxHeight: 260,
        overflow: "auto",
        fontSize: 11,
        lineHeight: 1.45,
        fontFamily: "ui-monospace, monospace",
        color: token.text
      }, children: diff2.patch })
    ] })
  ] });
}

// src/client/ExplorerPanel.tsx
var import_react13 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/file-icons.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var COLOURS = {
  ts: "#3178c6",
  tsx: "#3178c6",
  mts: "#3178c6",
  cts: "#3178c6",
  js: "#f0db4f",
  jsx: "#f0db4f",
  mjs: "#f0db4f",
  cjs: "#f0db4f",
  json: "#cbcb41",
  jsonc: "#cbcb41",
  json5: "#cbcb41",
  py: "#3572a5",
  pyi: "#3572a5",
  rs: "#dea584",
  go: "#00add8",
  java: "#e76f00",
  kt: "#a97bff",
  kts: "#a97bff",
  c: "#649ad2",
  h: "#649ad2",
  cpp: "#f34b7d",
  cc: "#f34b7d",
  hpp: "#f34b7d",
  cs: "#68217a",
  rb: "#cc342d",
  php: "#8892bf",
  swift: "#ff5b32",
  sh: "#89e051",
  bash: "#89e051",
  zsh: "#89e051",
  fish: "#89e051",
  bat: "#c1f12e",
  cmd: "#c1f12e",
  ps1: "#5391fe",
  html: "#e34c26",
  htm: "#e34c26",
  css: "#563d7c",
  scss: "#c6538c",
  sass: "#c6538c",
  less: "#1d365d",
  vue: "#41b883",
  svelte: "#ff3e00",
  md: "#7ec7ff",
  mdx: "#7ec7ff",
  txt: "#9aa0a6",
  rst: "#9aa0a6",
  yml: "#cb171e",
  yaml: "#cb171e",
  toml: "#9c4221",
  ini: "#9aa0a6",
  env: "#e8d44d",
  xml: "#f1662a",
  svg: "#ffb13b",
  sql: "#dd8500",
  db: "#dd8500",
  sqlite: "#dd8500",
  png: "#a074c4",
  jpg: "#a074c4",
  jpeg: "#a074c4",
  gif: "#a074c4",
  webp: "#a074c4",
  ico: "#a074c4",
  bmp: "#a074c4",
  avif: "#a074c4",
  pdf: "#e5252a",
  zip: "#f9c33c",
  tar: "#f9c33c",
  gz: "#f9c33c",
  rar: "#f9c33c",
  "7z": "#f9c33c",
  lock: "#8b8b8b",
  exe: "#a3a3a3",
  dll: "#a3a3a3",
  so: "#a3a3a3",
  dylib: "#a3a3a3"
};
var BY_NAME = {
  "dockerfile": "#0db7ed",
  ".gitignore": "#f14e32",
  ".gitattributes": "#f14e32",
  ".gitmodules": "#f14e32",
  "license": "#d9b430",
  "license.md": "#d9b430",
  "readme.md": "#7ec7ff",
  "makefile": "#89e051",
  "package.json": "#8bc34a",
  "pnpm-lock.yaml": "#f9ad00",
  "package-lock.json": "#8b8b8b",
  "tsconfig.json": "#3178c6",
  ".npmrc": "#cb3837",
  ".editorconfig": "#9aa0a6"
};
var FALLBACK = "var(--dsw-alias-label-caption, #9aa0a6)";
function extensionOf(name2) {
  const at = name2.lastIndexOf(".");
  if (at <= 0) return "";
  return name2.slice(at + 1).toLowerCase();
}
function colourFor(name2) {
  return BY_NAME[name2.toLowerCase()] ?? COLOURS[extensionOf(name2)] ?? FALLBACK;
}
function FileIcon(props) {
  const size2 = props.size ?? 16;
  const colour = colourFor(props.name);
  const ext = extensionOf(props.name);
  const label = ext.slice(0, 2).toUpperCase();
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "svg",
    {
      width: size2,
      height: size2,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
      style: { flex: "0 0 auto" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "path",
          {
            d: "M3.6 1.9H9.1L12.9 5.6V14.1H3.6V1.9Z",
            stroke: colour,
            strokeWidth: "1.2",
            strokeLinejoin: "round",
            fill: colour,
            fillOpacity: "0.13"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("path", { d: "M9 2.1V5.7H12.7", stroke: colour, strokeWidth: "1.2", strokeLinejoin: "round" }),
        label.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "text",
          {
            x: "8.2",
            y: "11.9",
            textAnchor: "middle",
            style: { font: "bold 5.4px ui-sans-serif, system-ui, sans-serif" },
            fill: colour,
            children: label
          }
        )
      ]
    }
  );
}
function FolderIcon(props) {
  const size2 = props.size ?? 16;
  const colour = "var(--dsw-alias-brand-primary, #6aa9ff)";
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", style: { flex: "0 0 auto" }, children: props.open ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "path",
    {
      d: "M1.7 4.1H6.1L7.3 5.7H13.1V6.7H4.2L2.2 13.1H1.7V4.1Z M4.9 7.7H14.6L12.8 13.4H3.1L4.9 7.7Z",
      stroke: colour,
      strokeWidth: "1.2",
      strokeLinejoin: "round",
      fill: colour,
      fillOpacity: "0.16"
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "path",
    {
      d: "M1.9 3.6H6.3L7.5 5.2H14.1V13.1H1.9V3.6Z",
      stroke: colour,
      strokeWidth: "1.2",
      strokeLinejoin: "round",
      fill: colour,
      fillOpacity: "0.16"
    }
  ) });
}

// src/client/icons.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("rect", { x: "0.68", y: "1.2", width: "14.64", height: "13.6", rx: "2.6", stroke: "currentColor", strokeWidth: "1.36" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M10.46 1.88V14.12", stroke: "currentColor", strokeWidth: "1.36" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M11.14 2.56H14.64V13.44H11.14V2.56Z", fill: "currentColor", opacity: "0.55" })
  ] });
}
function PanelLeftIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("rect", { x: "0.68", y: "1.2", width: "14.64", height: "13.6", rx: "2.6", stroke: "currentColor", strokeWidth: "1.36" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M5.54 1.88V14.12", stroke: "currentColor", strokeWidth: "1.36" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M1.36 2.56H4.86V13.44H1.36V2.56Z", fill: "currentColor", opacity: "0.55" })
  ] });
}
function FilesIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M2.4 2.2H6.2L7.4 3.8H13.6V13.2H2.4V2.2Z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M2.4 6.4H13.6", stroke: "currentColor", strokeWidth: "1.2" })
  ] });
}
function ChevronIcon(props) {
  const size2 = props.size ?? 14;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
function PlusIcon(props) {
  const size2 = props.size ?? 14;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M8 3.4V12.6M3.4 8H12.6", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }) });
}
function CloseIcon(props) {
  const size2 = props.size ?? 12;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M4.2 4.2L11.8 11.8M11.8 4.2L4.2 11.8", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) });
}
function VscodeIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "path",
      {
        d: "M11.55 1.05L6.5 5.85L3.6 3.65L2.05 4.35L4.75 7.05C5.05 7.35 5.05 7.85 4.75 8.15L2.05 10.85L3.6 11.55L6.5 9.35L11.55 14.15C12.05 14.6 12.85 14.35 12.95 13.7V1.5C12.85 0.85 12.05 0.6 11.55 1.05Z",
        fill: "currentColor"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M11.5 4.35V10.85L7.85 7.6L11.5 4.35Z", fill: "var(--dsw-alias-bg-base, #101014)" })
  ] });
}
function PaperclipIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "path",
    {
      d: "M12.4 7.3L7.7 12a2.9 2.9 0 0 1-4.1-4.1l5-5a1.95 1.95 0 0 1 2.75 2.75l-5 5a0.97 0.97 0 0 1-1.38-1.38l4.4-4.4",
      stroke: "currentColor",
      strokeWidth: "1.3",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function EditIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M9.6 2.9l3.5 3.5L5.4 14.1l-4 .5.5-4L9.6 2.9Z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M8.1 4.4l3.5 3.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" })
  ] });
}
function FolderIcon2(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "path",
    {
      d: "M2 3.5C2 2.67 2.67 2 3.5 2H6L7.5 3.5H12.5C13.33 3.5 14 4.17 14 5V12.5C14 13.33 13.33 14 12.5 14H3.5C2.67 14 2 13.33 2 12.5V3.5Z",
      fill: "currentColor",
      opacity: "0.9"
    }
  ) });
}
function IdeaIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("rect", { x: "1", y: "1", width: "14", height: "14", rx: "1", fill: "currentColor", opacity: "0.9" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "path",
      {
        d: "M3 11.5H7.5V12.5H3V11.5ZM3.5 4H5.2L6.8 7.3L8.3 4H10L7.7 9H5.8L3.5 4ZM9.5 4H13V5.2H11V6.5H12.8V7.7H11V9H13V10.2H9.5V4Z",
        fill: "var(--dsw-alias-bg-base, #fff)"
      }
    )
  ] });
}
function UndoIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M2.6 3.4v4h4", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M3.1 7.2a5.3 5.3 0 1 1 1.4 5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" })
  ] });
}
function GitIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", { cx: "4.2", cy: "3.6", r: "1.9", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", { cx: "4.2", cy: "12.4", r: "1.9", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", { cx: "11.8", cy: "8", r: "1.9", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M4.2 5.5V10.5", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M9.9 8H7.6C5.72 8 4.2 6.48 4.2 4.6", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" })
  ] });
}
function ShieldCheckIcon(props) {
  const size2 = props.size ?? 14;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "path",
      {
        d: "M8.2 1L14.8 3.5V7C14.8 12 11.05 14.2 8.2 15.1C5.35 14.2 1.6 12 1.6 7V3.5L8.2 1Z",
        stroke: "currentColor",
        strokeWidth: "1.3",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M5.4 7.7L7.4 9.7L11 6", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" })
  ] });
}
function TrashIcon(props) {
  const size2 = props.size ?? 16;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size2, height: size2, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M2.5 4.2H13.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M5.6 4.2V3.2C5.6 2.7 6.1 2.2 6.7 2.2H9.3C9.9 2.2 10.4 2.7 10.4 3.2V4.2", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M3.4 4.2L4.1 13.1C4.15 13.7 4.7 14.1 5.3 14.1H10.7C11.3 14.1 11.85 13.7 11.9 13.1L12.6 4.2", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M6.8 6.7V11.6M9.2 6.7V11.6", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" })
  ] });
}

// src/client/tabs.ts
var import_react9 = require("react");
var STORAGE_PREFIX = "dsh-ext:side-panel-tabs:";
var LEGACY_STORAGE_KEY = "dsh-ext:side-panel-tabs";
var DEFAULT_SCOPE = "unscoped";
function storageKey(scope) {
  return `${STORAGE_PREFIX}${encodeURIComponent(scope)}`;
}
function initial() {
  return {
    tabs: [{ id: "files", kind: "files" }, { id: "review", kind: "review" }],
    activeId: "files"
  };
}
function tabId(kind, path) {
  return kind === "editor" || kind === "diff" ? `${kind}:${path ?? ""}` : kind;
}
function parseState(stored) {
  if (stored === null) return void 0;
  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null) return void 0;
    const raw = parsed.tabs;
    if (!Array.isArray(raw)) return void 0;
    const tabs = raw.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const rawKind = entry.kind;
      const kind = rawKind === "changes" ? "review" : rawKind;
      const path = entry.path;
      if (kind !== "files" && kind !== "review" && kind !== "editor" && kind !== "diff") return [];
      if ((kind === "editor" || kind === "diff") && typeof path !== "string") return [];
      return [{
        id: tabId(kind, typeof path === "string" ? path : void 0),
        kind,
        ...typeof path === "string" ? { path } : {}
      }];
    });
    if (tabs.length === 0) return void 0;
    const storedActive = parsed.activeId;
    const activeId = typeof storedActive === "string" && tabs.some((tab) => tab.id === storedActive) ? storedActive : tabs[0].id;
    return { tabs, activeId };
  } catch {
    return void 0;
  }
}
function read(scope) {
  try {
    const own = parseState(window.localStorage.getItem(storageKey(scope)));
    if (own !== void 0) return own;
    if (window.localStorage.getItem(LEGACY_STORAGE_KEY) !== null) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
  }
  return initial();
}
var states = /* @__PURE__ */ new Map();
var listeners2 = /* @__PURE__ */ new Map();
function current(scope) {
  let state = states.get(scope);
  if (state === void 0) {
    state = read(scope);
    states.set(scope, state);
  }
  return state;
}
function commit(scope, next) {
  states.set(scope, next);
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(next));
  } catch {
  }
  for (const listener of [...listeners2.get(scope) ?? []]) listener();
}
function open(scope, kind, path) {
  const now = current(scope);
  const id = tabId(kind, path);
  if (now.tabs.some((tab2) => tab2.id === id)) {
    if (now.activeId !== id) commit(scope, { ...now, activeId: id });
    return;
  }
  const tab = { id, kind, ...path === void 0 ? {} : { path } };
  commit(scope, { tabs: [...now.tabs, tab], activeId: id });
}
function select(scope, id) {
  const now = current(scope);
  if (now.activeId === id || !now.tabs.some((tab) => tab.id === id)) return;
  commit(scope, { ...now, activeId: id });
}
function close(scope, id) {
  const now = current(scope);
  const index2 = now.tabs.findIndex((tab) => tab.id === id);
  if (index2 < 0) return;
  const tabs = now.tabs.filter((tab) => tab.id !== id);
  if (now.activeId !== id) {
    commit(scope, { tabs, activeId: now.activeId });
    return;
  }
  const neighbour = tabs[Math.max(0, index2 - 1)];
  commit(scope, { tabs, activeId: neighbour?.id ?? "" });
}
function useTabs(scope) {
  const [, bump] = (0, import_react9.useState)(0);
  const key = scope ?? DEFAULT_SCOPE;
  const now = current(key);
  (0, import_react9.useEffect)(() => {
    const listener = () => {
      bump((n) => n + 1);
    };
    let scoped = listeners2.get(key);
    if (scoped === void 0) {
      scoped = /* @__PURE__ */ new Set();
      listeners2.set(key, scoped);
    }
    scoped.add(listener);
    return () => {
      scoped.delete(listener);
      if (scoped.size === 0) listeners2.delete(key);
    };
  }, [key]);
  const openBound = (0, import_react9.useCallback)((kind, path) => {
    open(key, kind, path);
  }, [key]);
  const selectBound = (0, import_react9.useCallback)((id) => {
    select(key, id);
  }, [key]);
  const closeBound = (0, import_react9.useCallback)((id) => {
    close(key, id);
  }, [key]);
  return { ...now, open: openBound, select: selectBound, close: closeBound };
}
var panelScope;
function bindPanelTabs(scope) {
  panelScope = scope;
  return () => {
    if (panelScope === scope) panelScope = void 0;
  };
}
function currentPanelScope() {
  return panelScope;
}
function openPanelTab(scope, kind, path) {
  open(scope, kind, path);
}

// src/client/DiffView.tsx
var import_react12 = require("react");

// node_modules/.pnpm/react-diff-view@3.3.3_react@18.3.1/node_modules/react-diff-view/es/index.js
var import_jsx_runtime9 = require("react/jsx-runtime");
var import_react10 = require("react");
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty$1(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty$1(obj, key, value) {
  return (key = function(arg) {
    var key2 = function(input, hint) {
      if ("object" != typeof input || null === input) return input;
      var prim = input[Symbol.toPrimitive];
      if (void 0 !== prim) {
        var res = prim.call(input, hint || "default");
        if ("object" != typeof res) return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === hint ? String : Number)(input);
    }(arg, "string");
    return "symbol" == typeof key2 ? key2 : String(key2);
  }(key)) in obj ? Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true }) : obj[key] = value, obj;
}
function _objectWithoutProperties(source, excluded) {
  if (null == source) return {};
  var key, i, target = function(source2, excluded2) {
    if (null == source2) return {};
    var key2, i2, target2 = {}, sourceKeys = Object.keys(source2);
    for (i2 = 0; i2 < sourceKeys.length; i2++) key2 = sourceKeys[i2], excluded2.indexOf(key2) >= 0 || (target2[key2] = source2[key2]);
    return target2;
  }(source, excluded);
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) key = sourceSymbolKeys[i], excluded.indexOf(key) >= 0 || Object.prototype.propertyIsEnumerable.call(source, key) && (target[key] = source[key]);
  }
  return target;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || function(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e, n, i2, u, a = [], f = true, o = false;
      try {
        if (i2 = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i2.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}
function _toConsumableArray(arr) {
  return function(arr2) {
    if (Array.isArray(arr2)) return _arrayLikeToArray(arr2);
  }(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || function() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }();
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArray(iter) {
  if ("undefined" != typeof Symbol && null != iter[Symbol.iterator] || null != iter["@@iterator"]) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (o) {
    if ("string" == typeof o) return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    return "Object" === n && o.constructor && (n = o.constructor.name), "Map" === n || "Set" === n ? Array.from(o) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _arrayLikeToArray(o, minLen) : void 0;
  }
}
function _arrayLikeToArray(arr, len) {
  (null == len || len > arr.length) && (len = arr.length);
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = "undefined" != typeof Symbol && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && "number" == typeof o.length) {
      it && (o = it);
      var i = 0, F = function() {
      };
      return { s: F, n: function() {
        return i >= o.length ? { done: true } : { done: false, value: o[i++] };
      }, e: function(e) {
        throw e;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var err, normalCompletion = true, didErr = false;
  return { s: function() {
    it = it.call(o);
  }, n: function() {
    var step = it.next();
    return normalCompletion = step.done, step;
  }, e: function(e) {
    didErr = true, err = e;
  }, f: function() {
    try {
      normalCompletion || null == it.return || it.return();
    } finally {
      if (didErr) throw err;
    }
  } };
}
var commonjsGlobal = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
function createCommonjsModule(fn, module2) {
  return fn(module2 = { exports: {} }, module2.exports), module2.exports;
}
var classnames = createCommonjsModule(function(module2) {
  !function() {
    var hasOwn = {}.hasOwnProperty;
    function classNames() {
      for (var classes = [], i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg) {
          var argType = typeof arg;
          if ("string" === argType || "number" === argType) classes.push(arg);
          else if (Array.isArray(arg)) {
            if (arg.length) {
              var inner = classNames.apply(null, arg);
              inner && classes.push(inner);
            }
          } else if ("object" === argType) {
            if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes("[native code]")) {
              classes.push(arg.toString());
              continue;
            }
            for (var key in arg) hasOwn.call(arg, key) && arg[key] && classes.push(key);
          }
        }
      }
      return classes.join(" ");
    }
    module2.exports ? (classNames.default = classNames, module2.exports = classNames) : window.classNames = classNames;
  }();
});
var DEFAULT_CONTEXT_VALUE = { hunkClassName: "", lineClassName: "", gutterClassName: "", codeClassName: "", monotonous: false, gutterType: "default", viewType: "split", widgets: {}, hideGutter: false, selectedChanges: [], generateAnchorID: function() {
}, generateLineClassName: function() {
}, renderGutter: function(_ref) {
  var renderDefault = _ref.renderDefault;
  return (0, _ref.wrapInAnchor)(renderDefault());
}, codeEvents: {}, gutterEvents: {} };
var ContextType = (0, import_react10.createContext)(DEFAULT_CONTEXT_VALUE);
var Provider = ContextType.Provider;
var useDiffSettings = function() {
  return (0, import_react10.useContext)(ContextType);
};
var gitdiffParser = createCommonjsModule(function(module2, exports) {
  !function(root) {
    function parsePathFromFirstLine(line) {
      var filesStr = line.slice(11), oldPath = null, newPath = null;
      switch (filesStr.indexOf('"')) {
        case -1:
          oldPath = (segs = filesStr.split(" "))[0].slice(2), newPath = segs[1].slice(2);
          break;
        case 0:
          var nextQuoteIndex = filesStr.indexOf('"', 2);
          oldPath = filesStr.slice(3, nextQuoteIndex);
          var newQuoteIndex = filesStr.indexOf('"', nextQuoteIndex + 1);
          newPath = newQuoteIndex < 0 ? filesStr.slice(nextQuoteIndex + 4) : filesStr.slice(newQuoteIndex + 3, -1);
          break;
        default:
          var segs;
          oldPath = (segs = filesStr.split(" "))[0].slice(2), newPath = segs[1].slice(3, -1);
      }
      return { oldPath, newPath };
    }
    var parser = { parse: function(source) {
      for (var currentInfo, currentHunk, changeOldLine, changeNewLine, paths, infos = [], stat = 2, lines = source.split("\n"), linesLen = lines.length, i = 0; i < linesLen; ) {
        var line = lines[i];
        if (0 === line.indexOf("diff --git")) {
          currentInfo = { hunks: [], oldEndingNewLine: true, newEndingNewLine: true, oldPath: (paths = parsePathFromFirstLine(line)).oldPath, newPath: paths.newPath }, infos.push(currentInfo);
          var simiLine, currentInfoType = null;
          simiLoop: for (; simiLine = lines[++i]; ) {
            var spaceIndex = simiLine.indexOf(" "), infoType = spaceIndex > -1 ? simiLine.slice(0, spaceIndex) : infoType;
            switch (infoType) {
              case "diff":
                i--;
                break simiLoop;
              case "deleted":
              case "new":
                var leftStr = simiLine.slice(spaceIndex + 1);
                0 === leftStr.indexOf("file mode") && (currentInfo["new" === infoType ? "newMode" : "oldMode"] = leftStr.slice(10));
                break;
              case "similarity":
                currentInfo.similarity = parseInt(simiLine.split(" ")[2], 10);
                break;
              case "index":
                var segs = simiLine.slice(spaceIndex + 1).split(" "), revs = segs[0].split("..");
                currentInfo.oldRevision = revs[0], currentInfo.newRevision = revs[1], segs[1] && (currentInfo.oldMode = currentInfo.newMode = segs[1]);
                break;
              case "copy":
              case "rename":
                var infoStr = simiLine.slice(spaceIndex + 1);
                0 === infoStr.indexOf("from") ? currentInfo.oldPath = infoStr.slice(5) : currentInfo.newPath = infoStr.slice(3), currentInfoType = infoType;
                break;
              case "---":
                var oldPath = simiLine.slice(spaceIndex + 1), newPath = lines[++i].slice(4);
                "/dev/null" === oldPath ? (newPath = newPath.slice(2), currentInfoType = "add") : "/dev/null" === newPath ? (oldPath = oldPath.slice(2), currentInfoType = "delete") : (currentInfoType = "modify", oldPath = oldPath.slice(2), newPath = newPath.slice(2)), oldPath && (currentInfo.oldPath = oldPath), newPath && (currentInfo.newPath = newPath), stat = 5;
                break simiLoop;
            }
          }
          currentInfo.type = currentInfoType || "modify";
        } else if (0 === line.indexOf("Binary")) currentInfo.isBinary = true, currentInfo.type = line.indexOf("/dev/null and") >= 0 ? "add" : line.indexOf("and /dev/null") >= 0 ? "delete" : "modify", stat = 2, currentInfo = null;
        else if (5 === stat) if (0 === line.indexOf("@@")) {
          var match = /^@@\s+-([0-9]+)(,([0-9]+))?\s+\+([0-9]+)(,([0-9]+))?/.exec(line);
          currentHunk = { content: line, oldStart: match[1] - 0, newStart: match[4] - 0, oldLines: match[3] - 0 || 1, newLines: match[6] - 0 || 1, changes: [] }, currentInfo.hunks.push(currentHunk), changeOldLine = currentHunk.oldStart, changeNewLine = currentHunk.newStart;
        } else {
          var typeChar = line.slice(0, 1), change = { content: line.slice(1) };
          switch (typeChar) {
            case "+":
              change.type = "insert", change.isInsert = true, change.lineNumber = changeNewLine, changeNewLine++;
              break;
            case "-":
              change.type = "delete", change.isDelete = true, change.lineNumber = changeOldLine, changeOldLine++;
              break;
            case " ":
              change.type = "normal", change.isNormal = true, change.oldLineNumber = changeOldLine, change.newLineNumber = changeNewLine, changeOldLine++, changeNewLine++;
              break;
            case "\\":
              var lastChange = currentHunk.changes[currentHunk.changes.length - 1];
              lastChange.isDelete || (currentInfo.newEndingNewLine = false), lastChange.isInsert || (currentInfo.oldEndingNewLine = false);
          }
          change.type && currentHunk.changes.push(change);
        }
        i++;
      }
      return infos;
    } };
    module2.exports = parser;
  }();
});
function isInsert(change) {
  return "insert" === change.type;
}
function isDelete(change) {
  return "delete" === change.type;
}
function isNormal(change) {
  return "normal" === change.type;
}
function mapHunk(hunk, options) {
  var changes = "zip" === options.nearbySequences ? function(changes2) {
    var _changes$reduce = changes2.reduce(function(_ref, current3, i) {
      var _ref2 = _slicedToArray(_ref, 3), result = _ref2[0], last = _ref2[1], lastDeletionIndex = _ref2[2];
      return last ? isInsert(current3) && lastDeletionIndex >= 0 ? (result.splice(lastDeletionIndex + 1, 0, current3), [result, current3, lastDeletionIndex + 2]) : (result.push(current3), [result, current3, isDelete(current3) && isDelete(last) ? lastDeletionIndex : i]) : (result.push(current3), [result, current3, isDelete(current3) ? i : -1]);
    }, [[], null, -1]);
    return _slicedToArray(_changes$reduce, 1)[0];
  }(hunk.changes) : hunk.changes;
  return _objectSpread2(_objectSpread2({}, hunk), {}, { isPlain: false, changes });
}
function parseDiff(text) {
  var options = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, diffText2 = function(text2) {
    if (text2.startsWith("diff --git")) return text2;
    var indexOfFirstLineBreak = text2.indexOf("\n"), indexOfSecondLineBreak = text2.indexOf("\n", indexOfFirstLineBreak + 1), firstLine = text2.slice(0, indexOfFirstLineBreak), secondLine = text2.slice(indexOfFirstLineBreak + 1, indexOfSecondLineBreak), oldPath = firstLine.split(" ").slice(1, -3).join(" "), newPath = secondLine.split(" ").slice(1, -3).join(" ");
    return ["diff --git a/".concat(oldPath, " b/").concat(newPath), "index 1111111..2222222 100644", "--- a/".concat(oldPath), "+++ b/".concat(newPath), text2.slice(indexOfSecondLineBreak + 1)].join("\n");
  }(text.trimStart());
  return gitdiffParser.parse(diffText2).map(function(file) {
    return function(file2, options2) {
      var hunks = file2.hunks.map(function(hunk) {
        return mapHunk(hunk, options2);
      });
      return _objectSpread2(_objectSpread2({}, file2), {}, { hunks });
    }(file, options);
  });
}
function first(array) {
  return array[0];
}
function last$1(array) {
  return array[array.length - 1];
}
function sideToProperty(side) {
  return ["".concat(side, "Start"), "".concat(side, "Lines")];
}
function computeLineNumberFactory(side) {
  return "old" === side ? function(change) {
    return isInsert(change) ? -1 : isNormal(change) ? change.oldLineNumber : change.lineNumber;
  } : function(change) {
    return isDelete(change) ? -1 : isNormal(change) ? change.newLineNumber : change.lineNumber;
  };
}
function isInHunkFactory(startProperty, linesProperty) {
  return function(hunk, lineNumber) {
    var start = hunk[startProperty], end = start + hunk[linesProperty];
    return lineNumber >= start && lineNumber < end;
  };
}
function isBetweenHunksFactory(startProperty, linesProperty) {
  return function(previousHunk, nextHunk, lineNumber) {
    var start = previousHunk[startProperty] + previousHunk[linesProperty], end = nextHunk[startProperty];
    return lineNumber >= start && lineNumber < end;
  };
}
function findChangeByLineNumberFactory(side) {
  var computeLineNumber = computeLineNumberFactory(side), findContainerHunk = function(side2) {
    var _sideToProperty2 = _slicedToArray(sideToProperty(side2), 2), isInHunk = isInHunkFactory(_sideToProperty2[0], _sideToProperty2[1]);
    return function(hunks, lineNumber) {
      return hunks.find(function(hunk) {
        return isInHunk(hunk, lineNumber);
      });
    };
  }(side);
  return function(hunks, lineNumber) {
    var containerHunk = findContainerHunk(hunks, lineNumber);
    if (containerHunk) return containerHunk.changes.find(function(change) {
      return computeLineNumber(change) === lineNumber;
    });
  };
}
function getCorrespondingLineNumberFactory(baseSide) {
  var anotherSide = "old" === baseSide ? "new" : "old", _sideToProperty4 = _slicedToArray(sideToProperty(baseSide), 2), baseStart = _sideToProperty4[0], baseLines = _sideToProperty4[1], _sideToProperty6 = _slicedToArray(sideToProperty(anotherSide), 2), correspondingStart = _sideToProperty6[0], correspondingLines = _sideToProperty6[1], baseLineNumber = computeLineNumberFactory(baseSide), correspondingLineNumber = computeLineNumberFactory(anotherSide), isInHunk = isInHunkFactory(baseStart, baseLines), isBetweenHunks = isBetweenHunksFactory(baseStart, baseLines);
  return function(hunks, lineNumber) {
    var firstHunk = first(hunks);
    if (lineNumber < firstHunk[baseStart]) {
      var spanFromStart = firstHunk[baseStart] - lineNumber;
      return firstHunk[correspondingStart] - spanFromStart;
    }
    var lastHunk = last$1(hunks);
    if (lastHunk[baseStart] + lastHunk[baseLines] <= lineNumber) {
      var spanFromEnd = lineNumber - lastHunk[baseStart] - lastHunk[baseLines];
      return lastHunk[correspondingStart] + lastHunk[correspondingLines] + spanFromEnd;
    }
    for (var i = 0; i < hunks.length; i++) {
      var currentHunk = hunks[i], nextHunk = hunks[i + 1];
      if (isInHunk(currentHunk, lineNumber)) {
        var changeIndex = currentHunk.changes.findIndex(function(change2) {
          return baseLineNumber(change2) === lineNumber;
        }), change = currentHunk.changes[changeIndex];
        if (isNormal(change)) return correspondingLineNumber(change);
        var possibleCorrespondingChangeIndex = isDelete(change) ? changeIndex + 1 : changeIndex - 1, possibleCorrespondingChange = currentHunk.changes[possibleCorrespondingChangeIndex];
        if (!possibleCorrespondingChange) return -1;
        var negativeChangeType = isInsert(change) ? "delete" : "insert";
        return possibleCorrespondingChange.type === negativeChangeType ? correspondingLineNumber(possibleCorrespondingChange) : -1;
      }
      if (isBetweenHunks(currentHunk, nextHunk, lineNumber)) {
        var _spanFromEnd = lineNumber - currentHunk[baseStart] - currentHunk[baseLines];
        return currentHunk[correspondingStart] + currentHunk[correspondingLines] + _spanFromEnd;
      }
    }
    throw new Error("Unexpected line position ".concat(lineNumber));
  };
}
var _baseFindIndex = function(array, predicate, fromIndex, fromRight) {
  for (var length = array.length, index2 = fromIndex + (fromRight ? 1 : -1); fromRight ? index2-- : ++index2 < length; ) if (predicate(array[index2], index2, array)) return index2;
  return -1;
};
var _listCacheClear = function() {
  this.__data__ = [], this.size = 0;
};
var eq_1 = function(value, other) {
  return value === other || value != value && other != other;
};
var _assocIndexOf = function(array, key) {
  for (var length = array.length; length--; ) if (eq_1(array[length][0], key)) return length;
  return -1;
};
var splice = Array.prototype.splice;
var _listCacheDelete = function(key) {
  var data = this.__data__, index2 = _assocIndexOf(data, key);
  return !(index2 < 0) && (index2 == data.length - 1 ? data.pop() : splice.call(data, index2, 1), --this.size, true);
};
var _listCacheGet = function(key) {
  var data = this.__data__, index2 = _assocIndexOf(data, key);
  return index2 < 0 ? void 0 : data[index2][1];
};
var _listCacheHas = function(key) {
  return _assocIndexOf(this.__data__, key) > -1;
};
var _listCacheSet = function(key, value) {
  var data = this.__data__, index2 = _assocIndexOf(data, key);
  return index2 < 0 ? (++this.size, data.push([key, value])) : data[index2][1] = value, this;
};
function ListCache(entries) {
  var index2 = -1, length = null == entries ? 0 : entries.length;
  for (this.clear(); ++index2 < length; ) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = _listCacheClear, ListCache.prototype.delete = _listCacheDelete, ListCache.prototype.get = _listCacheGet, ListCache.prototype.has = _listCacheHas, ListCache.prototype.set = _listCacheSet;
var _ListCache = ListCache;
var _stackClear = function() {
  this.__data__ = new _ListCache(), this.size = 0;
};
var _stackDelete = function(key) {
  var data = this.__data__, result = data.delete(key);
  return this.size = data.size, result;
};
var _stackGet = function(key) {
  return this.__data__.get(key);
};
var _stackHas = function(key) {
  return this.__data__.has(key);
};
var _freeGlobal = "object" == typeof commonjsGlobal && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
var freeSelf = "object" == typeof self && self && self.Object === Object && self;
var _root = _freeGlobal || freeSelf || Function("return this")();
var _Symbol = _root.Symbol;
var objectProto$d = Object.prototype;
var hasOwnProperty$a = objectProto$d.hasOwnProperty;
var nativeObjectToString$1 = objectProto$d.toString;
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : void 0;
var _getRawTag = function(value) {
  var isOwn = hasOwnProperty$a.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  return unmasked && (isOwn ? value[symToStringTag$1] = tag : delete value[symToStringTag$1]), result;
};
var nativeObjectToString = Object.prototype.toString;
var _objectToString = function(value) {
  return nativeObjectToString.call(value);
};
var symToStringTag = _Symbol ? _Symbol.toStringTag : void 0;
var _baseGetTag = function(value) {
  return null == value ? void 0 === value ? "[object Undefined]" : "[object Null]" : symToStringTag && symToStringTag in Object(value) ? _getRawTag(value) : _objectToString(value);
};
var isObject_1 = function(value) {
  var type = typeof value;
  return null != value && ("object" == type || "function" == type);
};
var isFunction_1 = function(value) {
  if (!isObject_1(value)) return false;
  var tag = _baseGetTag(value);
  return "[object Function]" == tag || "[object GeneratorFunction]" == tag || "[object AsyncFunction]" == tag || "[object Proxy]" == tag;
};
var _coreJsData = _root["__core-js_shared__"];
var maskSrcKey = function() {
  var uid2 = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || "");
  return uid2 ? "Symbol(src)_1." + uid2 : "";
}();
var _isMasked = function(func) {
  return !!maskSrcKey && maskSrcKey in func;
};
var funcToString$1 = Function.prototype.toString;
var _toSource = function(func) {
  if (null != func) {
    try {
      return funcToString$1.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
};
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype;
var objectProto$b = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty$9).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
var _baseIsNative = function(value) {
  return !(!isObject_1(value) || _isMasked(value)) && (isFunction_1(value) ? reIsNative : reIsHostCtor).test(_toSource(value));
};
var _getValue = function(object, key) {
  return null == object ? void 0 : object[key];
};
var _getNative = function(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : void 0;
};
var _Map = _getNative(_root, "Map");
var _nativeCreate = _getNative(Object, "create");
var _hashClear = function() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {}, this.size = 0;
};
var _hashDelete = function(key) {
  var result = this.has(key) && delete this.__data__[key];
  return this.size -= result ? 1 : 0, result;
};
var hasOwnProperty$8 = Object.prototype.hasOwnProperty;
var _hashGet = function(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return "__lodash_hash_undefined__" === result ? void 0 : result;
  }
  return hasOwnProperty$8.call(data, key) ? data[key] : void 0;
};
var hasOwnProperty$7 = Object.prototype.hasOwnProperty;
var _hashHas = function(key) {
  var data = this.__data__;
  return _nativeCreate ? void 0 !== data[key] : hasOwnProperty$7.call(data, key);
};
var _hashSet = function(key, value) {
  var data = this.__data__;
  return this.size += this.has(key) ? 0 : 1, data[key] = _nativeCreate && void 0 === value ? "__lodash_hash_undefined__" : value, this;
};
function Hash(entries) {
  var index2 = -1, length = null == entries ? 0 : entries.length;
  for (this.clear(); ++index2 < length; ) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = _hashClear, Hash.prototype.delete = _hashDelete, Hash.prototype.get = _hashGet, Hash.prototype.has = _hashHas, Hash.prototype.set = _hashSet;
var _Hash = Hash;
var _mapCacheClear = function() {
  this.size = 0, this.__data__ = { hash: new _Hash(), map: new (_Map || _ListCache)(), string: new _Hash() };
};
var _isKeyable = function(value) {
  var type = typeof value;
  return "string" == type || "number" == type || "symbol" == type || "boolean" == type ? "__proto__" !== value : null === value;
};
var _getMapData = function(map, key) {
  var data = map.__data__;
  return _isKeyable(key) ? data["string" == typeof key ? "string" : "hash"] : data.map;
};
var _mapCacheDelete = function(key) {
  var result = _getMapData(this, key).delete(key);
  return this.size -= result ? 1 : 0, result;
};
var _mapCacheGet = function(key) {
  return _getMapData(this, key).get(key);
};
var _mapCacheHas = function(key) {
  return _getMapData(this, key).has(key);
};
var _mapCacheSet = function(key, value) {
  var data = _getMapData(this, key), size2 = data.size;
  return data.set(key, value), this.size += data.size == size2 ? 0 : 1, this;
};
function MapCache(entries) {
  var index2 = -1, length = null == entries ? 0 : entries.length;
  for (this.clear(); ++index2 < length; ) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = _mapCacheClear, MapCache.prototype.delete = _mapCacheDelete, MapCache.prototype.get = _mapCacheGet, MapCache.prototype.has = _mapCacheHas, MapCache.prototype.set = _mapCacheSet;
var _MapCache = MapCache;
var _stackSet = function(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache) {
    var pairs = data.__data__;
    if (!_Map || pairs.length < 199) return pairs.push([key, value]), this.size = ++data.size, this;
    data = this.__data__ = new _MapCache(pairs);
  }
  return data.set(key, value), this.size = data.size, this;
};
function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = _stackClear, Stack.prototype.delete = _stackDelete, Stack.prototype.get = _stackGet, Stack.prototype.has = _stackHas, Stack.prototype.set = _stackSet;
var _Stack = Stack;
var _setCacheAdd = function(value) {
  return this.__data__.set(value, "__lodash_hash_undefined__"), this;
};
var _setCacheHas = function(value) {
  return this.__data__.has(value);
};
function SetCache(values) {
  var index2 = -1, length = null == values ? 0 : values.length;
  for (this.__data__ = new _MapCache(); ++index2 < length; ) this.add(values[index2]);
}
SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd, SetCache.prototype.has = _setCacheHas;
var _SetCache = SetCache;
var _arraySome = function(array, predicate) {
  for (var index2 = -1, length = null == array ? 0 : array.length; ++index2 < length; ) if (predicate(array[index2], index2, array)) return true;
  return false;
};
var _cacheHas = function(cache, key) {
  return cache.has(key);
};
var _equalArrays = function(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = 1 & bitmask, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) return false;
  var arrStacked = stack.get(array), othStacked = stack.get(other);
  if (arrStacked && othStacked) return arrStacked == other && othStacked == array;
  var index2 = -1, result = true, seen = 2 & bitmask ? new _SetCache() : void 0;
  for (stack.set(array, other), stack.set(other, array); ++index2 < arrLength; ) {
    var arrValue = array[index2], othValue = other[index2];
    if (customizer) var compared = isPartial ? customizer(othValue, arrValue, index2, other, array, stack) : customizer(arrValue, othValue, index2, array, other, stack);
    if (void 0 !== compared) {
      if (compared) continue;
      result = false;
      break;
    }
    if (seen) {
      if (!_arraySome(other, function(othValue2, othIndex) {
        if (!_cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) return seen.push(othIndex);
      })) {
        result = false;
        break;
      }
    } else if (arrValue !== othValue && !equalFunc(arrValue, othValue, bitmask, customizer, stack)) {
      result = false;
      break;
    }
  }
  return stack.delete(array), stack.delete(other), result;
};
var _Uint8Array = _root.Uint8Array;
var _mapToArray = function(map) {
  var index2 = -1, result = Array(map.size);
  return map.forEach(function(value, key) {
    result[++index2] = [key, value];
  }), result;
};
var _setToArray = function(set2) {
  var index2 = -1, result = Array(set2.size);
  return set2.forEach(function(value) {
    result[++index2] = value;
  }), result;
};
var symbolProto$1 = _Symbol ? _Symbol.prototype : void 0;
var symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : void 0;
var _equalByTag = function(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case "[object DataView]":
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) return false;
      object = object.buffer, other = other.buffer;
    case "[object ArrayBuffer]":
      return !(object.byteLength != other.byteLength || !equalFunc(new _Uint8Array(object), new _Uint8Array(other)));
    case "[object Boolean]":
    case "[object Date]":
    case "[object Number]":
      return eq_1(+object, +other);
    case "[object Error]":
      return object.name == other.name && object.message == other.message;
    case "[object RegExp]":
    case "[object String]":
      return object == other + "";
    case "[object Map]":
      var convert = _mapToArray;
    case "[object Set]":
      var isPartial = 1 & bitmask;
      if (convert || (convert = _setToArray), object.size != other.size && !isPartial) return false;
      var stacked = stack.get(object);
      if (stacked) return stacked == other;
      bitmask |= 2, stack.set(object, other);
      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      return stack.delete(object), result;
    case "[object Symbol]":
      if (symbolValueOf) return symbolValueOf.call(object) == symbolValueOf.call(other);
  }
  return false;
};
var _arrayPush = function(array, values) {
  for (var index2 = -1, length = values.length, offset = array.length; ++index2 < length; ) array[offset + index2] = values[index2];
  return array;
};
var isArray_1 = Array.isArray;
var _baseGetAllKeys = function(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
};
var _arrayFilter = function(array, predicate) {
  for (var index2 = -1, length = null == array ? 0 : array.length, resIndex = 0, result = []; ++index2 < length; ) {
    var value = array[index2];
    predicate(value, index2, array) && (result[resIndex++] = value);
  }
  return result;
};
var stubArray_1 = function() {
  return [];
};
var propertyIsEnumerable$1 = Object.prototype.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var _getSymbols = nativeGetSymbols ? function(object) {
  return null == object ? [] : (object = Object(object), _arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  }));
} : stubArray_1;
var _baseTimes = function(n, iteratee) {
  for (var index2 = -1, result = Array(n); ++index2 < n; ) result[index2] = iteratee(index2);
  return result;
};
var isObjectLike_1 = function(value) {
  return null != value && "object" == typeof value;
};
var _baseIsArguments = function(value) {
  return isObjectLike_1(value) && "[object Arguments]" == _baseGetTag(value);
};
var objectProto$7 = Object.prototype;
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
var propertyIsEnumerable = objectProto$7.propertyIsEnumerable;
var isArguments_1 = _baseIsArguments(/* @__PURE__ */ function() {
  return arguments;
}()) ? _baseIsArguments : function(value) {
  return isObjectLike_1(value) && hasOwnProperty$6.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
};
var stubFalse_1 = function() {
  return false;
};
var isBuffer_1 = createCommonjsModule(function(module2, exports) {
  var freeExports = exports && !exports.nodeType && exports, freeModule = freeExports && module2 && !module2.nodeType && module2, Buffer2 = freeModule && freeModule.exports === freeExports ? _root.Buffer : void 0, isBuffer = (Buffer2 ? Buffer2.isBuffer : void 0) || stubFalse_1;
  module2.exports = isBuffer;
});
var reIsUint = /^(?:0|[1-9]\d*)$/;
var _isIndex = function(value, length) {
  var type = typeof value;
  return !!(length = null == length ? 9007199254740991 : length) && ("number" == type || "symbol" != type && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
};
var isLength_1 = function(value) {
  return "number" == typeof value && value > -1 && value % 1 == 0 && value <= 9007199254740991;
};
var typedArrayTags = {};
typedArrayTags["[object Float32Array]"] = typedArrayTags["[object Float64Array]"] = typedArrayTags["[object Int8Array]"] = typedArrayTags["[object Int16Array]"] = typedArrayTags["[object Int32Array]"] = typedArrayTags["[object Uint8Array]"] = typedArrayTags["[object Uint8ClampedArray]"] = typedArrayTags["[object Uint16Array]"] = typedArrayTags["[object Uint32Array]"] = true, typedArrayTags["[object Arguments]"] = typedArrayTags["[object Array]"] = typedArrayTags["[object ArrayBuffer]"] = typedArrayTags["[object Boolean]"] = typedArrayTags["[object DataView]"] = typedArrayTags["[object Date]"] = typedArrayTags["[object Error]"] = typedArrayTags["[object Function]"] = typedArrayTags["[object Map]"] = typedArrayTags["[object Number]"] = typedArrayTags["[object Object]"] = typedArrayTags["[object RegExp]"] = typedArrayTags["[object Set]"] = typedArrayTags["[object String]"] = typedArrayTags["[object WeakMap]"] = false;
var _baseIsTypedArray = function(value) {
  return isObjectLike_1(value) && isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
};
var _baseUnary = function(func) {
  return function(value) {
    return func(value);
  };
};
var _nodeUtil = createCommonjsModule(function(module2, exports) {
  var freeExports = exports && !exports.nodeType && exports, freeModule = freeExports && module2 && !module2.nodeType && module2, freeProcess = freeModule && freeModule.exports === freeExports && _freeGlobal.process, nodeUtil = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      return types || freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  module2.exports = nodeUtil;
});
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;
var isTypedArray_1 = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;
var hasOwnProperty$5 = Object.prototype.hasOwnProperty;
var _arrayLikeKeys = function(value, inherited) {
  var isArr = isArray_1(value), isArg = !isArr && isArguments_1(value), isBuff = !isArr && !isArg && isBuffer_1(value), isType = !isArr && !isArg && !isBuff && isTypedArray_1(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? _baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) !inherited && !hasOwnProperty$5.call(value, key) || skipIndexes && ("length" == key || isBuff && ("offset" == key || "parent" == key) || isType && ("buffer" == key || "byteLength" == key || "byteOffset" == key) || _isIndex(key, length)) || result.push(key);
  return result;
};
var objectProto$5 = Object.prototype;
var _isPrototype = function(value) {
  var Ctor = value && value.constructor;
  return value === ("function" == typeof Ctor && Ctor.prototype || objectProto$5);
};
var _nativeKeys = /* @__PURE__ */ function(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}(Object.keys, Object);
var hasOwnProperty$4 = Object.prototype.hasOwnProperty;
var _baseKeys = function(object) {
  if (!_isPrototype(object)) return _nativeKeys(object);
  var result = [];
  for (var key in Object(object)) hasOwnProperty$4.call(object, key) && "constructor" != key && result.push(key);
  return result;
};
var isArrayLike_1 = function(value) {
  return null != value && isLength_1(value.length) && !isFunction_1(value);
};
var keys_1 = function(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
};
var _getAllKeys = function(object) {
  return _baseGetAllKeys(object, keys_1, _getSymbols);
};
var hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _equalObjects = function(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = 1 & bitmask, objProps = _getAllKeys(object), objLength = objProps.length;
  if (objLength != _getAllKeys(other).length && !isPartial) return false;
  for (var index2 = objLength; index2--; ) {
    var key = objProps[index2];
    if (!(isPartial ? key in other : hasOwnProperty$3.call(other, key))) return false;
  }
  var objStacked = stack.get(object), othStacked = stack.get(other);
  if (objStacked && othStacked) return objStacked == other && othStacked == object;
  var result = true;
  stack.set(object, other), stack.set(other, object);
  for (var skipCtor = isPartial; ++index2 < objLength; ) {
    var objValue = object[key = objProps[index2]], othValue = other[key];
    if (customizer) var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    if (!(void 0 === compared ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = "constructor" == key);
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    objCtor == othCtor || !("constructor" in object) || !("constructor" in other) || "function" == typeof objCtor && objCtor instanceof objCtor && "function" == typeof othCtor && othCtor instanceof othCtor || (result = false);
  }
  return stack.delete(object), stack.delete(other), result;
};
var _DataView = _getNative(_root, "DataView");
var _Promise = _getNative(_root, "Promise");
var _Set = _getNative(_root, "Set");
var _WeakMap = _getNative(_root, "WeakMap");
var dataViewCtorString = _toSource(_DataView);
var mapCtorString = _toSource(_Map);
var promiseCtorString = _toSource(_Promise);
var setCtorString = _toSource(_Set);
var weakMapCtorString = _toSource(_WeakMap);
var getTag = _baseGetTag;
(_DataView && "[object DataView]" != getTag(new _DataView(new ArrayBuffer(1))) || _Map && "[object Map]" != getTag(new _Map()) || _Promise && "[object Promise]" != getTag(_Promise.resolve()) || _Set && "[object Set]" != getTag(new _Set()) || _WeakMap && "[object WeakMap]" != getTag(new _WeakMap())) && (getTag = function(value) {
  var result = _baseGetTag(value), Ctor = "[object Object]" == result ? value.constructor : void 0, ctorString = Ctor ? _toSource(Ctor) : "";
  if (ctorString) switch (ctorString) {
    case dataViewCtorString:
      return "[object DataView]";
    case mapCtorString:
      return "[object Map]";
    case promiseCtorString:
      return "[object Promise]";
    case setCtorString:
      return "[object Set]";
    case weakMapCtorString:
      return "[object WeakMap]";
  }
  return result;
});
var _getTag = getTag;
var objectTag = "[object Object]";
var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
var _baseIsEqualDeep = function(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_1(object), othIsArr = isArray_1(other), objTag = objIsArr ? "[object Array]" : _getTag(object), othTag = othIsArr ? "[object Array]" : _getTag(other), objIsObj = (objTag = "[object Arguments]" == objTag ? objectTag : objTag) == objectTag, othIsObj = (othTag = "[object Arguments]" == othTag ? objectTag : othTag) == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer_1(object)) {
    if (!isBuffer_1(other)) return false;
    objIsArr = true, objIsObj = false;
  }
  if (isSameTag && !objIsObj) return stack || (stack = new _Stack()), objIsArr || isTypedArray_1(object) ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack) : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  if (!(1 & bitmask)) {
    var objIsWrapped = objIsObj && hasOwnProperty$2.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty$2.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      return stack || (stack = new _Stack()), equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  return !!isSameTag && (stack || (stack = new _Stack()), _equalObjects(object, other, bitmask, customizer, equalFunc, stack));
};
var _baseIsEqual = function baseIsEqual(value, other, bitmask, customizer, stack) {
  return value === other || (null == value || null == other || !isObjectLike_1(value) && !isObjectLike_1(other) ? value != value && other != other : _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack));
};
var _baseIsMatch = function(object, source, matchData, customizer) {
  var index2 = matchData.length, length = index2, noCustomizer = !customizer;
  if (null == object) return !length;
  for (object = Object(object); index2--; ) {
    var data = matchData[index2];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) return false;
  }
  for (; ++index2 < length; ) {
    var key = (data = matchData[index2])[0], objValue = object[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (void 0 === objValue && !(key in object)) return false;
    } else {
      var stack = new _Stack();
      if (customizer) var result = customizer(objValue, srcValue, key, object, source, stack);
      if (!(void 0 === result ? _baseIsEqual(srcValue, objValue, 3, customizer, stack) : result)) return false;
    }
  }
  return true;
};
var _isStrictComparable = function(value) {
  return value == value && !isObject_1(value);
};
var _getMatchData = function(object) {
  for (var result = keys_1(object), length = result.length; length--; ) {
    var key = result[length], value = object[key];
    result[length] = [key, value, _isStrictComparable(value)];
  }
  return result;
};
var _matchesStrictComparable = function(key, srcValue) {
  return function(object) {
    return null != object && (object[key] === srcValue && (void 0 !== srcValue || key in Object(object)));
  };
};
var _baseMatches = function(source) {
  var matchData = _getMatchData(source);
  return 1 == matchData.length && matchData[0][2] ? _matchesStrictComparable(matchData[0][0], matchData[0][1]) : function(object) {
    return object === source || _baseIsMatch(object, source, matchData);
  };
};
var isSymbol_1 = function(value) {
  return "symbol" == typeof value || isObjectLike_1(value) && "[object Symbol]" == _baseGetTag(value);
};
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
var _isKey = function(value, object) {
  if (isArray_1(value)) return false;
  var type = typeof value;
  return !("number" != type && "symbol" != type && "boolean" != type && null != value && !isSymbol_1(value)) || (reIsPlainProp.test(value) || !reIsDeepProp.test(value) || null != object && value in Object(object));
};
function memoize(func, resolver) {
  if ("function" != typeof func || null != resolver && "function" != typeof resolver) throw new TypeError("Expected a function");
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) return cache.get(key);
    var result = func.apply(this, args);
    return memoized.cache = cache.set(key, result) || cache, result;
  };
  return memoized.cache = new (memoize.Cache || _MapCache)(), memoized;
}
memoize.Cache = _MapCache;
var memoize_1 = memoize;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var _stringToPath = function(func) {
  var result = memoize_1(func, function(key) {
    return 500 === cache.size && cache.clear(), key;
  }), cache = result.cache;
  return result;
}(function(string) {
  var result = [];
  return 46 === string.charCodeAt(0) && result.push(""), string.replace(rePropName, function(match, number2, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number2 || match);
  }), result;
});
var _arrayMap = function(array, iteratee) {
  for (var index2 = -1, length = null == array ? 0 : array.length, result = Array(length); ++index2 < length; ) result[index2] = iteratee(array[index2], index2, array);
  return result;
};
var symbolProto = _Symbol ? _Symbol.prototype : void 0;
var symbolToString = symbolProto ? symbolProto.toString : void 0;
var _baseToString = function baseToString(value) {
  if ("string" == typeof value) return value;
  if (isArray_1(value)) return _arrayMap(value, baseToString) + "";
  if (isSymbol_1(value)) return symbolToString ? symbolToString.call(value) : "";
  var result = value + "";
  return "0" == result && 1 / value == -Infinity ? "-0" : result;
};
var toString_1 = function(value) {
  return null == value ? "" : _baseToString(value);
};
var _castPath = function(value, object) {
  return isArray_1(value) ? value : _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
};
var _toKey = function(value) {
  if ("string" == typeof value || isSymbol_1(value)) return value;
  var result = value + "";
  return "0" == result && 1 / value == -Infinity ? "-0" : result;
};
var _baseGet = function(object, path) {
  for (var index2 = 0, length = (path = _castPath(path, object)).length; null != object && index2 < length; ) object = object[_toKey(path[index2++])];
  return index2 && index2 == length ? object : void 0;
};
var get_1 = function(object, path, defaultValue) {
  var result = null == object ? void 0 : _baseGet(object, path);
  return void 0 === result ? defaultValue : result;
};
var _baseHasIn = function(object, key) {
  return null != object && key in Object(object);
};
var _hasPath = function(object, path, hasFunc) {
  for (var index2 = -1, length = (path = _castPath(path, object)).length, result = false; ++index2 < length; ) {
    var key = _toKey(path[index2]);
    if (!(result = null != object && hasFunc(object, key))) break;
    object = object[key];
  }
  return result || ++index2 != length ? result : !!(length = null == object ? 0 : object.length) && isLength_1(length) && _isIndex(key, length) && (isArray_1(object) || isArguments_1(object));
};
var hasIn_1 = function(object, path) {
  return null != object && _hasPath(object, path, _baseHasIn);
};
var _baseMatchesProperty = function(path, srcValue) {
  return _isKey(path) && _isStrictComparable(srcValue) ? _matchesStrictComparable(_toKey(path), srcValue) : function(object) {
    var objValue = get_1(object, path);
    return void 0 === objValue && objValue === srcValue ? hasIn_1(object, path) : _baseIsEqual(srcValue, objValue, 3);
  };
};
var identity_1 = function(value) {
  return value;
};
var _baseProperty = function(key) {
  return function(object) {
    return null == object ? void 0 : object[key];
  };
};
var _basePropertyDeep = function(path) {
  return function(object) {
    return _baseGet(object, path);
  };
};
var property_1 = function(path) {
  return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
};
var _baseIteratee = function(value) {
  return "function" == typeof value ? value : null == value ? identity_1 : "object" == typeof value ? isArray_1(value) ? _baseMatchesProperty(value[0], value[1]) : _baseMatches(value) : property_1(value);
};
var reWhitespace = /\s/;
var _trimmedEndIndex = function(string) {
  for (var index2 = string.length; index2-- && reWhitespace.test(string.charAt(index2)); ) ;
  return index2;
};
var reTrimStart = /^\s+/;
var _baseTrim = function(string) {
  return string ? string.slice(0, _trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
};
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
var toNumber_1 = function(value) {
  if ("number" == typeof value) return value;
  if (isSymbol_1(value)) return NaN;
  if (isObject_1(value)) {
    var other = "function" == typeof value.valueOf ? value.valueOf() : value;
    value = isObject_1(other) ? other + "" : other;
  }
  if ("string" != typeof value) return 0 === value ? value : +value;
  value = _baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NaN : +value;
};
var toFinite_1 = function(value) {
  return value ? Infinity === (value = toNumber_1(value)) || -Infinity === value ? 17976931348623157e292 * (value < 0 ? -1 : 1) : value == value ? value : 0 : 0 === value ? value : 0;
};
var toInteger_1 = function(value) {
  var result = toFinite_1(value), remainder = result % 1;
  return result == result ? remainder ? result - remainder : result : 0;
};
var nativeMax$1 = Math.max;
var nativeMin = Math.min;
var findLastIndex_1 = function(array, predicate, fromIndex) {
  var length = null == array ? 0 : array.length;
  if (!length) return -1;
  var index2 = length - 1;
  return void 0 !== fromIndex && (index2 = toInteger_1(fromIndex), index2 = fromIndex < 0 ? nativeMax$1(length + index2, 0) : nativeMin(index2, length - 1)), _baseFindIndex(array, _baseIteratee(predicate), index2, true);
};
var computeOldLineNumber$2 = computeLineNumberFactory("old");
var computeNewLineNumber$1 = computeLineNumberFactory("new");
function getOldRangeFromHunk(_ref) {
  var oldStart = _ref.oldStart;
  return [oldStart, oldStart + _ref.oldLines - 1];
}
function createHunkFromChanges(changes) {
  if (!changes.length) return null;
  var hunk = changes.reduce(function(hunk2, change) {
    return isNormal(change) || (hunk2.isPlain = false), isInsert(change) || (hunk2.oldLines = hunk2.oldLines + 1, -1 === hunk2.oldStart && (hunk2.oldStart = computeOldLineNumber$2(change))), isDelete(change) || (hunk2.newLines = hunk2.newLines + 1, -1 === hunk2.newStart && (hunk2.newStart = computeNewLineNumber$1(change))), hunk2;
  }, { isPlain: true, content: "", oldStart: -1, oldLines: 0, newStart: -1, newLines: 0 }), oldStart = hunk.oldStart, oldLines = hunk.oldLines, newStart = hunk.newStart, newLines = hunk.newLines;
  return _objectSpread2(_objectSpread2({}, hunk), {}, { content: "@@ -".concat(oldStart, ",").concat(oldLines, " +").concat(newStart, ",").concat(newLines), changes });
}
function textLinesToHunk(lines, oldStartLine, newStartLine) {
  return createHunkFromChanges(lines.map(function(line, i) {
    return { type: "normal", isNormal: true, oldLineNumber: oldStartLine + i, newLineNumber: newStartLine + i, content: "" + line };
  }));
}
function sliceHunk(_ref2, oldStartLine, oldEndLine) {
  var changes = _ref2.changes, changeIndex = changes.findIndex(function(change) {
    return computeOldLineNumber$2(change) >= oldStartLine;
  });
  if (-1 === changeIndex) return null;
  var startIndex = function() {
    if (0 === changeIndex) return changeIndex;
    var nearestHeadingNocmalChangeIndex = findLastIndex_1(changes, function(change) {
      return !isInsert(change);
    }, changeIndex - 1);
    return -1 === nearestHeadingNocmalChangeIndex ? changeIndex : nearestHeadingNocmalChangeIndex + 1;
  }();
  if (void 0 === oldEndLine) return createHunkFromChanges(changes.slice(startIndex));
  var endIndex = findLastIndex_1(changes, function(change) {
    return computeOldLineNumber$2(change) <= oldEndLine;
  });
  return createHunkFromChanges(changes.slice(startIndex, -1 === endIndex ? void 0 : endIndex));
}
function mergeHunk(previousHunk, nextHunk) {
  if (!previousHunk) return nextHunk;
  if (!nextHunk) return previousHunk;
  var _getOldRangeFromHunk2 = _slicedToArray(getOldRangeFromHunk(previousHunk), 2), previousStart = _getOldRangeFromHunk2[0], previousEnd = _getOldRangeFromHunk2[1], _getOldRangeFromHunk4 = _slicedToArray(getOldRangeFromHunk(nextHunk), 2), nextStart = _getOldRangeFromHunk4[0], nextEnd = _getOldRangeFromHunk4[1];
  if (previousEnd + 1 === nextStart) return createHunkFromChanges([].concat(_toConsumableArray(previousHunk.changes), _toConsumableArray(nextHunk.changes)));
  if (previousStart <= nextStart && previousEnd >= nextEnd) {
    if (previousHunk.isPlain && !nextHunk.isPlain) {
      var head = sliceHunk(previousHunk, previousStart, nextStart), _tail = sliceHunk(previousHunk, nextEnd + 1);
      return mergeHunk(mergeHunk(head, nextHunk), _tail);
    }
    return previousHunk;
  }
  return previousHunk.isPlain ? mergeHunk(sliceHunk(previousHunk, previousStart, nextStart), nextHunk) : mergeHunk(previousHunk, sliceHunk(nextHunk, previousEnd + 1));
}
function appendOrMergeHunk(hunks, nextHunk) {
  var lastHunk = last$1(hunks);
  if (!lastHunk) return [nextHunk];
  if (lastHunk.oldStart + lastHunk.oldLines < nextHunk.oldStart) return hunks.concat(nextHunk);
  var mergedHunk = mergeHunk(lastHunk, nextHunk);
  return mergedHunk ? [].concat(_toConsumableArray(hunks.slice(0, -1)), [mergedHunk]) : hunks;
}
function insertHunk(hunks, insertion) {
  var insertionOldLineNumber = computeOldLineNumber$2(insertion.changes[0]), insertPosition = hunks.findIndex(function(_ref3) {
    var changes = _ref3.changes;
    return !!changes.length && computeOldLineNumber$2(changes[0]) >= insertionOldLineNumber;
  });
  return (-1 === insertPosition ? hunks.concat(insertion) : [].concat(_toConsumableArray(hunks.slice(0, insertPosition)), [insertion], _toConsumableArray(hunks.slice(insertPosition)))).reduce(appendOrMergeHunk, []);
}
function getChangeKey(change) {
  if (!change) throw new Error("change is not provided");
  if (isNormal(change)) return "N".concat(change.oldLineNumber);
  var prefix = isInsert(change) ? "I" : "D";
  return "".concat(prefix).concat(change.lineNumber);
}
var getCorrespondingNewLineNumber$1 = getCorrespondingLineNumberFactory("old");
var computeOldLineNumber$1 = computeLineNumberFactory("old");
var isOldLineNumberInHunk = isInHunkFactory("oldStart", "oldLines");
var isOldLineNumberBetweenHunks = isBetweenHunksFactory("oldStart", "oldLines");
function splitRangeToValidOnes(hunks, start, end) {
  var correspondingHunkIndex = function(hunks2, oldLineNumber) {
    if (!hunks2.length) return -1;
    var firstHunk = first(hunks2);
    if (oldLineNumber < firstHunk.oldStart || isOldLineNumberInHunk(firstHunk, oldLineNumber)) return 0;
    for (var i = 1; i < hunks2.length; i++) {
      var currentHunk = hunks2[i];
      if (isOldLineNumberInHunk(currentHunk, oldLineNumber)) return i;
      var previousHunk = hunks2[i - 1];
      if (isOldLineNumberBetweenHunks(previousHunk, currentHunk, oldLineNumber)) return i;
    }
    return -1;
  }(hunks, start);
  if (-1 === correspondingHunkIndex) return [[start, end]];
  var correspondingHunk = hunks[correspondingHunkIndex];
  if (start < correspondingHunk.oldStart) {
    var headingChangesCount = correspondingHunk.changes.findIndex(function(change) {
      return !isNormal(change);
    }), _validEnd = correspondingHunk.oldStart + Math.max(headingChangesCount, 0);
    return _validEnd >= end ? [[start, end]] : [[start, _validEnd]].concat(_toConsumableArray(splitRangeToValidOnes(hunks, _validEnd + 1, end)));
  }
  var changes = correspondingHunk.changes, nearestNormalChangeIndex = function(_ref, start2) {
    var changes2 = _ref.changes, index2 = changes2.findIndex(function(change) {
      return computeOldLineNumber$1(change) === start2;
    });
    if (index2 < 0) return -1;
    for (var i = index2; i < changes2.length; i++) if (isNormal(changes2[i])) return i;
    return -1;
  }(correspondingHunk, start);
  if (-1 === nearestNormalChangeIndex) return [];
  var validStartChange = changes[nearestNormalChangeIndex], validStart = computeOldLineNumber$1(validStartChange), adjacentChangesCount = changes.slice(nearestNormalChangeIndex + 1).findIndex(function(change) {
    return !isNormal(change);
  }), validEnd = computeOldLineNumber$1(validStartChange) + Math.max(adjacentChangesCount, 0);
  return validEnd >= end ? [[validStart, end]] : [[validStart, validEnd]].concat(_toConsumableArray(splitRangeToValidOnes(hunks, validEnd + 1, end)));
}
function expandFromRawCode(hunks, source, start, end) {
  return splitRangeToValidOnes(hunks, start, end).reduce(function(hunks2, range) {
    return function(hunks3, source2, _ref2) {
      var _ref3 = _slicedToArray(_ref2, 2), start2 = _ref3[0], end2 = _ref3[1], slicedLines = ("string" == typeof source2 ? source2.split("\n") : source2).slice(Math.max(start2, 1) - 1, end2 - 1);
      if (!slicedLines.length) return hunks3;
      var slicedHunk = textLinesToHunk(slicedLines, start2, getCorrespondingNewLineNumber$1(hunks3, start2));
      return slicedHunk ? insertHunk(hunks3, slicedHunk) : hunks3;
    }(hunks2, source, range);
  }, hunks);
}
function getCollapsedLinesCountBetween(previousHunk, nextHunk) {
  if (!previousHunk) return nextHunk.oldStart - 1;
  var previousEnd = previousHunk.oldStart + previousHunk.oldLines;
  return nextHunk.oldStart - previousEnd;
}
function expandCollapsedBlockBy(hunks, source, predicate) {
  var linesOfCode = "string" == typeof source ? source.split("\n") : source, firstHunk = first(hunks), initialExpandingBlocks = predicate(firstHunk.oldStart - 1, 1, 1) ? [[1, firstHunk.oldStart]] : [], expandingBlocks = hunks.reduce(function(expandingBlocks2, currentHunk, index2, hunks2) {
    var nextHunk = hunks2[index2 + 1], oldStart = currentHunk.oldStart + currentHunk.oldLines, newStart = currentHunk.newStart + currentHunk.newLines, lines = nextHunk ? getCollapsedLinesCountBetween(currentHunk, nextHunk) : linesOfCode.length - oldStart + 1;
    return predicate(lines, oldStart, newStart) && expandingBlocks2.push([oldStart, oldStart + lines]), expandingBlocks2;
  }, initialExpandingBlocks);
  return expandingBlocks.reduce(function(hunks2, _ref4) {
    var _ref5 = _slicedToArray(_ref4, 2), start = _ref5[0], end = _ref5[1];
    return expandFromRawCode(hunks2, linesOfCode, start, end);
  }, hunks);
}
var computeOldLineNumber = computeLineNumberFactory("old");
var computeNewLineNumber = computeLineNumberFactory("new");
var findChangeByOldLineNumber = findChangeByLineNumberFactory("old");
var findChangeByNewLineNumber = findChangeByLineNumberFactory("new");
var getCorrespondingOldLineNumber = getCorrespondingLineNumberFactory("new");
var getCorrespondingNewLineNumber = getCorrespondingLineNumberFactory("old");
var _defineProperty = function() {
  try {
    var func = _getNative(Object, "defineProperty");
    return func({}, "", {}), func;
  } catch (e) {
  }
}();
var _baseAssignValue = function(object, key, value) {
  "__proto__" == key && _defineProperty ? _defineProperty(object, key, { configurable: true, enumerable: true, value, writable: true }) : object[key] = value;
};
var _createBaseFor = function(fromRight) {
  return function(object, iteratee, keysFunc) {
    for (var index2 = -1, iterable = Object(object), props = keysFunc(object), length = props.length; length--; ) {
      var key = props[fromRight ? length : ++index2];
      if (false === iteratee(iterable[key], key, iterable)) break;
    }
    return object;
  };
};
var _baseFor = _createBaseFor();
var _baseForOwn = function(object, iteratee) {
  return object && _baseFor(object, iteratee, keys_1);
};
var mapValues_1 = function(object, iteratee) {
  var result = {};
  return iteratee = _baseIteratee(iteratee), _baseForOwn(object, function(value, key, object2) {
    _baseAssignValue(result, key, iteratee(value, key, object2));
  }), result;
};
var _excluded$7 = ["changeKey", "text", "tokens", "renderToken"];
var defaultRenderToken = function defaultRenderToken2(_ref, i) {
  var type = _ref.type, value = _ref.value, markType = _ref.markType, properties = _ref.properties, className = _ref.className, children = _ref.children, renderWithClassName = function(className2) {
    return (0, import_jsx_runtime9.jsx)("span", { className: className2, children: value || children && children.map(defaultRenderToken2) }, i);
  };
  switch (type) {
    case "text":
      return value;
    case "mark":
      return renderWithClassName("diff-code-mark diff-code-mark-".concat(markType));
    case "edit":
      return renderWithClassName("diff-code-edit");
    default:
      var legacyClassName = properties && properties.className;
      return renderWithClassName(classnames(className || legacyClassName));
  }
};
function isEmptyToken(tokens) {
  if (!Array.isArray(tokens)) return true;
  if (tokens.length > 1) return false;
  if (1 === tokens.length) {
    var token2 = _slicedToArray(tokens, 1)[0];
    return "text" === token2.type && !token2.value;
  }
  return true;
}
function CodeCell(props) {
  var changeKey = props.changeKey, text = props.text, tokens = props.tokens, renderToken = props.renderToken, attributes2 = _objectWithoutProperties(props, _excluded$7), actualRenderToken = renderToken ? function(token2, i) {
    return renderToken(token2, defaultRenderToken, i);
  } : defaultRenderToken;
  return (0, import_jsx_runtime9.jsx)("td", _objectSpread2(_objectSpread2({}, attributes2), {}, { "data-change-key": changeKey, children: tokens ? isEmptyToken(tokens) ? " " : tokens.map(actualRenderToken) : text || " " }));
}
var CodeCell$1 = (0, import_react10.memo)(CodeCell);
function renderDefaultBy(change, side) {
  return function() {
    var lineNumber = "old" === side ? computeOldLineNumber(change) : computeNewLineNumber(change);
    return -1 === lineNumber ? void 0 : lineNumber;
  };
}
function wrapInAnchorBy(gutterAnchor, anchorTarget) {
  return function(element2) {
    return gutterAnchor && element2 ? (0, import_jsx_runtime9.jsx)("a", { href: anchorTarget ? "#" + anchorTarget : void 0, children: element2 }) : element2;
  };
}
function composeCallback(own, custom) {
  return custom ? function(e) {
    own(), custom(e);
  } : own;
}
function useBoundCallbacks(callbacks, arg, hoverOn, hoverOff) {
  return (0, import_react10.useMemo)(function() {
    var output = mapValues_1(callbacks, function(fn) {
      return function(e) {
        return fn && fn(arg, e);
      };
    });
    return output.onMouseEnter = composeCallback(hoverOn, output.onMouseEnter), output.onMouseLeave = composeCallback(hoverOff, output.onMouseLeave), output;
  }, [callbacks, hoverOn, hoverOff, arg]);
}
function renderGutterCell(className, change, changeKey, side, gutterAnchor, anchorTarget, events, inHoverState, renderGutter) {
  var gutterOptions = { change, side, inHoverState, renderDefault: renderDefaultBy(change, side), wrapInAnchor: wrapInAnchorBy(gutterAnchor, anchorTarget) };
  return (0, import_jsx_runtime9.jsx)("td", _objectSpread2(_objectSpread2({ className }, events), {}, { "data-change-key": changeKey, children: renderGutter(gutterOptions) }));
}
function UnifiedChange(props) {
  var _useState2, value, setValue, change = props.change, selected = props.selected, tokens = props.tokens, className = props.className, generateLineClassName = props.generateLineClassName, gutterClassName = props.gutterClassName, codeClassName = props.codeClassName, gutterEvents = props.gutterEvents, codeEvents = props.codeEvents, hideGutter = props.hideGutter, gutterAnchor = props.gutterAnchor, generateAnchorID = props.generateAnchorID, renderToken = props.renderToken, renderGutter = props.renderGutter, type = change.type, content = change.content, changeKey = getChangeKey(change), _useBoolean = (_useState2 = _slicedToArray((0, import_react10.useState)(false), 2), value = _useState2[0], setValue = _useState2[1], [value, (0, import_react10.useCallback)(function() {
    return setValue(true);
  }, []), (0, import_react10.useCallback)(function() {
    return setValue(false);
  }, [])]), _useBoolean2 = _slicedToArray(_useBoolean, 3), hover = _useBoolean2[0], hoverOn = _useBoolean2[1], hoverOff = _useBoolean2[2], eventArg = (0, import_react10.useMemo)(function() {
    return { change };
  }, [change]), boundGutterEvents = useBoundCallbacks(gutterEvents, eventArg, hoverOn, hoverOff), boundCodeEvents = useBoundCallbacks(codeEvents, eventArg, hoverOn, hoverOff), anchorID = generateAnchorID(change), lineClassName = generateLineClassName({ changes: [change], defaultGenerate: function() {
    return className;
  } }), gutterClassNameValue = classnames("diff-gutter", "diff-gutter-".concat(type), gutterClassName, { "diff-gutter-selected": selected }), codeClassNameValue = classnames("diff-code", "diff-code-".concat(type), codeClassName, { "diff-code-selected": selected });
  return (0, import_jsx_runtime9.jsxs)("tr", { id: anchorID, className: classnames("diff-line", lineClassName), children: [!hideGutter && renderGutterCell(gutterClassNameValue, change, changeKey, "old", gutterAnchor, anchorID, boundGutterEvents, hover, renderGutter), !hideGutter && renderGutterCell(gutterClassNameValue, change, changeKey, "new", gutterAnchor, anchorID, boundGutterEvents, hover, renderGutter), (0, import_jsx_runtime9.jsx)(CodeCell$1, _objectSpread2({ className: codeClassNameValue, changeKey, text: content, tokens, renderToken }, boundCodeEvents))] });
}
var UnifiedChange$1 = (0, import_react10.memo)(UnifiedChange);
function UnifiedWidget(_ref) {
  var hideGutter = _ref.hideGutter, element2 = _ref.element;
  return (0, import_jsx_runtime9.jsx)("tr", { className: "diff-widget", children: (0, import_jsx_runtime9.jsx)("td", { colSpan: hideGutter ? 1 : 3, className: "diff-widget-content", children: element2 }) });
}
var _excluded$6 = ["hideGutter", "selectedChanges", "tokens", "lineClassName"];
var _excluded2$2 = ["hunk", "widgets", "className"];
function UnifiedHunk(props) {
  var hunk = props.hunk, widgets = props.widgets, className = props.className, childrenProps = _objectWithoutProperties(props, _excluded2$2), elements = function(changes, widgets2) {
    return changes.reduce(function(elements2, change) {
      var key = getChangeKey(change);
      elements2.push(["change", key, change]);
      var widget = widgets2[key];
      return widget && elements2.push(["widget", key, widget]), elements2;
    }, []);
  }(hunk.changes, widgets);
  return (0, import_jsx_runtime9.jsx)("tbody", { className: classnames("diff-hunk", className), children: elements.map(function(element2) {
    return function(_ref, props2) {
      var _ref2 = _slicedToArray(_ref, 3), type = _ref2[0], key = _ref2[1], value = _ref2[2], hideGutter = props2.hideGutter, selectedChanges = props2.selectedChanges, tokens = props2.tokens, lineClassName = props2.lineClassName, changeProps = _objectWithoutProperties(props2, _excluded$6);
      if ("change" === type) {
        var side = isDelete(value) ? "old" : "new", lineNumber = isDelete(value) ? computeOldLineNumber(value) : computeNewLineNumber(value), tokensOfLine = tokens ? tokens[side][lineNumber - 1] : null;
        return (0, import_jsx_runtime9.jsx)(UnifiedChange$1, _objectSpread2({ className: lineClassName, change: value, hideGutter, selected: selectedChanges.includes(key), tokens: tokensOfLine }, changeProps), "change".concat(key));
      }
      return "widget" === type ? (0, import_jsx_runtime9.jsx)(UnifiedWidget, { hideGutter, element: value }, "widget".concat(key)) : null;
    }(element2, childrenProps);
  }) });
}
var SIDE_OLD = 0;
function useCallbackOnSide(side, setHover, change, customCallbacks) {
  var markHover = (0, import_react10.useCallback)(function() {
    return setHover(side);
  }, [side, setHover]), unmarkHover = (0, import_react10.useCallback)(function() {
    return setHover("");
  }, [setHover]);
  return (0, import_react10.useMemo)(function() {
    var callbacks = mapValues_1(customCallbacks, function(fn) {
      return function(e) {
        return fn && fn({ side, change }, e);
      };
    });
    return callbacks.onMouseEnter = composeCallback(markHover, callbacks.onMouseEnter), callbacks.onMouseLeave = composeCallback(unmarkHover, callbacks.onMouseLeave), callbacks;
  }, [change, customCallbacks, markHover, side, unmarkHover]);
}
function renderCells(args) {
  var change = args.change, side = args.side, selected = args.selected, tokens = args.tokens, gutterClassName = args.gutterClassName, codeClassName = args.codeClassName, gutterEvents = args.gutterEvents, codeEvents = args.codeEvents, anchorID = args.anchorID, gutterAnchor = args.gutterAnchor, gutterAnchorTarget = args.gutterAnchorTarget, hideGutter = args.hideGutter, hover = args.hover, renderToken = args.renderToken, renderGutter = args.renderGutter;
  if (!change) {
    var _gutterClassNameValue = classnames("diff-gutter", "diff-gutter-omit", gutterClassName), _codeClassNameValue = classnames("diff-code", "diff-code-omit", codeClassName);
    return [!hideGutter && (0, import_jsx_runtime9.jsx)("td", { className: _gutterClassNameValue }, "gutter"), (0, import_jsx_runtime9.jsx)("td", { className: _codeClassNameValue }, "code")];
  }
  var type = change.type, content = change.content, changeKey = getChangeKey(change), sideName = side === SIDE_OLD ? "old" : "new", gutterProps = _objectSpread2({ id: anchorID || void 0, className: classnames("diff-gutter", "diff-gutter-".concat(type), _defineProperty$1({ "diff-gutter-selected": selected }, "diff-line-hover-" + sideName, hover), gutterClassName), children: renderGutter({ change, side: sideName, inHoverState: hover, renderDefault: renderDefaultBy(change, sideName), wrapInAnchor: wrapInAnchorBy(gutterAnchor, gutterAnchorTarget) }) }, gutterEvents), codeClassNameValue = classnames("diff-code", "diff-code-".concat(type), _defineProperty$1({ "diff-code-selected": selected }, "diff-line-hover-" + sideName, hover), codeClassName);
  return [!hideGutter && (0, import_jsx_runtime9.jsx)("td", _objectSpread2(_objectSpread2({}, gutterProps), {}, { "data-change-key": changeKey }), "gutter"), (0, import_jsx_runtime9.jsx)(CodeCell$1, _objectSpread2({ className: codeClassNameValue, changeKey, text: content, tokens, renderToken }, codeEvents), "code")];
}
function SplitChange(props) {
  var className = props.className, oldChange = props.oldChange, newChange = props.newChange, oldSelected = props.oldSelected, newSelected = props.newSelected, oldTokens = props.oldTokens, newTokens = props.newTokens, monotonous = props.monotonous, gutterClassName = props.gutterClassName, codeClassName = props.codeClassName, gutterEvents = props.gutterEvents, codeEvents = props.codeEvents, hideGutter = props.hideGutter, generateAnchorID = props.generateAnchorID, generateLineClassName = props.generateLineClassName, gutterAnchor = props.gutterAnchor, renderToken = props.renderToken, renderGutter = props.renderGutter, _useState2 = _slicedToArray((0, import_react10.useState)(""), 2), hover = _useState2[0], setHover = _useState2[1], oldGutterEvents = useCallbackOnSide("old", setHover, oldChange, gutterEvents), newGutterEvents = useCallbackOnSide("new", setHover, newChange, gutterEvents), oldCodeEvents = useCallbackOnSide("old", setHover, oldChange, codeEvents), newCodeEvents = useCallbackOnSide("new", setHover, newChange, codeEvents), oldAnchorID = oldChange && generateAnchorID(oldChange), newAnchorID = newChange && generateAnchorID(newChange), lineClassName = generateLineClassName({ changes: [oldChange, newChange], defaultGenerate: function() {
    return className;
  } }), commons = { monotonous, hideGutter, gutterClassName, codeClassName, gutterEvents, codeEvents, renderToken, renderGutter }, oldArgs = _objectSpread2(_objectSpread2({}, commons), {}, { change: oldChange, side: SIDE_OLD, selected: oldSelected, tokens: oldTokens, gutterEvents: oldGutterEvents, codeEvents: oldCodeEvents, anchorID: oldAnchorID, gutterAnchor, gutterAnchorTarget: oldAnchorID, hover: "old" === hover }), newArgs = _objectSpread2(_objectSpread2({}, commons), {}, { change: newChange, side: 1, selected: newSelected, tokens: newTokens, gutterEvents: newGutterEvents, codeEvents: newCodeEvents, anchorID: oldChange === newChange ? null : newAnchorID, gutterAnchor, gutterAnchorTarget: oldChange === newChange ? oldAnchorID : newAnchorID, hover: "new" === hover });
  if (monotonous) return (0, import_jsx_runtime9.jsx)("tr", { className: classnames("diff-line", lineClassName), children: renderCells(oldChange ? oldArgs : newArgs) });
  var lineTypeClassName = /* @__PURE__ */ function(oldChange2, newChange2) {
    return oldChange2 && !newChange2 ? "diff-line-old-only" : !oldChange2 && newChange2 ? "diff-line-new-only" : oldChange2 === newChange2 ? "diff-line-normal" : "diff-line-compare";
  }(oldChange, newChange);
  return (0, import_jsx_runtime9.jsxs)("tr", { className: classnames("diff-line", lineTypeClassName, lineClassName), children: [renderCells(oldArgs), renderCells(newArgs)] });
}
var SplitChange$1 = (0, import_react10.memo)(SplitChange);
function SplitWidget(_ref) {
  var hideGutter = _ref.hideGutter, oldElement = _ref.oldElement, newElement = _ref.newElement;
  return _ref.monotonous ? (0, import_jsx_runtime9.jsx)("tr", { className: "diff-widget", children: (0, import_jsx_runtime9.jsx)("td", { colSpan: hideGutter ? 1 : 2, className: "diff-widget-content", children: oldElement || newElement }) }) : oldElement === newElement ? (0, import_jsx_runtime9.jsx)("tr", { className: "diff-widget", children: (0, import_jsx_runtime9.jsx)("td", { colSpan: hideGutter ? 2 : 4, className: "diff-widget-content", children: oldElement }) }) : (0, import_jsx_runtime9.jsxs)("tr", { className: "diff-widget", children: [(0, import_jsx_runtime9.jsx)("td", { colSpan: hideGutter ? 1 : 2, className: "diff-widget-content", children: oldElement }), (0, import_jsx_runtime9.jsx)("td", { colSpan: hideGutter ? 1 : 2, className: "diff-widget-content", children: newElement })] });
}
var _excluded$5 = ["selectedChanges", "monotonous", "hideGutter", "tokens", "lineClassName"];
var _excluded2$1 = ["hunk", "widgets", "className"];
function keyForPair(x, y) {
  return (x ? getChangeKey(x) : "00") + (y ? getChangeKey(y) : "00");
}
function SplitHunk(props) {
  var hunk = props.hunk, widgets = props.widgets, className = props.className, childrenProps = _objectWithoutProperties(props, _excluded2$1), elements = function(changes, widgets2) {
    for (var findWidget = function(change) {
      if (!change) return null;
      var key2 = getChangeKey(change);
      return widgets2[key2] || null;
    }, elements2 = [], i = 0; i < changes.length; i++) {
      var current3 = changes[i];
      if (isNormal(current3)) elements2.push(["change", keyForPair(current3, current3), current3, current3]);
      else if (isDelete(current3)) {
        var next = changes[i + 1];
        next && isInsert(next) ? (i += 1, elements2.push(["change", keyForPair(current3, next), current3, next])) : elements2.push(["change", keyForPair(current3, null), current3, null]);
      } else elements2.push(["change", keyForPair(null, current3), null, current3]);
      var rowChanges = elements2[elements2.length - 1], oldWidget = findWidget(rowChanges[2]), newWidget = findWidget(rowChanges[3]);
      if (oldWidget || newWidget) {
        var key = rowChanges[1];
        elements2.push(["widget", key, oldWidget, newWidget]);
      }
    }
    return elements2;
  }(hunk.changes, widgets);
  return (0, import_jsx_runtime9.jsx)("tbody", { className: classnames("diff-hunk", className), children: elements.map(function(item) {
    return function(_ref, props2) {
      var _ref2 = _slicedToArray(_ref, 4), type = _ref2[0], key = _ref2[1], oldValue = _ref2[2], newValue = _ref2[3], selectedChanges = props2.selectedChanges, monotonous = props2.monotonous, hideGutter = props2.hideGutter, tokens = props2.tokens, lineClassName = props2.lineClassName, changeProps = _objectWithoutProperties(props2, _excluded$5);
      if ("change" === type) {
        var oldSelected = !!oldValue && selectedChanges.includes(getChangeKey(oldValue)), newSelected = !!newValue && selectedChanges.includes(getChangeKey(newValue)), oldTokens = oldValue && tokens ? tokens.old[computeOldLineNumber(oldValue) - 1] : null, newTokens = newValue && tokens ? tokens.new[computeNewLineNumber(newValue) - 1] : null;
        return (0, import_jsx_runtime9.jsx)(SplitChange$1, _objectSpread2({ className: lineClassName, oldChange: oldValue, newChange: newValue, monotonous, hideGutter, oldSelected, newSelected, oldTokens, newTokens }, changeProps), "change".concat(key));
      }
      return "widget" === type ? (0, import_jsx_runtime9.jsx)(SplitWidget, { monotonous, hideGutter, oldElement: oldValue, newElement: newValue }, "widget".concat(key)) : null;
    }(item, childrenProps);
  }) });
}
var _excluded$4 = ["gutterType", "hunkClassName"];
function Hunk(_ref) {
  var hunk = _ref.hunk, _useDiffSettings = useDiffSettings(), gutterType = _useDiffSettings.gutterType, hunkClassName = _useDiffSettings.hunkClassName, context = _objectWithoutProperties(_useDiffSettings, _excluded$4), hideGutter = "none" === gutterType, gutterAnchor = "anchor" === gutterType, RenderingHunk = "unified" === context.viewType ? UnifiedHunk : SplitHunk;
  return (0, import_jsx_runtime9.jsx)(RenderingHunk, _objectSpread2(_objectSpread2({}, context), {}, { hunk, hideGutter, gutterAnchor, className: hunkClassName }));
}
function noop() {
}
function setUserSelectStyle(element2, selectable) {
  var value = selectable ? "auto" : "none";
  element2 instanceof HTMLElement && element2.style.userSelect !== value && (element2.style.userSelect = value);
}
function defaultRenderChildren(hunks) {
  return hunks.map(function(hunk) {
    return (0, import_jsx_runtime9.jsx)(Hunk, { hunk }, function(hunk2) {
      return "-".concat(hunk2.oldStart, ",").concat(hunk2.oldLines, " +").concat(hunk2.newStart, ",").concat(hunk2.newLines);
    }(hunk));
  });
}
function Diff(props) {
  var diffType = props.diffType, hunks = props.hunks, optimizeSelection = props.optimizeSelection, className = props.className, _props$hunkClassName = props.hunkClassName, hunkClassName = void 0 === _props$hunkClassName ? DEFAULT_CONTEXT_VALUE.hunkClassName : _props$hunkClassName, _props$lineClassName = props.lineClassName, lineClassName = void 0 === _props$lineClassName ? DEFAULT_CONTEXT_VALUE.lineClassName : _props$lineClassName, _props$generateLineCl = props.generateLineClassName, generateLineClassName = void 0 === _props$generateLineCl ? DEFAULT_CONTEXT_VALUE.generateLineClassName : _props$generateLineCl, _props$gutterClassNam = props.gutterClassName, gutterClassName = void 0 === _props$gutterClassNam ? DEFAULT_CONTEXT_VALUE.gutterClassName : _props$gutterClassNam, _props$codeClassName = props.codeClassName, codeClassName = void 0 === _props$codeClassName ? DEFAULT_CONTEXT_VALUE.codeClassName : _props$codeClassName, _props$gutterType = props.gutterType, gutterType = void 0 === _props$gutterType ? DEFAULT_CONTEXT_VALUE.gutterType : _props$gutterType, _props$viewType = props.viewType, viewType = void 0 === _props$viewType ? DEFAULT_CONTEXT_VALUE.viewType : _props$viewType, _props$gutterEvents = props.gutterEvents, gutterEvents = void 0 === _props$gutterEvents ? DEFAULT_CONTEXT_VALUE.gutterEvents : _props$gutterEvents, _props$codeEvents = props.codeEvents, codeEvents = void 0 === _props$codeEvents ? DEFAULT_CONTEXT_VALUE.codeEvents : _props$codeEvents, _props$generateAnchor = props.generateAnchorID, generateAnchorID = void 0 === _props$generateAnchor ? DEFAULT_CONTEXT_VALUE.generateAnchorID : _props$generateAnchor, _props$selectedChange = props.selectedChanges, selectedChanges = void 0 === _props$selectedChange ? DEFAULT_CONTEXT_VALUE.selectedChanges : _props$selectedChange, _props$widgets = props.widgets, widgets = void 0 === _props$widgets ? DEFAULT_CONTEXT_VALUE.widgets : _props$widgets, _props$renderGutter = props.renderGutter, renderGutter = void 0 === _props$renderGutter ? DEFAULT_CONTEXT_VALUE.renderGutter : _props$renderGutter, tokens = props.tokens, renderToken = props.renderToken, _props$children = props.children, children = void 0 === _props$children ? defaultRenderChildren : _props$children, root = (0, import_react10.useRef)(null), enableColumnSelection = (0, import_react10.useCallback)(function(_ref) {
    var target = _ref.target;
    if (0 === _ref.button) {
      var closestCell = function(target2, className2) {
        for (var current3 = target2; current3 && current3 !== document.documentElement && !current3.classList.contains(className2); ) current3 = current3.parentElement;
        return current3 === document.documentElement ? null : current3;
      }(target, "diff-code");
      if (closestCell && closestCell.parentElement) {
        var selection = window.getSelection();
        selection && selection.removeAllRanges();
        var index2 = _toConsumableArray(closestCell.parentElement.children).indexOf(closestCell);
        if (1 === index2 || 3 === index2) {
          var _step, _iterator = _createForOfIteratorHelper(root.current ? root.current.querySelectorAll(".diff-line") : []);
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done; ) {
              var cells = _step.value.children;
              setUserSelectStyle(cells[1], 1 === index2), setUserSelectStyle(cells[3], 3 === index2);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
      }
    }
  }, []), hideGutter = "none" === gutterType, monotonous = "add" === diffType || "delete" === diffType, onTableMouseDown = "split" === viewType && !monotonous && optimizeSelection ? enableColumnSelection : noop, cols = (0, import_react10.useMemo)(function() {
    return (0, import_jsx_runtime9.jsxs)("colgroup", "unified" === viewType ? { children: [!hideGutter && (0, import_jsx_runtime9.jsx)("col", { className: "diff-gutter-col" }), !hideGutter && (0, import_jsx_runtime9.jsx)("col", { className: "diff-gutter-col" }), (0, import_jsx_runtime9.jsx)("col", {})] } : monotonous ? { children: [!hideGutter && (0, import_jsx_runtime9.jsx)("col", { className: "diff-gutter-col" }), (0, import_jsx_runtime9.jsx)("col", {})] } : { children: [!hideGutter && (0, import_jsx_runtime9.jsx)("col", { className: "diff-gutter-col" }), (0, import_jsx_runtime9.jsx)("col", {}), !hideGutter && (0, import_jsx_runtime9.jsx)("col", { className: "diff-gutter-col" }), (0, import_jsx_runtime9.jsx)("col", {})] });
  }, [viewType, monotonous, hideGutter]), settingsContextValue = (0, import_react10.useMemo)(function() {
    return { hunkClassName, lineClassName, generateLineClassName, gutterClassName, codeClassName, monotonous, hideGutter, viewType, gutterType, codeEvents, gutterEvents, generateAnchorID, selectedChanges, widgets, renderGutter, tokens, renderToken };
  }, [codeClassName, codeEvents, generateAnchorID, gutterClassName, gutterEvents, gutterType, hideGutter, hunkClassName, lineClassName, generateLineClassName, monotonous, renderGutter, renderToken, selectedChanges, tokens, viewType, widgets]);
  return (0, import_jsx_runtime9.jsx)(Provider, { value: settingsContextValue, children: (0, import_jsx_runtime9.jsxs)("table", { ref: root, className: classnames("diff", "diff-".concat(viewType), className), onMouseDown: onTableMouseDown, children: [cols, children(hunks)] }) });
}
var index = (0, import_react10.memo)(Diff);
var warning = function() {
};
if (true) {
  printWarning = function(format, args) {
    var len = arguments.length;
    args = new Array(len > 1 ? len - 1 : 0);
    for (var key = 1; key < len; key++) args[key - 1] = arguments[key];
    var argIndex = 0, message = "Warning: " + format.replace(/%s/g, function() {
      return args[argIndex++];
    });
    "undefined" != typeof console && console.error(message);
    try {
      throw new Error(message);
    } catch (x) {
    }
  };
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) args[key - 2] = arguments[key];
    if (void 0 === format) throw new Error("`warning(condition, format, ...args)` requires a warning message argument");
    condition || printWarning.apply(null, [format].concat(args));
  };
}
var printWarning;
var _arrayAggregator = function(array, setter, iteratee, accumulator) {
  for (var index2 = -1, length = null == array ? 0 : array.length; ++index2 < length; ) {
    var value = array[index2];
    setter(accumulator, value, iteratee(value), array);
  }
  return accumulator;
};
var _createBaseEach = function(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (null == collection) return collection;
    if (!isArrayLike_1(collection)) return eachFunc(collection, iteratee);
    for (var length = collection.length, index2 = fromRight ? length : -1, iterable = Object(collection); (fromRight ? index2-- : ++index2 < length) && false !== iteratee(iterable[index2], index2, iterable); ) ;
    return collection;
  };
};
var _baseEach = _createBaseEach(_baseForOwn);
var _baseAggregator = function(collection, setter, iteratee, accumulator) {
  return _baseEach(collection, function(value, key, collection2) {
    setter(accumulator, value, iteratee(value), collection2);
  }), accumulator;
};
var _createAggregator = function(setter, initializer) {
  return function(collection, iteratee) {
    var func = isArray_1(collection) ? _arrayAggregator : _baseAggregator, accumulator = initializer ? initializer() : {};
    return func(collection, setter, _baseIteratee(iteratee), accumulator);
  };
};
var keyBy_1 = _createAggregator(function(result, value, key) {
  _baseAssignValue(result, key, value);
});
var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : void 0;
var _isFlattenable = function(value) {
  return isArray_1(value) || isArguments_1(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
};
var _baseFlatten = function baseFlatten(array, depth, predicate, isStrict, result) {
  var index2 = -1, length = array.length;
  for (predicate || (predicate = _isFlattenable), result || (result = []); ++index2 < length; ) {
    var value = array[index2];
    depth > 0 && predicate(value) ? depth > 1 ? baseFlatten(value, depth - 1, predicate, isStrict, result) : _arrayPush(result, value) : isStrict || (result[result.length] = value);
  }
  return result;
};
var _baseMap = function(collection, iteratee) {
  var index2 = -1, result = isArrayLike_1(collection) ? Array(collection.length) : [];
  return _baseEach(collection, function(value, key, collection2) {
    result[++index2] = iteratee(value, key, collection2);
  }), result;
};
var map_1 = function(collection, iteratee) {
  return (isArray_1(collection) ? _arrayMap : _baseMap)(collection, _baseIteratee(iteratee));
};
var flatMap_1 = function(collection, iteratee) {
  return _baseFlatten(map_1(collection, iteratee), 1);
};
function applyHunk(linesOfCode, _ref) {
  var newStart = _ref.newStart, _changes$reduce = _ref.changes.reduce(function(_ref2, change) {
    var _ref3 = _slicedToArray(_ref2, 2), lines = _ref3[0], cursor = _ref3[1];
    return isDelete(change) ? (lines.splice(cursor, 1), [lines, cursor]) : (isInsert(change) && lines.splice(cursor, 0, change.content), [lines, cursor + 1]);
  }, [linesOfCode, newStart - 1]);
  return _slicedToArray(_changes$reduce, 1)[0];
}
function mapChanges(changes, side, toValue) {
  if (!changes.length) return [];
  var computeLineNumber = "old" === side ? computeOldLineNumber : computeNewLineNumber, changesByLineNumber = keyBy_1(changes, computeLineNumber), maxLineNumber = computeLineNumber(changes[changes.length - 1]);
  return Array.from({ length: maxLineNumber }).map(function(value, i) {
    return toValue(changesByLineNumber[i + 1]);
  });
}
function toTextPair(hunks) {
  var _groupChanges = function(hunks2) {
    return flatMap_1(hunks2, function(hunk) {
      return hunk.changes;
    }).reduce(function(_ref4, change) {
      var _ref5 = _slicedToArray(_ref4, 2), oldChanges2 = _ref5[0], newChanges2 = _ref5[1];
      return isNormal(change) ? (oldChanges2.push(change), newChanges2.push(change)) : isDelete(change) ? oldChanges2.push(change) : newChanges2.push(change), [oldChanges2, newChanges2];
    }, [[], []]);
  }(hunks), _groupChanges2 = _slicedToArray(_groupChanges, 2), oldChanges = _groupChanges2[0], newChanges = _groupChanges2[1], toText = function(change) {
    return change ? change.content : "";
  };
  return [mapChanges(oldChanges, "old", toText).join("\n"), mapChanges(newChanges, "new", toText).join("\n")];
}
function createRoot(children) {
  return { type: "root", children };
}
function toTokenTrees(hunks, options) {
  if (options.oldSource) {
    var newSource = function(oldSource, hunks2) {
      return hunks2.reduce(applyHunk, oldSource.split("\n")).join("\n");
    }(options.oldSource, hunks), highlightText = options.highlight ? function(text) {
      return options.refractor.highlight(text, options.language);
    } : function(text) {
      return [{ type: "text", value: text }];
    };
    return [createRoot(highlightText(options.oldSource)), createRoot(highlightText(newSource))];
  }
  var _toTextPair2 = _slicedToArray(toTextPair(hunks), 2), oldText = _toTextPair2[0], newText = _toTextPair2[1], toTree = options.highlight ? function(text) {
    return createRoot(options.refractor.highlight(text, options.language));
  } : function(text) {
    return createRoot([{ type: "text", value: text }]);
  };
  return [toTree(oldText), toTree(newText)];
}
function clone(path) {
  return path.map(function(node) {
    return _objectSpread2({}, node);
  });
}
function replace(path, leaf) {
  return [].concat(_toConsumableArray(clone(path.slice(0, -1))), [leaf]);
}
function isTextNode(node) {
  return "text" === node.type;
}
function leafOf(path) {
  var last = path[path.length - 1];
  if (isTextNode(last)) return last;
  throw new Error("Invalid token path with leaf of type ".concat(last.type));
}
function split(path, splitStart, splitEnd, wrapSplitNode) {
  var parents = path.slice(0, -1), leaf = leafOf(path), output = [];
  if (splitEnd <= 0 || splitStart >= (null == leaf ? void 0 : leaf.value.length)) return [path];
  var split2 = function(start, end) {
    var value = leaf.value.slice(start, end);
    return [].concat(_toConsumableArray(parents), [_objectSpread2(_objectSpread2({}, leaf), {}, { value })]);
  };
  if (splitStart > 0) {
    var head = split2(0, splitStart);
    output.push(clone(head));
  }
  var body = split2(Math.max(splitStart, 0), splitEnd);
  if (output.push(wrapSplitNode ? function(path2, parent) {
    return [parent].concat(_toConsumableArray(clone(path2)));
  }(body, wrapSplitNode) : clone(body)), splitEnd < leaf.value.length) {
    var tail = split2(splitEnd);
    output.push(clone(tail));
  }
  return output;
}
var _excluded$3 = ["children"];
function treeToPathList(node) {
  var output = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [], path = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : [];
  if (node.children) {
    var children = node.children, nodeToUse = _objectWithoutProperties(node, _excluded$3);
    path.push(nodeToUse);
    var _step, _iterator = _createForOfIteratorHelper(children);
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done; ) {
        treeToPathList(_step.value, output, path);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    path.pop();
  } else output.push(clone([].concat(_toConsumableArray(path.slice(1)), [node])));
  return output;
}
function splitByLineBreak(paths) {
  return paths.reduce(function(lines, path) {
    var currentLine = lines[lines.length - 1], _splitPathToLines = function(path2) {
      var leaf = leafOf(path2);
      return leaf.value.includes("\n") ? leaf.value.split("\n").map(function(line) {
        return replace(path2, _objectSpread2(_objectSpread2({}, leaf), {}, { value: line }));
      }) : [path2];
    }(path), _splitPathToLines2 = _toArray(_splitPathToLines), currentRemaining = _splitPathToLines2[0], nextLines = _splitPathToLines2.slice(1);
    return [].concat(_toConsumableArray(lines.slice(0, -1)), [[].concat(_toConsumableArray(currentLine), [currentRemaining])], _toConsumableArray(nextLines.map(function(path2) {
      return [path2];
    })));
  }, [[]]);
}
function normalizeToLines(tree) {
  return splitByLineBreak(treeToPathList(tree));
}
var isEqualWith_1 = function(value, other, customizer) {
  var result = (customizer = "function" == typeof customizer ? customizer : void 0) ? customizer(value, other) : void 0;
  return void 0 === result ? _baseIsEqual(value, other, void 0, customizer) : !!result;
};
var isEqual_1 = function(value, other) {
  return _baseIsEqual(value, other);
};
var last_1 = function(array) {
  var length = null == array ? 0 : array.length;
  return length ? array[length - 1] : void 0;
};
function attachNode(parent, node) {
  if (!parent.children) throw new Error("parent node missing children property");
  var x, y, previousSibling = last_1(parent.children);
  return previousSibling && (y = node, (x = previousSibling).type === y.type && ("text" === x.type || x.children && y.children && isEqualWith_1(x, y, function(x2, y2, name2) {
    return "chlidren" === name2 || isEqual_1(x2, y2);
  }))) ? parent.children[parent.children.length - 1] = function(x2, y2) {
    return "value" in x2 && "value" in y2 ? _objectSpread2(_objectSpread2({}, x2), {}, { value: "".concat(x2.value).concat(y2.value) }) : x2;
  }(previousSibling, node) : parent.children.push(node), parent.children[parent.children.length - 1];
}
function backToTree(pathList) {
  var _step, root = { type: "root", children: [] }, _iterator = _createForOfIteratorHelper(pathList);
  try {
    var _loop = function() {
      var path = _step.value;
      path.reduce(function(parent, node, i) {
        return attachNode(parent, i === path.length - 1 ? _objectSpread2({}, node) : _objectSpread2(_objectSpread2({}, node), {}, { children: [] }));
      }, root);
    };
    for (_iterator.s(); !(_step = _iterator.n()).done; ) _loop();
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return root;
}
var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var groupBy_1 = _createAggregator(function(result, value, key) {
  hasOwnProperty$1.call(result, key) ? result[key].push(value) : _baseAssignValue(result, key, [value]);
});
var hasOwnProperty = Object.prototype.hasOwnProperty;
var isEmpty_1 = function(value) {
  if (null == value) return true;
  if (isArrayLike_1(value) && (isArray_1(value) || "string" == typeof value || "function" == typeof value.splice || isBuffer_1(value) || isTypedArray_1(value) || isArguments_1(value))) return !value.length;
  var tag = _getTag(value);
  if ("[object Map]" == tag || "[object Set]" == tag) return !value.size;
  if (_isPrototype(value)) return !_baseKeys(value).length;
  for (var key in value) if (hasOwnProperty.call(value, key)) return false;
  return true;
};
var splitPathToEncloseRange = function(paths, node) {
  var start = node.start, length = node.length, rangeEnd = start + length, _paths$reduce = paths.reduce(function(_ref, path) {
    var _ref2 = _slicedToArray(_ref, 2), output = _ref2[0], nodeStart = _ref2[1], nodeEnd = nodeStart + leafOf(path).value.length;
    if (nodeStart > rangeEnd || nodeEnd < start) output.push(path);
    else {
      var segments = split(path, start - nodeStart, rangeEnd - nodeStart, node);
      output.push.apply(output, _toConsumableArray(segments));
    }
    return [output, nodeEnd];
  }, [[], 0]);
  return _slicedToArray(_paths$reduce, 1)[0];
};
function process$1(linesOfPaths, ranges) {
  var rangesByLine = groupBy_1(ranges, "lineNumber");
  return linesOfPaths.map(function(line, i) {
    return function(paths, ranges2) {
      return isEmpty_1(ranges2) ? paths : ranges2.reduce(splitPathToEncloseRange, paths);
    }(line, rangesByLine[i + 1]);
  });
}
function pickRanges(oldRanges, newRanges) {
  return function(_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2), oldLinesOfPaths = _ref4[0], newLinesOfPaths = _ref4[1];
    return [process$1(oldLinesOfPaths, oldRanges), process$1(newLinesOfPaths, newRanges)];
  };
}
var flatten_1 = function(array) {
  return (null == array ? 0 : array.length) ? _baseFlatten(array, 1) : [];
};
var nativeMax = Math.max;
var findIndex_1 = function(array, predicate, fromIndex) {
  var length = null == array ? 0 : array.length;
  if (!length) return -1;
  var index2 = null == fromIndex ? 0 : toInteger_1(fromIndex);
  return index2 < 0 && (index2 = nativeMax(length + index2, 0)), _baseFindIndex(array, _baseIteratee(predicate), index2);
};
var diffMatchPatch = createCommonjsModule(function(module2) {
  var diff_match_patch = function() {
    this.Diff_Timeout = 1, this.Diff_EditCost = 4, this.Match_Threshold = 0.5, this.Match_Distance = 1e3, this.Patch_DeleteThreshold = 0.5, this.Patch_Margin = 4, this.Match_MaxBits = 32;
  };
  diff_match_patch.Diff = function(op, text) {
    return [op, text];
  }, diff_match_patch.prototype.diff_main = function(text1, text2, opt_checklines, opt_deadline) {
    void 0 === opt_deadline && (opt_deadline = this.Diff_Timeout <= 0 ? Number.MAX_VALUE : (/* @__PURE__ */ new Date()).getTime() + 1e3 * this.Diff_Timeout);
    var deadline = opt_deadline;
    if (null == text1 || null == text2) throw new Error("Null input. (diff_main)");
    if (text1 == text2) return text1 ? [new diff_match_patch.Diff(0, text1)] : [];
    void 0 === opt_checklines && (opt_checklines = true);
    var checklines = opt_checklines, commonlength = this.diff_commonPrefix(text1, text2), commonprefix = text1.substring(0, commonlength);
    text1 = text1.substring(commonlength), text2 = text2.substring(commonlength), commonlength = this.diff_commonSuffix(text1, text2);
    var commonsuffix = text1.substring(text1.length - commonlength);
    text1 = text1.substring(0, text1.length - commonlength), text2 = text2.substring(0, text2.length - commonlength);
    var diffs = this.diff_compute_(text1, text2, checklines, deadline);
    return commonprefix && diffs.unshift(new diff_match_patch.Diff(0, commonprefix)), commonsuffix && diffs.push(new diff_match_patch.Diff(0, commonsuffix)), this.diff_cleanupMerge(diffs), diffs;
  }, diff_match_patch.prototype.diff_compute_ = function(text1, text2, checklines, deadline) {
    var diffs;
    if (!text1) return [new diff_match_patch.Diff(1, text2)];
    if (!text2) return [new diff_match_patch.Diff(-1, text1)];
    var longtext = text1.length > text2.length ? text1 : text2, shorttext = text1.length > text2.length ? text2 : text1, i = longtext.indexOf(shorttext);
    if (-1 != i) return diffs = [new diff_match_patch.Diff(1, longtext.substring(0, i)), new diff_match_patch.Diff(0, shorttext), new diff_match_patch.Diff(1, longtext.substring(i + shorttext.length))], text1.length > text2.length && (diffs[0][0] = diffs[2][0] = -1), diffs;
    if (1 == shorttext.length) return [new diff_match_patch.Diff(-1, text1), new diff_match_patch.Diff(1, text2)];
    var hm = this.diff_halfMatch_(text1, text2);
    if (hm) {
      var text1_a = hm[0], text1_b = hm[1], text2_a = hm[2], text2_b = hm[3], mid_common = hm[4], diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline), diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
      return diffs_a.concat([new diff_match_patch.Diff(0, mid_common)], diffs_b);
    }
    return checklines && text1.length > 100 && text2.length > 100 ? this.diff_lineMode_(text1, text2, deadline) : this.diff_bisect_(text1, text2, deadline);
  }, diff_match_patch.prototype.diff_lineMode_ = function(text1, text2, deadline) {
    var a = this.diff_linesToChars_(text1, text2);
    text1 = a.chars1, text2 = a.chars2;
    var linearray = a.lineArray, diffs = this.diff_main(text1, text2, false, deadline);
    this.diff_charsToLines_(diffs, linearray), this.diff_cleanupSemantic(diffs), diffs.push(new diff_match_patch.Diff(0, ""));
    for (var pointer = 0, count_delete = 0, count_insert = 0, text_delete = "", text_insert = ""; pointer < diffs.length; ) {
      switch (diffs[pointer][0]) {
        case 1:
          count_insert++, text_insert += diffs[pointer][1];
          break;
        case -1:
          count_delete++, text_delete += diffs[pointer][1];
          break;
        case 0:
          if (count_delete >= 1 && count_insert >= 1) {
            diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert), pointer = pointer - count_delete - count_insert;
            for (var subDiff = this.diff_main(text_delete, text_insert, false, deadline), j = subDiff.length - 1; j >= 0; j--) diffs.splice(pointer, 0, subDiff[j]);
            pointer += subDiff.length;
          }
          count_insert = 0, count_delete = 0, text_delete = "", text_insert = "";
      }
      pointer++;
    }
    return diffs.pop(), diffs;
  }, diff_match_patch.prototype.diff_bisect_ = function(text1, text2, deadline) {
    for (var text1_length = text1.length, text2_length = text2.length, max_d = Math.ceil((text1_length + text2_length) / 2), v_offset = max_d, v_length = 2 * max_d, v1 = new Array(v_length), v2 = new Array(v_length), x = 0; x < v_length; x++) v1[x] = -1, v2[x] = -1;
    v1[v_offset + 1] = 0, v2[v_offset + 1] = 0;
    for (var delta = text1_length - text2_length, front = delta % 2 != 0, k1start = 0, k1end = 0, k2start = 0, k2end = 0, d = 0; d < max_d && !((/* @__PURE__ */ new Date()).getTime() > deadline); d++) {
      for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
        for (var k1_offset = v_offset + k1, y1 = (x1 = k1 == -d || k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1] ? v1[k1_offset + 1] : v1[k1_offset - 1] + 1) - k1; x1 < text1_length && y1 < text2_length && text1.charAt(x1) == text2.charAt(y1); ) x1++, y1++;
        if (v1[k1_offset] = x1, x1 > text1_length) k1end += 2;
        else if (y1 > text2_length) k1start += 2;
        else if (front) {
          if ((k2_offset = v_offset + delta - k1) >= 0 && k2_offset < v_length && -1 != v2[k2_offset]) {
            if (x1 >= (x2 = text1_length - v2[k2_offset])) return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
          }
        }
      }
      for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
        for (var x2, k2_offset = v_offset + k2, y2 = (x2 = k2 == -d || k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1] ? v2[k2_offset + 1] : v2[k2_offset - 1] + 1) - k2; x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) == text2.charAt(text2_length - y2 - 1); ) x2++, y2++;
        if (v2[k2_offset] = x2, x2 > text1_length) k2end += 2;
        else if (y2 > text2_length) k2start += 2;
        else if (!front) {
          if ((k1_offset = v_offset + delta - k2) >= 0 && k1_offset < v_length && -1 != v1[k1_offset]) {
            var x1;
            y1 = v_offset + (x1 = v1[k1_offset]) - k1_offset;
            if (x1 >= (x2 = text1_length - x2)) return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
          }
        }
      }
    }
    return [new diff_match_patch.Diff(-1, text1), new diff_match_patch.Diff(1, text2)];
  }, diff_match_patch.prototype.diff_bisectSplit_ = function(text1, text2, x, y, deadline) {
    var text1a = text1.substring(0, x), text2a = text2.substring(0, y), text1b = text1.substring(x), text2b = text2.substring(y), diffs = this.diff_main(text1a, text2a, false, deadline), diffsb = this.diff_main(text1b, text2b, false, deadline);
    return diffs.concat(diffsb);
  }, diff_match_patch.prototype.diff_linesToChars_ = function(text1, text2) {
    var lineArray = [], lineHash = {};
    function diff_linesToCharsMunge_(text) {
      for (var chars = "", lineStart = 0, lineEnd = -1, lineArrayLength = lineArray.length; lineEnd < text.length - 1; ) {
        -1 == (lineEnd = text.indexOf("\n", lineStart)) && (lineEnd = text.length - 1);
        var line = text.substring(lineStart, lineEnd + 1);
        (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) : void 0 !== lineHash[line]) ? chars += String.fromCharCode(lineHash[line]) : (lineArrayLength == maxLines && (line = text.substring(lineStart), lineEnd = text.length), chars += String.fromCharCode(lineArrayLength), lineHash[line] = lineArrayLength, lineArray[lineArrayLength++] = line), lineStart = lineEnd + 1;
      }
      return chars;
    }
    lineArray[0] = "";
    var maxLines = 4e4, chars1 = diff_linesToCharsMunge_(text1);
    return maxLines = 65535, { chars1, chars2: diff_linesToCharsMunge_(text2), lineArray };
  }, diff_match_patch.prototype.diff_charsToLines_ = function(diffs, lineArray) {
    for (var i = 0; i < diffs.length; i++) {
      for (var chars = diffs[i][1], text = [], j = 0; j < chars.length; j++) text[j] = lineArray[chars.charCodeAt(j)];
      diffs[i][1] = text.join("");
    }
  }, diff_match_patch.prototype.diff_commonPrefix = function(text1, text2) {
    if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) return 0;
    for (var pointermin = 0, pointermax = Math.min(text1.length, text2.length), pointermid = pointermax, pointerstart = 0; pointermin < pointermid; ) text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid) ? pointerstart = pointermin = pointermid : pointermax = pointermid, pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    return pointermid;
  }, diff_match_patch.prototype.diff_commonSuffix = function(text1, text2) {
    if (!text1 || !text2 || text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) return 0;
    for (var pointermin = 0, pointermax = Math.min(text1.length, text2.length), pointermid = pointermax, pointerend = 0; pointermin < pointermid; ) text1.substring(text1.length - pointermid, text1.length - pointerend) == text2.substring(text2.length - pointermid, text2.length - pointerend) ? pointerend = pointermin = pointermid : pointermax = pointermid, pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    return pointermid;
  }, diff_match_patch.prototype.diff_commonOverlap_ = function(text1, text2) {
    var text1_length = text1.length, text2_length = text2.length;
    if (0 == text1_length || 0 == text2_length) return 0;
    text1_length > text2_length ? text1 = text1.substring(text1_length - text2_length) : text1_length < text2_length && (text2 = text2.substring(0, text1_length));
    var text_length = Math.min(text1_length, text2_length);
    if (text1 == text2) return text_length;
    for (var best = 0, length = 1; ; ) {
      var pattern2 = text1.substring(text_length - length), found = text2.indexOf(pattern2);
      if (-1 == found) return best;
      length += found, 0 != found && text1.substring(text_length - length) != text2.substring(0, length) || (best = length, length++);
    }
  }, diff_match_patch.prototype.diff_halfMatch_ = function(text1, text2) {
    if (this.Diff_Timeout <= 0) return null;
    var longtext = text1.length > text2.length ? text1 : text2, shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || 2 * shorttext.length < longtext.length) return null;
    var dmp = this;
    function diff_halfMatchI_(longtext2, shorttext2, i) {
      for (var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b, seed = longtext2.substring(i, i + Math.floor(longtext2.length / 4)), j = -1, best_common = ""; -1 != (j = shorttext2.indexOf(seed, j + 1)); ) {
        var prefixLength = dmp.diff_commonPrefix(longtext2.substring(i), shorttext2.substring(j)), suffixLength = dmp.diff_commonSuffix(longtext2.substring(0, i), shorttext2.substring(0, j));
        best_common.length < suffixLength + prefixLength && (best_common = shorttext2.substring(j - suffixLength, j) + shorttext2.substring(j, j + prefixLength), best_longtext_a = longtext2.substring(0, i - suffixLength), best_longtext_b = longtext2.substring(i + prefixLength), best_shorttext_a = shorttext2.substring(0, j - suffixLength), best_shorttext_b = shorttext2.substring(j + prefixLength));
      }
      return 2 * best_common.length >= longtext2.length ? [best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b, best_common] : null;
    }
    var hm, text1_a, text1_b, text2_a, text2_b, hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4)), hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
    return hm1 || hm2 ? (hm = hm2 ? hm1 && hm1[4].length > hm2[4].length ? hm1 : hm2 : hm1, text1.length > text2.length ? (text1_a = hm[0], text1_b = hm[1], text2_a = hm[2], text2_b = hm[3]) : (text2_a = hm[0], text2_b = hm[1], text1_a = hm[2], text1_b = hm[3]), [text1_a, text1_b, text2_a, text2_b, hm[4]]) : null;
  }, diff_match_patch.prototype.diff_cleanupSemantic = function(diffs) {
    for (var changes = false, equalities = [], equalitiesLength = 0, lastEquality = null, pointer = 0, length_insertions1 = 0, length_deletions1 = 0, length_insertions2 = 0, length_deletions2 = 0; pointer < diffs.length; ) 0 == diffs[pointer][0] ? (equalities[equalitiesLength++] = pointer, length_insertions1 = length_insertions2, length_deletions1 = length_deletions2, length_insertions2 = 0, length_deletions2 = 0, lastEquality = diffs[pointer][1]) : (1 == diffs[pointer][0] ? length_insertions2 += diffs[pointer][1].length : length_deletions2 += diffs[pointer][1].length, lastEquality && lastEquality.length <= Math.max(length_insertions1, length_deletions1) && lastEquality.length <= Math.max(length_insertions2, length_deletions2) && (diffs.splice(equalities[equalitiesLength - 1], 0, new diff_match_patch.Diff(-1, lastEquality)), diffs[equalities[equalitiesLength - 1] + 1][0] = 1, equalitiesLength--, pointer = --equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1, length_insertions1 = 0, length_deletions1 = 0, length_insertions2 = 0, length_deletions2 = 0, lastEquality = null, changes = true)), pointer++;
    for (changes && this.diff_cleanupMerge(diffs), this.diff_cleanupSemanticLossless(diffs), pointer = 1; pointer < diffs.length; ) {
      if (-1 == diffs[pointer - 1][0] && 1 == diffs[pointer][0]) {
        var deletion = diffs[pointer - 1][1], insertion = diffs[pointer][1], overlap_length1 = this.diff_commonOverlap_(deletion, insertion), overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
        overlap_length1 >= overlap_length2 ? (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) && (diffs.splice(pointer, 0, new diff_match_patch.Diff(0, insertion.substring(0, overlap_length1))), diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlap_length1), diffs[pointer + 1][1] = insertion.substring(overlap_length1), pointer++) : (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) && (diffs.splice(pointer, 0, new diff_match_patch.Diff(0, deletion.substring(0, overlap_length2))), diffs[pointer - 1][0] = 1, diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlap_length2), diffs[pointer + 1][0] = -1, diffs[pointer + 1][1] = deletion.substring(overlap_length2), pointer++), pointer++;
      }
      pointer++;
    }
  }, diff_match_patch.prototype.diff_cleanupSemanticLossless = function(diffs) {
    function diff_cleanupSemanticScore_(one, two) {
      if (!one || !two) return 6;
      var char1 = one.charAt(one.length - 1), char2 = two.charAt(0), nonAlphaNumeric1 = char1.match(diff_match_patch.nonAlphaNumericRegex_), nonAlphaNumeric2 = char2.match(diff_match_patch.nonAlphaNumericRegex_), whitespace1 = nonAlphaNumeric1 && char1.match(diff_match_patch.whitespaceRegex_), whitespace2 = nonAlphaNumeric2 && char2.match(diff_match_patch.whitespaceRegex_), lineBreak1 = whitespace1 && char1.match(diff_match_patch.linebreakRegex_), lineBreak2 = whitespace2 && char2.match(diff_match_patch.linebreakRegex_), blankLine1 = lineBreak1 && one.match(diff_match_patch.blanklineEndRegex_), blankLine2 = lineBreak2 && two.match(diff_match_patch.blanklineStartRegex_);
      return blankLine1 || blankLine2 ? 5 : lineBreak1 || lineBreak2 ? 4 : nonAlphaNumeric1 && !whitespace1 && whitespace2 ? 3 : whitespace1 || whitespace2 ? 2 : nonAlphaNumeric1 || nonAlphaNumeric2 ? 1 : 0;
    }
    for (var pointer = 1; pointer < diffs.length - 1; ) {
      if (0 == diffs[pointer - 1][0] && 0 == diffs[pointer + 1][0]) {
        var equality1 = diffs[pointer - 1][1], edit = diffs[pointer][1], equality2 = diffs[pointer + 1][1], commonOffset = this.diff_commonSuffix(equality1, edit);
        if (commonOffset) {
          var commonString = edit.substring(edit.length - commonOffset);
          equality1 = equality1.substring(0, equality1.length - commonOffset), edit = commonString + edit.substring(0, edit.length - commonOffset), equality2 = commonString + equality2;
        }
        for (var bestEquality1 = equality1, bestEdit = edit, bestEquality2 = equality2, bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2); edit.charAt(0) === equality2.charAt(0); ) {
          equality1 += edit.charAt(0), edit = edit.substring(1) + equality2.charAt(0), equality2 = equality2.substring(1);
          var score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
          score >= bestScore && (bestScore = score, bestEquality1 = equality1, bestEdit = edit, bestEquality2 = equality2);
        }
        diffs[pointer - 1][1] != bestEquality1 && (bestEquality1 ? diffs[pointer - 1][1] = bestEquality1 : (diffs.splice(pointer - 1, 1), pointer--), diffs[pointer][1] = bestEdit, bestEquality2 ? diffs[pointer + 1][1] = bestEquality2 : (diffs.splice(pointer + 1, 1), pointer--));
      }
      pointer++;
    }
  }, diff_match_patch.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/, diff_match_patch.whitespaceRegex_ = /\s/, diff_match_patch.linebreakRegex_ = /[\r\n]/, diff_match_patch.blanklineEndRegex_ = /\n\r?\n$/, diff_match_patch.blanklineStartRegex_ = /^\r?\n\r?\n/, diff_match_patch.prototype.diff_cleanupEfficiency = function(diffs) {
    for (var changes = false, equalities = [], equalitiesLength = 0, lastEquality = null, pointer = 0, pre_ins = false, pre_del = false, post_ins = false, post_del = false; pointer < diffs.length; ) 0 == diffs[pointer][0] ? (diffs[pointer][1].length < this.Diff_EditCost && (post_ins || post_del) ? (equalities[equalitiesLength++] = pointer, pre_ins = post_ins, pre_del = post_del, lastEquality = diffs[pointer][1]) : (equalitiesLength = 0, lastEquality = null), post_ins = post_del = false) : (-1 == diffs[pointer][0] ? post_del = true : post_ins = true, lastEquality && (pre_ins && pre_del && post_ins && post_del || lastEquality.length < this.Diff_EditCost / 2 && pre_ins + pre_del + post_ins + post_del == 3) && (diffs.splice(equalities[equalitiesLength - 1], 0, new diff_match_patch.Diff(-1, lastEquality)), diffs[equalities[equalitiesLength - 1] + 1][0] = 1, equalitiesLength--, lastEquality = null, pre_ins && pre_del ? (post_ins = post_del = true, equalitiesLength = 0) : (pointer = --equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1, post_ins = post_del = false), changes = true)), pointer++;
    changes && this.diff_cleanupMerge(diffs);
  }, diff_match_patch.prototype.diff_cleanupMerge = function(diffs) {
    diffs.push(new diff_match_patch.Diff(0, ""));
    for (var commonlength, pointer = 0, count_delete = 0, count_insert = 0, text_delete = "", text_insert = ""; pointer < diffs.length; ) switch (diffs[pointer][0]) {
      case 1:
        count_insert++, text_insert += diffs[pointer][1], pointer++;
        break;
      case -1:
        count_delete++, text_delete += diffs[pointer][1], pointer++;
        break;
      case 0:
        count_delete + count_insert > 1 ? (0 !== count_delete && 0 !== count_insert && (0 !== (commonlength = this.diff_commonPrefix(text_insert, text_delete)) && (pointer - count_delete - count_insert > 0 && 0 == diffs[pointer - count_delete - count_insert - 1][0] ? diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength) : (diffs.splice(0, 0, new diff_match_patch.Diff(0, text_insert.substring(0, commonlength))), pointer++), text_insert = text_insert.substring(commonlength), text_delete = text_delete.substring(commonlength)), 0 !== (commonlength = this.diff_commonSuffix(text_insert, text_delete)) && (diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1], text_insert = text_insert.substring(0, text_insert.length - commonlength), text_delete = text_delete.substring(0, text_delete.length - commonlength))), pointer -= count_delete + count_insert, diffs.splice(pointer, count_delete + count_insert), text_delete.length && (diffs.splice(pointer, 0, new diff_match_patch.Diff(-1, text_delete)), pointer++), text_insert.length && (diffs.splice(pointer, 0, new diff_match_patch.Diff(1, text_insert)), pointer++), pointer++) : 0 !== pointer && 0 == diffs[pointer - 1][0] ? (diffs[pointer - 1][1] += diffs[pointer][1], diffs.splice(pointer, 1)) : pointer++, count_insert = 0, count_delete = 0, text_delete = "", text_insert = "";
    }
    "" === diffs[diffs.length - 1][1] && diffs.pop();
    var changes = false;
    for (pointer = 1; pointer < diffs.length - 1; ) 0 == diffs[pointer - 1][0] && 0 == diffs[pointer + 1][0] && (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) == diffs[pointer - 1][1] ? (diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length), diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1], diffs.splice(pointer - 1, 1), changes = true) : diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1] && (diffs[pointer - 1][1] += diffs[pointer + 1][1], diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1], diffs.splice(pointer + 1, 1), changes = true)), pointer++;
    changes && this.diff_cleanupMerge(diffs);
  }, diff_match_patch.prototype.diff_xIndex = function(diffs, loc) {
    var x, chars1 = 0, chars2 = 0, last_chars1 = 0, last_chars2 = 0;
    for (x = 0; x < diffs.length && (1 !== diffs[x][0] && (chars1 += diffs[x][1].length), -1 !== diffs[x][0] && (chars2 += diffs[x][1].length), !(chars1 > loc)); x++) last_chars1 = chars1, last_chars2 = chars2;
    return diffs.length != x && -1 === diffs[x][0] ? last_chars2 : last_chars2 + (loc - last_chars1);
  }, diff_match_patch.prototype.diff_prettyHtml = function(diffs) {
    for (var html3 = [], pattern_amp = /&/g, pattern_lt = /</g, pattern_gt = />/g, pattern_para = /\n/g, x = 0; x < diffs.length; x++) {
      var op = diffs[x][0], text = diffs[x][1].replace(pattern_amp, "&amp;").replace(pattern_lt, "&lt;").replace(pattern_gt, "&gt;").replace(pattern_para, "&para;<br>");
      switch (op) {
        case 1:
          html3[x] = '<ins style="background:#e6ffe6;">' + text + "</ins>";
          break;
        case -1:
          html3[x] = '<del style="background:#ffe6e6;">' + text + "</del>";
          break;
        case 0:
          html3[x] = "<span>" + text + "</span>";
      }
    }
    return html3.join("");
  }, diff_match_patch.prototype.diff_text1 = function(diffs) {
    for (var text = [], x = 0; x < diffs.length; x++) 1 !== diffs[x][0] && (text[x] = diffs[x][1]);
    return text.join("");
  }, diff_match_patch.prototype.diff_text2 = function(diffs) {
    for (var text = [], x = 0; x < diffs.length; x++) -1 !== diffs[x][0] && (text[x] = diffs[x][1]);
    return text.join("");
  }, diff_match_patch.prototype.diff_levenshtein = function(diffs) {
    for (var levenshtein = 0, insertions = 0, deletions = 0, x = 0; x < diffs.length; x++) {
      var op = diffs[x][0], data = diffs[x][1];
      switch (op) {
        case 1:
          insertions += data.length;
          break;
        case -1:
          deletions += data.length;
          break;
        case 0:
          levenshtein += Math.max(insertions, deletions), insertions = 0, deletions = 0;
      }
    }
    return levenshtein += Math.max(insertions, deletions);
  }, diff_match_patch.prototype.diff_toDelta = function(diffs) {
    for (var text = [], x = 0; x < diffs.length; x++) switch (diffs[x][0]) {
      case 1:
        text[x] = "+" + encodeURI(diffs[x][1]);
        break;
      case -1:
        text[x] = "-" + diffs[x][1].length;
        break;
      case 0:
        text[x] = "=" + diffs[x][1].length;
    }
    return text.join("	").replace(/%20/g, " ");
  }, diff_match_patch.prototype.diff_fromDelta = function(text1, delta) {
    for (var diffs = [], diffsLength = 0, pointer = 0, tokens = delta.split(/\t/g), x = 0; x < tokens.length; x++) {
      var param = tokens[x].substring(1);
      switch (tokens[x].charAt(0)) {
        case "+":
          try {
            diffs[diffsLength++] = new diff_match_patch.Diff(1, decodeURI(param));
          } catch (ex) {
            throw new Error("Illegal escape in diff_fromDelta: " + param);
          }
          break;
        case "-":
        case "=":
          var n = parseInt(param, 10);
          if (isNaN(n) || n < 0) throw new Error("Invalid number in diff_fromDelta: " + param);
          var text = text1.substring(pointer, pointer += n);
          "=" == tokens[x].charAt(0) ? diffs[diffsLength++] = new diff_match_patch.Diff(0, text) : diffs[diffsLength++] = new diff_match_patch.Diff(-1, text);
          break;
        default:
          if (tokens[x]) throw new Error("Invalid diff operation in diff_fromDelta: " + tokens[x]);
      }
    }
    if (pointer != text1.length) throw new Error("Delta length (" + pointer + ") does not equal source text length (" + text1.length + ").");
    return diffs;
  }, diff_match_patch.prototype.match_main = function(text, pattern2, loc) {
    if (null == text || null == pattern2 || null == loc) throw new Error("Null input. (match_main)");
    return loc = Math.max(0, Math.min(loc, text.length)), text == pattern2 ? 0 : text.length ? text.substring(loc, loc + pattern2.length) == pattern2 ? loc : this.match_bitap_(text, pattern2, loc) : -1;
  }, diff_match_patch.prototype.match_bitap_ = function(text, pattern2, loc) {
    if (pattern2.length > this.Match_MaxBits) throw new Error("Pattern too long for this browser.");
    var s2 = this.match_alphabet_(pattern2), dmp = this;
    function match_bitapScore_(e, x) {
      var accuracy = e / pattern2.length, proximity = Math.abs(loc - x);
      return dmp.Match_Distance ? accuracy + proximity / dmp.Match_Distance : proximity ? 1 : accuracy;
    }
    var score_threshold = this.Match_Threshold, best_loc = text.indexOf(pattern2, loc);
    -1 != best_loc && (score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold), -1 != (best_loc = text.lastIndexOf(pattern2, loc + pattern2.length)) && (score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold)));
    var bin_min, bin_mid, matchmask = 1 << pattern2.length - 1;
    best_loc = -1;
    for (var last_rd, bin_max = pattern2.length + text.length, d = 0; d < pattern2.length; d++) {
      for (bin_min = 0, bin_mid = bin_max; bin_min < bin_mid; ) match_bitapScore_(d, loc + bin_mid) <= score_threshold ? bin_min = bin_mid : bin_max = bin_mid, bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
      bin_max = bin_mid;
      var start = Math.max(1, loc - bin_mid + 1), finish = Math.min(loc + bin_mid, text.length) + pattern2.length, rd = Array(finish + 2);
      rd[finish + 1] = (1 << d) - 1;
      for (var j = finish; j >= start; j--) {
        var charMatch = s2[text.charAt(j - 1)];
        if (rd[j] = 0 === d ? (rd[j + 1] << 1 | 1) & charMatch : (rd[j + 1] << 1 | 1) & charMatch | (last_rd[j + 1] | last_rd[j]) << 1 | 1 | last_rd[j + 1], rd[j] & matchmask) {
          var score = match_bitapScore_(d, j - 1);
          if (score <= score_threshold) {
            if (score_threshold = score, !((best_loc = j - 1) > loc)) break;
            start = Math.max(1, 2 * loc - best_loc);
          }
        }
      }
      if (match_bitapScore_(d + 1, loc) > score_threshold) break;
      last_rd = rd;
    }
    return best_loc;
  }, diff_match_patch.prototype.match_alphabet_ = function(pattern2) {
    for (var s2 = {}, i = 0; i < pattern2.length; i++) s2[pattern2.charAt(i)] = 0;
    for (i = 0; i < pattern2.length; i++) s2[pattern2.charAt(i)] |= 1 << pattern2.length - i - 1;
    return s2;
  }, diff_match_patch.prototype.patch_addContext_ = function(patch, text) {
    if (0 != text.length) {
      if (null === patch.start2) throw Error("patch not initialized");
      for (var pattern2 = text.substring(patch.start2, patch.start2 + patch.length1), padding = 0; text.indexOf(pattern2) != text.lastIndexOf(pattern2) && pattern2.length < this.Match_MaxBits - this.Patch_Margin - this.Patch_Margin; ) padding += this.Patch_Margin, pattern2 = text.substring(patch.start2 - padding, patch.start2 + patch.length1 + padding);
      padding += this.Patch_Margin;
      var prefix = text.substring(patch.start2 - padding, patch.start2);
      prefix && patch.diffs.unshift(new diff_match_patch.Diff(0, prefix));
      var suffix = text.substring(patch.start2 + patch.length1, patch.start2 + patch.length1 + padding);
      suffix && patch.diffs.push(new diff_match_patch.Diff(0, suffix)), patch.start1 -= prefix.length, patch.start2 -= prefix.length, patch.length1 += prefix.length + suffix.length, patch.length2 += prefix.length + suffix.length;
    }
  }, diff_match_patch.prototype.patch_make = function(a, opt_b, opt_c) {
    var text1, diffs;
    if ("string" == typeof a && "string" == typeof opt_b && void 0 === opt_c) text1 = a, (diffs = this.diff_main(text1, opt_b, true)).length > 2 && (this.diff_cleanupSemantic(diffs), this.diff_cleanupEfficiency(diffs));
    else if (a && "object" == typeof a && void 0 === opt_b && void 0 === opt_c) diffs = a, text1 = this.diff_text1(diffs);
    else if ("string" == typeof a && opt_b && "object" == typeof opt_b && void 0 === opt_c) text1 = a, diffs = opt_b;
    else {
      if ("string" != typeof a || "string" != typeof opt_b || !opt_c || "object" != typeof opt_c) throw new Error("Unknown call format to patch_make.");
      text1 = a, diffs = opt_c;
    }
    if (0 === diffs.length) return [];
    for (var patches = [], patch = new diff_match_patch.patch_obj(), patchDiffLength = 0, char_count1 = 0, char_count2 = 0, prepatch_text = text1, postpatch_text = text1, x = 0; x < diffs.length; x++) {
      var diff_type = diffs[x][0], diff_text = diffs[x][1];
      switch (patchDiffLength || 0 === diff_type || (patch.start1 = char_count1, patch.start2 = char_count2), diff_type) {
        case 1:
          patch.diffs[patchDiffLength++] = diffs[x], patch.length2 += diff_text.length, postpatch_text = postpatch_text.substring(0, char_count2) + diff_text + postpatch_text.substring(char_count2);
          break;
        case -1:
          patch.length1 += diff_text.length, patch.diffs[patchDiffLength++] = diffs[x], postpatch_text = postpatch_text.substring(0, char_count2) + postpatch_text.substring(char_count2 + diff_text.length);
          break;
        case 0:
          diff_text.length <= 2 * this.Patch_Margin && patchDiffLength && diffs.length != x + 1 ? (patch.diffs[patchDiffLength++] = diffs[x], patch.length1 += diff_text.length, patch.length2 += diff_text.length) : diff_text.length >= 2 * this.Patch_Margin && patchDiffLength && (this.patch_addContext_(patch, prepatch_text), patches.push(patch), patch = new diff_match_patch.patch_obj(), patchDiffLength = 0, prepatch_text = postpatch_text, char_count1 = char_count2);
      }
      1 !== diff_type && (char_count1 += diff_text.length), -1 !== diff_type && (char_count2 += diff_text.length);
    }
    return patchDiffLength && (this.patch_addContext_(patch, prepatch_text), patches.push(patch)), patches;
  }, diff_match_patch.prototype.patch_deepCopy = function(patches) {
    for (var patchesCopy = [], x = 0; x < patches.length; x++) {
      var patch = patches[x], patchCopy = new diff_match_patch.patch_obj();
      patchCopy.diffs = [];
      for (var y = 0; y < patch.diffs.length; y++) patchCopy.diffs[y] = new diff_match_patch.Diff(patch.diffs[y][0], patch.diffs[y][1]);
      patchCopy.start1 = patch.start1, patchCopy.start2 = patch.start2, patchCopy.length1 = patch.length1, patchCopy.length2 = patch.length2, patchesCopy[x] = patchCopy;
    }
    return patchesCopy;
  }, diff_match_patch.prototype.patch_apply = function(patches, text) {
    if (0 == patches.length) return [text, []];
    patches = this.patch_deepCopy(patches);
    var nullPadding = this.patch_addPadding(patches);
    text = nullPadding + text + nullPadding, this.patch_splitMax(patches);
    for (var delta = 0, results = [], x = 0; x < patches.length; x++) {
      var start_loc, text2, expected_loc = patches[x].start2 + delta, text1 = this.diff_text1(patches[x].diffs), end_loc = -1;
      if (text1.length > this.Match_MaxBits ? -1 != (start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits), expected_loc)) && (-1 == (end_loc = this.match_main(text, text1.substring(text1.length - this.Match_MaxBits), expected_loc + text1.length - this.Match_MaxBits)) || start_loc >= end_loc) && (start_loc = -1) : start_loc = this.match_main(text, text1, expected_loc), -1 == start_loc) results[x] = false, delta -= patches[x].length2 - patches[x].length1;
      else if (results[x] = true, delta = start_loc - expected_loc, text1 == (text2 = -1 == end_loc ? text.substring(start_loc, start_loc + text1.length) : text.substring(start_loc, end_loc + this.Match_MaxBits))) text = text.substring(0, start_loc) + this.diff_text2(patches[x].diffs) + text.substring(start_loc + text1.length);
      else {
        var diffs = this.diff_main(text1, text2, false);
        if (text1.length > this.Match_MaxBits && this.diff_levenshtein(diffs) / text1.length > this.Patch_DeleteThreshold) results[x] = false;
        else {
          this.diff_cleanupSemanticLossless(diffs);
          for (var index2, index1 = 0, y = 0; y < patches[x].diffs.length; y++) {
            var mod = patches[x].diffs[y];
            0 !== mod[0] && (index2 = this.diff_xIndex(diffs, index1)), 1 === mod[0] ? text = text.substring(0, start_loc + index2) + mod[1] + text.substring(start_loc + index2) : -1 === mod[0] && (text = text.substring(0, start_loc + index2) + text.substring(start_loc + this.diff_xIndex(diffs, index1 + mod[1].length))), -1 !== mod[0] && (index1 += mod[1].length);
          }
        }
      }
    }
    return [text = text.substring(nullPadding.length, text.length - nullPadding.length), results];
  }, diff_match_patch.prototype.patch_addPadding = function(patches) {
    for (var paddingLength = this.Patch_Margin, nullPadding = "", x = 1; x <= paddingLength; x++) nullPadding += String.fromCharCode(x);
    for (x = 0; x < patches.length; x++) patches[x].start1 += paddingLength, patches[x].start2 += paddingLength;
    var patch = patches[0], diffs = patch.diffs;
    if (0 == diffs.length || 0 != diffs[0][0]) diffs.unshift(new diff_match_patch.Diff(0, nullPadding)), patch.start1 -= paddingLength, patch.start2 -= paddingLength, patch.length1 += paddingLength, patch.length2 += paddingLength;
    else if (paddingLength > diffs[0][1].length) {
      var extraLength = paddingLength - diffs[0][1].length;
      diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1], patch.start1 -= extraLength, patch.start2 -= extraLength, patch.length1 += extraLength, patch.length2 += extraLength;
    }
    if (0 == (diffs = (patch = patches[patches.length - 1]).diffs).length || 0 != diffs[diffs.length - 1][0]) diffs.push(new diff_match_patch.Diff(0, nullPadding)), patch.length1 += paddingLength, patch.length2 += paddingLength;
    else if (paddingLength > diffs[diffs.length - 1][1].length) {
      extraLength = paddingLength - diffs[diffs.length - 1][1].length;
      diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength), patch.length1 += extraLength, patch.length2 += extraLength;
    }
    return nullPadding;
  }, diff_match_patch.prototype.patch_splitMax = function(patches) {
    for (var patch_size = this.Match_MaxBits, x = 0; x < patches.length; x++) if (!(patches[x].length1 <= patch_size)) {
      var bigpatch = patches[x];
      patches.splice(x--, 1);
      for (var start1 = bigpatch.start1, start2 = bigpatch.start2, precontext = ""; 0 !== bigpatch.diffs.length; ) {
        var patch = new diff_match_patch.patch_obj(), empty = true;
        for (patch.start1 = start1 - precontext.length, patch.start2 = start2 - precontext.length, "" !== precontext && (patch.length1 = patch.length2 = precontext.length, patch.diffs.push(new diff_match_patch.Diff(0, precontext))); 0 !== bigpatch.diffs.length && patch.length1 < patch_size - this.Patch_Margin; ) {
          var diff_type = bigpatch.diffs[0][0], diff_text = bigpatch.diffs[0][1];
          1 === diff_type ? (patch.length2 += diff_text.length, start2 += diff_text.length, patch.diffs.push(bigpatch.diffs.shift()), empty = false) : -1 === diff_type && 1 == patch.diffs.length && 0 == patch.diffs[0][0] && diff_text.length > 2 * patch_size ? (patch.length1 += diff_text.length, start1 += diff_text.length, empty = false, patch.diffs.push(new diff_match_patch.Diff(diff_type, diff_text)), bigpatch.diffs.shift()) : (diff_text = diff_text.substring(0, patch_size - patch.length1 - this.Patch_Margin), patch.length1 += diff_text.length, start1 += diff_text.length, 0 === diff_type ? (patch.length2 += diff_text.length, start2 += diff_text.length) : empty = false, patch.diffs.push(new diff_match_patch.Diff(diff_type, diff_text)), diff_text == bigpatch.diffs[0][1] ? bigpatch.diffs.shift() : bigpatch.diffs[0][1] = bigpatch.diffs[0][1].substring(diff_text.length));
        }
        precontext = (precontext = this.diff_text2(patch.diffs)).substring(precontext.length - this.Patch_Margin);
        var postcontext = this.diff_text1(bigpatch.diffs).substring(0, this.Patch_Margin);
        "" !== postcontext && (patch.length1 += postcontext.length, patch.length2 += postcontext.length, 0 !== patch.diffs.length && 0 === patch.diffs[patch.diffs.length - 1][0] ? patch.diffs[patch.diffs.length - 1][1] += postcontext : patch.diffs.push(new diff_match_patch.Diff(0, postcontext))), empty || patches.splice(++x, 0, patch);
      }
    }
  }, diff_match_patch.prototype.patch_toText = function(patches) {
    for (var text = [], x = 0; x < patches.length; x++) text[x] = patches[x];
    return text.join("");
  }, diff_match_patch.prototype.patch_fromText = function(textline) {
    var patches = [];
    if (!textline) return patches;
    for (var text = textline.split("\n"), textPointer = 0, patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/; textPointer < text.length; ) {
      var m = text[textPointer].match(patchHeader);
      if (!m) throw new Error("Invalid patch string: " + text[textPointer]);
      var patch = new diff_match_patch.patch_obj();
      for (patches.push(patch), patch.start1 = parseInt(m[1], 10), "" === m[2] ? (patch.start1--, patch.length1 = 1) : "0" == m[2] ? patch.length1 = 0 : (patch.start1--, patch.length1 = parseInt(m[2], 10)), patch.start2 = parseInt(m[3], 10), "" === m[4] ? (patch.start2--, patch.length2 = 1) : "0" == m[4] ? patch.length2 = 0 : (patch.start2--, patch.length2 = parseInt(m[4], 10)), textPointer++; textPointer < text.length; ) {
        var sign = text[textPointer].charAt(0);
        try {
          var line = decodeURI(text[textPointer].substring(1));
        } catch (ex) {
          throw new Error("Illegal escape in patch_fromText: " + line);
        }
        if ("-" == sign) patch.diffs.push(new diff_match_patch.Diff(-1, line));
        else if ("+" == sign) patch.diffs.push(new diff_match_patch.Diff(1, line));
        else if (" " == sign) patch.diffs.push(new diff_match_patch.Diff(0, line));
        else {
          if ("@" == sign) break;
          if ("" !== sign) throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
        }
        textPointer++;
      }
    }
    return patches;
  }, (diff_match_patch.patch_obj = function() {
    this.diffs = [], this.start1 = null, this.start2 = null, this.length1 = 0, this.length2 = 0;
  }).prototype.toString = function() {
    for (var op, text = ["@@ -" + (0 === this.length1 ? this.start1 + ",0" : 1 == this.length1 ? this.start1 + 1 : this.start1 + 1 + "," + this.length1) + " +" + (0 === this.length2 ? this.start2 + ",0" : 1 == this.length2 ? this.start2 + 1 : this.start2 + 1 + "," + this.length2) + " @@\n"], x = 0; x < this.diffs.length; x++) {
      switch (this.diffs[x][0]) {
        case 1:
          op = "+";
          break;
        case -1:
          op = "-";
          break;
        case 0:
          op = " ";
      }
      text[x + 1] = op + encodeURI(this.diffs[x][1]) + "\n";
    }
    return text.join("").replace(/%20/g, " ");
  }, module2.exports = diff_match_patch, module2.exports.diff_match_patch = diff_match_patch, module2.exports.DIFF_DELETE = -1, module2.exports.DIFF_INSERT = 1, module2.exports.DIFF_EQUAL = 0;
});
var DIFF_EQUAL = diffMatchPatch.DIFF_EQUAL;
var DIFF_DELETE = diffMatchPatch.DIFF_DELETE;
var DIFF_INSERT = diffMatchPatch.DIFF_INSERT;
function findChangeBlocks(changes) {
  var start = findIndex_1(changes, function(change) {
    return !isNormal(change);
  });
  if (-1 === start) return [];
  var end = findIndex_1(changes, function(change) {
    return !!isNormal(change);
  }, start);
  return -1 === end ? [changes.slice(start)] : [changes.slice(start, end)].concat(_toConsumableArray(findChangeBlocks(changes.slice(end))));
}
function splitDiffToLines(diffs) {
  return diffs.reduce(function(lines, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 2), type = _ref4[0], _currentLines$map2 = _toArray(_ref4[1].split("\n").map(function(line) {
      return [type, line];
    })), currentLineRemaining = _currentLines$map2[0], nextLines = _currentLines$map2.slice(1);
    return [].concat(_toConsumableArray(lines.slice(0, -1)), [[].concat(_toConsumableArray(lines[lines.length - 1]), [currentLineRemaining])], _toConsumableArray(nextLines.map(function(line) {
      return [line];
    })));
  }, [[]]);
}
function diffsToEdits(diffs, lineNumber) {
  return diffs.reduce(function(output, diff2) {
    var _output = _slicedToArray(output, 2), edits = _output[0], start = _output[1], _diff2 = _slicedToArray(diff2, 2), type = _diff2[0], value = _diff2[1];
    if (type !== DIFF_EQUAL) {
      var edit = { type: "edit", lineNumber, start, length: value.length };
      edits.push(edit);
    }
    return [edits, start + value.length];
  }, [[], 0])[0];
}
function convertToLinesOfEdits(linesOfDiffs, startLineNumber) {
  return flatMap_1(linesOfDiffs, function(diffs, i) {
    return diffsToEdits(diffs, startLineNumber + i);
  });
}
function diffText(x, y) {
  var dmp = new diffMatchPatch(), diffs = dmp.diff_main(x, y);
  return dmp.diff_cleanupSemantic(diffs), diffs.length <= 1 ? [[], []] : function(diffs2) {
    return diffs2.reduce(function(_ref, diff2) {
      var _ref2 = _slicedToArray(_ref, 2), oldDiffs = _ref2[0], newDiffs = _ref2[1];
      switch (_slicedToArray(diff2, 1)[0]) {
        case DIFF_INSERT:
          newDiffs.push(diff2);
          break;
        case DIFF_DELETE:
          oldDiffs.push(diff2);
          break;
        default:
          oldDiffs.push(diff2), newDiffs.push(diff2);
      }
      return [oldDiffs, newDiffs];
    }, [[], []]);
  }(diffs);
}
function diffChangeBlock(changes) {
  var _changes$reduce = changes.reduce(function(_ref5, change) {
    var _ref6 = _slicedToArray(_ref5, 2), oldSource = _ref6[0], newSource = _ref6[1];
    return isDelete(change) ? [oldSource + (oldSource ? "\n" : "") + change.content, newSource] : [oldSource, newSource + (newSource ? "\n" : "") + change.content];
  }, ["", ""]), _changes$reduce2 = _slicedToArray(_changes$reduce, 2), _diffText2 = _slicedToArray(diffText(_changes$reduce2[0], _changes$reduce2[1]), 2), oldDiffs = _diffText2[0], newDiffs = _diffText2[1];
  if (0 === oldDiffs.length && 0 === newDiffs.length) return [[], []];
  var getLineNumber = function(change) {
    if (change && !isNormal(change)) return change.lineNumber;
  }, oldStartLineNumber = getLineNumber(changes.find(isDelete)), newStartLineNumber = getLineNumber(changes.find(isInsert));
  if (void 0 === oldStartLineNumber || void 0 === newStartLineNumber) throw new Error("Could not find start line number for edit");
  return [convertToLinesOfEdits(splitDiffToLines(oldDiffs), oldStartLineNumber), convertToLinesOfEdits(splitDiffToLines(newDiffs), newStartLineNumber)];
}
function diffByLine(changes) {
  var _changes$reduce3 = changes.reduce(function(_ref7, currentChange) {
    var _ref8 = _slicedToArray(_ref7, 3), oldEdits = _ref8[0], newEdits = _ref8[1], previousChange = _ref8[2];
    if (!previousChange || !isDelete(previousChange) || !isInsert(currentChange)) return [oldEdits, newEdits, currentChange];
    var _diffText4 = _slicedToArray(diffText(previousChange.content, currentChange.content), 2), oldDiffs = _diffText4[0], newDiffs = _diffText4[1];
    return [oldEdits.concat(diffsToEdits(oldDiffs, previousChange.lineNumber)), newEdits.concat(diffsToEdits(newDiffs, currentChange.lineNumber)), currentChange];
  }, [[], [], null]), _changes$reduce4 = _slicedToArray(_changes$reduce3, 2);
  return [_changes$reduce4[0], _changes$reduce4[1]];
}
function markEdits(hunks) {
  var _ref9$type = (arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}).type, findEdits = "block" === (void 0 === _ref9$type ? "block" : _ref9$type) ? diffChangeBlock : diffByLine, _changeBlocks$map$red = flatMap_1(hunks.map(function(hunk) {
    return hunk.changes;
  }), findChangeBlocks).map(findEdits).reduce(function(_ref10, _ref11) {
    var _ref12 = _slicedToArray(_ref10, 2), oldEdits2 = _ref12[0], newEdits2 = _ref12[1], _ref13 = _slicedToArray(_ref11, 2), currentOld = _ref13[0], currentNew = _ref13[1];
    return [oldEdits2.concat(currentOld), newEdits2.concat(currentNew)];
  }, [[], []]), _changeBlocks$map$red2 = _slicedToArray(_changeBlocks$map$red, 2), oldEdits = _changeBlocks$map$red2[0], newEdits = _changeBlocks$map$red2[1];
  return pickRanges(flatten_1(oldEdits), flatten_1(newEdits));
}
var _excluded$2 = ["enhancers"];
var tokenize = function(hunks) {
  var pair, _ref = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, _ref$enhancers = _ref.enhancers, enhancers = void 0 === _ref$enhancers ? [] : _ref$enhancers, _toTokenTrees2 = _slicedToArray(toTokenTrees(hunks, _objectWithoutProperties(_ref, _excluded$2)), 2), oldTokenTree = _toTokenTrees2[0], newTokenTree = _toTokenTrees2[1], _ref2 = [normalizeToLines(oldTokenTree), normalizeToLines(newTokenTree)], _enhance = (pair = [_ref2[0], _ref2[1]], enhancers.reduce(function(input, enhance) {
    return enhance(input);
  }, pair)), _enhance2 = _slicedToArray(_enhance, 2), oldEnhanced = _enhance2[0], newEnhanced = _enhance2[1], _ref3 = [oldEnhanced.map(backToTree), newEnhanced.map(backToTree)], newTrees = _ref3[1];
  return { old: _ref3[0].map(function(root) {
    var _root$children;
    return null !== (_root$children = root.children) && void 0 !== _root$children ? _root$children : [];
  }), new: newTrees.map(function(root) {
    var _root$children2;
    return null !== (_root$children2 = root.children) && void 0 !== _root$children2 ? _root$children2 : [];
  }) };
};
var current2;
var uid = (current2 = 0, function() {
  return current2 += 1;
});

// node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/base.js
var Diff2 = class {
  diff(oldStr, newStr, options = {}) {
    let callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    } else if ("callback" in options) {
      callback = options.callback;
    }
    const oldString = this.castInput(oldStr, options);
    const newString = this.castInput(newStr, options);
    const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
    const newTokens = this.removeEmpty(this.tokenize(newString, options));
    return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
  }
  diffWithOptionsObj(oldTokens, newTokens, options, callback) {
    var _a;
    const done = (value) => {
      value = this.postProcess(value, options);
      if (callback) {
        setTimeout(function() {
          callback(value);
        }, 0);
        return void 0;
      } else {
        return value;
      }
    };
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;
    if (options.maxEditLength != null) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    const maxExecutionTime = (_a = options.timeout) !== null && _a !== void 0 ? _a : Infinity;
    const abortAfterTimestamp = Date.now() + maxExecutionTime;
    const bestPath = [{ oldPos: -1, lastComponent: void 0 }];
    let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
    if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
      return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
    }
    let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
    const execEditLength = () => {
      for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
        let basePath;
        const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
        if (removePath) {
          bestPath[diagonalPath - 1] = void 0;
        }
        let canAdd = false;
        if (addPath) {
          const addPathNewPos = addPath.oldPos - diagonalPath;
          canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
        }
        const canRemove = removePath && removePath.oldPos + 1 < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = void 0;
          continue;
        }
        if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) {
          basePath = this.addToPath(addPath, true, false, 0, options);
        } else {
          basePath = this.addToPath(removePath, false, true, 1, options);
        }
        newPos = this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
        if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
          return done(this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
        } else {
          bestPath[diagonalPath] = basePath;
          if (basePath.oldPos + 1 >= oldLen) {
            maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
          }
          if (newPos + 1 >= newLen) {
            minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
          }
        }
      }
      editLength++;
    };
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) {
            return callback(void 0);
          }
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
        const ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  }
  addToPath(path, added, removed, oldPosInc, options) {
    const last = path.lastComponent;
    if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: last.count + 1, added, removed, previousComponent: last.previousComponent }
      };
    } else {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: 1, added, removed, previousComponent: last }
      };
    }
  }
  extractCommon(basePath, newTokens, oldTokens, diagonalPath, options) {
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
      newPos++;
      oldPos++;
      commonCount++;
      if (options.oneChangePerToken) {
        basePath.lastComponent = { count: 1, previousComponent: basePath.lastComponent, added: false, removed: false };
      }
    }
    if (commonCount && !options.oneChangePerToken) {
      basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent, added: false, removed: false };
    }
    basePath.oldPos = oldPos;
    return newPos;
  }
  equals(left, right, options) {
    if (options.comparator) {
      return options.comparator(left, right);
    } else {
      return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  }
  removeEmpty(array) {
    const ret = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  castInput(value, options) {
    return value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tokenize(value, options) {
    return Array.from(value);
  }
  join(chars) {
    return chars.join("");
  }
  postProcess(changeObjects, options) {
    return changeObjects;
  }
  get useLongestToken() {
    return false;
  }
  buildValues(lastComponent, newTokens, oldTokens) {
    const components = [];
    let nextComponent;
    while (lastComponent) {
      components.push(lastComponent);
      nextComponent = lastComponent.previousComponent;
      delete lastComponent.previousComponent;
      lastComponent = nextComponent;
    }
    components.reverse();
    const componentLen = components.length;
    let componentPos = 0, newPos = 0, oldPos = 0;
    for (; componentPos < componentLen; componentPos++) {
      const component = components[componentPos];
      if (!component.removed) {
        if (!component.added && this.useLongestToken) {
          let value = newTokens.slice(newPos, newPos + component.count);
          value = value.map(function(value2, i) {
            const oldValue = oldTokens[oldPos + i];
            return oldValue.length > value2.length ? oldValue : value2;
          });
          component.value = this.join(value);
        } else {
          component.value = this.join(newTokens.slice(newPos, newPos + component.count));
        }
        newPos += component.count;
        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
        oldPos += component.count;
      }
    }
    return components;
  }
};

// node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/line.js
var LineDiff = class extends Diff2 {
  constructor() {
    super(...arguments);
    this.tokenize = tokenize2;
  }
  equals(left, right, options) {
    if (options.ignoreWhitespace) {
      if (!options.newlineIsToken || !left.includes("\n")) {
        left = left.trim();
      }
      if (!options.newlineIsToken || !right.includes("\n")) {
        right = right.trim();
      }
    } else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
      if (left.endsWith("\n")) {
        left = left.slice(0, -1);
      }
      if (right.endsWith("\n")) {
        right = right.slice(0, -1);
      }
    }
    return super.equals(left, right, options);
  }
};
var lineDiff = new LineDiff();
function diffLines(oldStr, newStr, options) {
  return lineDiff.diff(oldStr, newStr, options);
}
function tokenize2(value, options) {
  if (options.stripTrailingCr) {
    value = value.replace(/\r\n/g, "\n");
  }
  const retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  }
  for (let i = 0; i < linesAndNewlines.length; i++) {
    const line = linesAndNewlines[i];
    if (i % 2 && !options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      retLines.push(line);
    }
  }
  return retLines;
}

// node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/patch/create.js
function needsQuoting(s2) {
  for (let i = 0; i < s2.length; i++) {
    if (s2[i] < " " || s2[i] > "~" || s2[i] === '"' || s2[i] === "\\") {
      return true;
    }
  }
  return false;
}
function quoteFileNameIfNeeded(s2) {
  if (!needsQuoting(s2)) {
    return s2;
  }
  let result = '"';
  const bytes = new TextEncoder().encode(s2);
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b === 7) {
      result += "\\a";
    } else if (b === 8) {
      result += "\\b";
    } else if (b === 9) {
      result += "\\t";
    } else if (b === 10) {
      result += "\\n";
    } else if (b === 11) {
      result += "\\v";
    } else if (b === 12) {
      result += "\\f";
    } else if (b === 13) {
      result += "\\r";
    } else if (b === 34) {
      result += '\\"';
    } else if (b === 92) {
      result += "\\\\";
    } else if (b >= 32 && b <= 126) {
      result += String.fromCharCode(b);
    } else {
      result += "\\" + b.toString(8).padStart(3, "0");
    }
    i++;
  }
  result += '"';
  return result;
}
var INCLUDE_HEADERS = {
  includeIndex: true,
  includeUnderline: true,
  includeFileHeaders: true
};
function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  let optionsObj;
  if (!options) {
    optionsObj = {};
  } else if (typeof options === "function") {
    optionsObj = { callback: options };
  } else {
    optionsObj = options;
  }
  if (typeof optionsObj.context === "undefined") {
    optionsObj.context = 4;
  }
  const context = optionsObj.context;
  if (optionsObj.newlineIsToken) {
    throw new Error("newlineIsToken may not be used with patch-generation functions, only with diffing functions");
  }
  if (!optionsObj.callback) {
    return diffLinesResultToPatch(diffLines(oldStr, newStr, optionsObj));
  } else {
    const { callback } = optionsObj;
    diffLines(oldStr, newStr, Object.assign(Object.assign({}, optionsObj), { callback: (diff2) => {
      const patch = diffLinesResultToPatch(diff2);
      callback(patch);
    } }));
  }
  function diffLinesResultToPatch(diff2) {
    if (!diff2) {
      return;
    }
    diff2.push({ value: "", lines: [] });
    function contextLines(lines) {
      return lines.map(function(entry) {
        return " " + entry;
      });
    }
    const hunks = [];
    let oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
    for (let i = 0; i < diff2.length; i++) {
      const current3 = diff2[i], lines = current3.lines || splitLines(current3.value);
      current3.lines = lines;
      if (current3.added || current3.removed) {
        if (!oldRangeStart) {
          const prev = diff2[i - 1];
          oldRangeStart = oldLine;
          newRangeStart = newLine;
          if (prev) {
            curRange = context > 0 ? contextLines(prev.lines.slice(-context)) : [];
            oldRangeStart -= curRange.length;
            newRangeStart -= curRange.length;
          }
        }
        for (const line of lines) {
          curRange.push((current3.added ? "+" : "-") + line);
        }
        if (current3.added) {
          newLine += lines.length;
        } else {
          oldLine += lines.length;
        }
      } else {
        if (oldRangeStart) {
          if (lines.length <= context * 2 && i < diff2.length - 2) {
            for (const line of contextLines(lines)) {
              curRange.push(line);
            }
          } else {
            const contextSize = Math.min(lines.length, context);
            for (const line of contextLines(lines.slice(0, contextSize))) {
              curRange.push(line);
            }
            const hunk = {
              oldStart: oldRangeStart,
              oldLines: oldLine - oldRangeStart + contextSize,
              newStart: newRangeStart,
              newLines: newLine - newRangeStart + contextSize,
              lines: curRange
            };
            hunks.push(hunk);
            oldRangeStart = 0;
            newRangeStart = 0;
            curRange = [];
          }
        }
        oldLine += lines.length;
        newLine += lines.length;
      }
    }
    for (const hunk of hunks) {
      for (let i = 0; i < hunk.lines.length; i++) {
        if (hunk.lines[i].endsWith("\n")) {
          hunk.lines[i] = hunk.lines[i].slice(0, -1);
        } else {
          hunk.lines.splice(i + 1, 0, "\\ No newline at end of file");
          i++;
        }
      }
    }
    return {
      oldFileName,
      newFileName,
      oldHeader,
      newHeader,
      hunks
    };
  }
}
function formatPatch(patch, headerOptions) {
  var _a, _b, _c, _d, _e, _f;
  if (!headerOptions) {
    headerOptions = INCLUDE_HEADERS;
  }
  if (Array.isArray(patch)) {
    if (patch.length > 1 && !headerOptions.includeFileHeaders && !patch.every((p) => p.isGit)) {
      throw new Error("Cannot omit file headers on a multi-file patch. (The result would be unparseable; how would a tool trying to apply the patch know which changes are to which file?)");
    }
    return patch.map((p) => formatPatch(p, headerOptions)).join("\n");
  }
  const ret = [];
  if (patch.isGit) {
    headerOptions = INCLUDE_HEADERS;
    if (!patch.oldFileName) {
      throw new Error("oldFileName must be specified for Git patches");
    }
    if (!patch.newFileName) {
      throw new Error("newFileName must be specified for Git patches");
    }
    let gitOldName = patch.oldFileName;
    let gitNewName = patch.newFileName;
    if (patch.isCreate && gitOldName === "/dev/null") {
      gitOldName = gitNewName.replace(/^b\//, "a/");
    } else if (patch.isDelete && gitNewName === "/dev/null") {
      gitNewName = gitOldName.replace(/^a\//, "b/");
    }
    ret.push("diff --git " + quoteFileNameIfNeeded(gitOldName) + " " + quoteFileNameIfNeeded(gitNewName));
    if (patch.isDelete) {
      ret.push("deleted file mode " + ((_a = patch.oldMode) !== null && _a !== void 0 ? _a : "100644"));
    }
    if (patch.isCreate) {
      ret.push("new file mode " + ((_b = patch.newMode) !== null && _b !== void 0 ? _b : "100644"));
    }
    if (patch.oldMode && patch.newMode && !patch.isDelete && !patch.isCreate) {
      ret.push("old mode " + patch.oldMode);
      ret.push("new mode " + patch.newMode);
    }
    if (patch.isRename) {
      ret.push("rename from " + quoteFileNameIfNeeded(((_c = patch.oldFileName) !== null && _c !== void 0 ? _c : "").replace(/^a\//, "")));
      ret.push("rename to " + quoteFileNameIfNeeded(((_d = patch.newFileName) !== null && _d !== void 0 ? _d : "").replace(/^b\//, "")));
    }
    if (patch.isCopy) {
      ret.push("copy from " + quoteFileNameIfNeeded(((_e = patch.oldFileName) !== null && _e !== void 0 ? _e : "").replace(/^a\//, "")));
      ret.push("copy to " + quoteFileNameIfNeeded(((_f = patch.newFileName) !== null && _f !== void 0 ? _f : "").replace(/^b\//, "")));
    }
  } else {
    if (headerOptions.includeIndex && patch.oldFileName == patch.newFileName && patch.oldFileName !== void 0) {
      ret.push("Index: " + patch.oldFileName);
    }
    if (headerOptions.includeUnderline) {
      ret.push("===================================================================");
    }
  }
  const hasHunks = patch.hunks.length > 0;
  if (headerOptions.includeFileHeaders && patch.oldFileName !== void 0 && patch.newFileName !== void 0 && (!patch.isGit || hasHunks)) {
    ret.push("--- " + quoteFileNameIfNeeded(patch.oldFileName) + (patch.oldHeader ? "	" + patch.oldHeader : ""));
    ret.push("+++ " + quoteFileNameIfNeeded(patch.newFileName) + (patch.newHeader ? "	" + patch.newHeader : ""));
  }
  for (let i = 0; i < patch.hunks.length; i++) {
    const hunk = patch.hunks[i];
    const oldStart = hunk.oldLines === 0 ? hunk.oldStart - 1 : hunk.oldStart;
    const newStart = hunk.newLines === 0 ? hunk.newStart - 1 : hunk.newStart;
    ret.push("@@ -" + oldStart + "," + hunk.oldLines + " +" + newStart + "," + hunk.newLines + " @@");
    for (const line of hunk.lines) {
      ret.push(line);
    }
  }
  return ret.join("\n") + "\n";
}
function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  if (typeof options === "function") {
    options = { callback: options };
  }
  if (!(options === null || options === void 0 ? void 0 : options.callback)) {
    const patchObj = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);
    if (!patchObj) {
      return;
    }
    return formatPatch(patchObj, options === null || options === void 0 ? void 0 : options.headerOptions);
  } else {
    const { callback } = options;
    structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, Object.assign(Object.assign({}, options), { callback: (patchObj) => {
      if (!patchObj) {
        callback(void 0);
      } else {
        callback(formatPatch(patchObj, options.headerOptions));
      }
    } }));
  }
}
function splitLines(text) {
  const hasTrailingNl = text.endsWith("\n");
  const result = text.split("\n").map((line) => line + "\n");
  if (hasTrailingNl) {
    result.pop();
  } else {
    result.push(result.pop().slice(0, -1));
  }
  return result;
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/util/schema.js
var Schema = class {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(property2, normal, space) {
    this.normal = normal;
    this.property = property2;
    if (space) {
      this.space = space;
    }
  }
};
Schema.prototype.normal = {};
Schema.prototype.property = {};
Schema.prototype.space = void 0;

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/util/merge.js
function merge(definitions, space) {
  const property2 = {};
  const normal = {};
  for (const definition of definitions) {
    Object.assign(property2, definition.property);
    Object.assign(normal, definition.normal);
  }
  return new Schema(property2, normal, space);
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/normalize.js
function normalize(value) {
  return value.toLowerCase();
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/util/info.js
var Info = class {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(property2, attribute) {
    this.attribute = attribute;
    this.property = property2;
  }
};
Info.prototype.attribute = "";
Info.prototype.booleanish = false;
Info.prototype.boolean = false;
Info.prototype.commaOrSpaceSeparated = false;
Info.prototype.commaSeparated = false;
Info.prototype.defined = false;
Info.prototype.mustUseProperty = false;
Info.prototype.number = false;
Info.prototype.overloadedBoolean = false;
Info.prototype.property = "";
Info.prototype.spaceSeparated = false;
Info.prototype.space = void 0;

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/util/types.js
var types_exports = {};
__export(types_exports, {
  boolean: () => boolean,
  booleanish: () => booleanish,
  commaOrSpaceSeparated: () => commaOrSpaceSeparated,
  commaSeparated: () => commaSeparated,
  number: () => number,
  overloadedBoolean: () => overloadedBoolean,
  spaceSeparated: () => spaceSeparated
});
var powers = 0;
var boolean = increment();
var booleanish = increment();
var overloadedBoolean = increment();
var number = increment();
var spaceSeparated = increment();
var commaSeparated = increment();
var commaOrSpaceSeparated = increment();
function increment() {
  return 2 ** ++powers;
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/util/defined-info.js
var checks = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(types_exports)
);
var DefinedInfo = class extends Info {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(property2, attribute, mask, space) {
    let index2 = -1;
    super(property2, attribute);
    mark(this, "space", space);
    if (typeof mask === "number") {
      while (++index2 < checks.length) {
        const check = checks[index2];
        mark(this, checks[index2], (mask & types_exports[check]) === types_exports[check]);
      }
    }
  }
};
DefinedInfo.prototype.defined = true;
function mark(values, key, value) {
  if (value) {
    values[key] = value;
  }
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/util/create.js
function create(definition) {
  const properties = {};
  const normals = {};
  for (const [property2, value] of Object.entries(definition.properties)) {
    const info = new DefinedInfo(
      property2,
      definition.transform(definition.attributes || {}, property2),
      value,
      definition.space
    );
    if (definition.mustUseProperty && definition.mustUseProperty.includes(property2)) {
      info.mustUseProperty = true;
    }
    properties[property2] = info;
    normals[normalize(property2)] = property2;
    normals[normalize(info.attribute)] = property2;
  }
  return new Schema(properties, normals, definition.space);
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/aria.js
var aria = create({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: booleanish,
    ariaAutoComplete: null,
    ariaBusy: booleanish,
    ariaChecked: booleanish,
    ariaColCount: number,
    ariaColIndex: number,
    ariaColSpan: number,
    ariaControls: spaceSeparated,
    ariaCurrent: null,
    ariaDescribedBy: spaceSeparated,
    ariaDetails: null,
    ariaDisabled: booleanish,
    ariaDropEffect: spaceSeparated,
    ariaErrorMessage: null,
    ariaExpanded: booleanish,
    ariaFlowTo: spaceSeparated,
    ariaGrabbed: booleanish,
    ariaHasPopup: null,
    ariaHidden: booleanish,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: spaceSeparated,
    ariaLevel: number,
    ariaLive: null,
    ariaModal: booleanish,
    ariaMultiLine: booleanish,
    ariaMultiSelectable: booleanish,
    ariaOrientation: null,
    ariaOwns: spaceSeparated,
    ariaPlaceholder: null,
    ariaPosInSet: number,
    ariaPressed: booleanish,
    ariaReadOnly: booleanish,
    ariaRelevant: null,
    ariaRequired: booleanish,
    ariaRoleDescription: spaceSeparated,
    ariaRowCount: number,
    ariaRowIndex: number,
    ariaRowSpan: number,
    ariaSelected: booleanish,
    ariaSetSize: number,
    ariaSort: null,
    ariaValueMax: number,
    ariaValueMin: number,
    ariaValueNow: number,
    ariaValueText: null,
    role: null
  },
  transform(_2, property2) {
    return property2 === "role" ? property2 : "aria-" + property2.slice(4).toLowerCase();
  }
});

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/util/case-sensitive-transform.js
function caseSensitiveTransform(attributes2, attribute) {
  return attribute in attributes2 ? attributes2[attribute] : attribute;
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/util/case-insensitive-transform.js
function caseInsensitiveTransform(attributes2, property2) {
  return caseSensitiveTransform(attributes2, property2.toLowerCase());
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/html.js
var html = create({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: commaSeparated,
    acceptCharset: spaceSeparated,
    accessKey: spaceSeparated,
    action: null,
    allow: null,
    allowFullScreen: boolean,
    allowPaymentRequest: boolean,
    allowUserMedia: boolean,
    alpha: boolean,
    alt: null,
    as: null,
    async: boolean,
    autoCapitalize: null,
    autoComplete: spaceSeparated,
    autoFocus: boolean,
    autoPlay: boolean,
    blocking: spaceSeparated,
    capture: null,
    charSet: null,
    checked: boolean,
    cite: null,
    className: spaceSeparated,
    closedBy: null,
    colorSpace: null,
    cols: number,
    colSpan: number,
    command: null,
    commandFor: null,
    content: null,
    contentEditable: booleanish,
    controls: boolean,
    controlsList: spaceSeparated,
    coords: number | commaSeparated,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: boolean,
    defer: boolean,
    dir: null,
    dirName: null,
    disabled: boolean,
    download: overloadedBoolean,
    draggable: booleanish,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: boolean,
    formTarget: null,
    headers: spaceSeparated,
    height: number,
    hidden: overloadedBoolean,
    high: number,
    href: null,
    hrefLang: null,
    htmlFor: spaceSeparated,
    httpEquiv: spaceSeparated,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: boolean,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: boolean,
    itemId: null,
    itemProp: spaceSeparated,
    itemRef: spaceSeparated,
    itemScope: boolean,
    itemType: spaceSeparated,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: boolean,
    low: number,
    manifest: null,
    max: null,
    maxLength: number,
    media: null,
    method: null,
    min: null,
    minLength: number,
    multiple: boolean,
    muted: boolean,
    name: null,
    nonce: null,
    noModule: boolean,
    noValidate: boolean,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: boolean,
    optimum: number,
    pattern: null,
    ping: spaceSeparated,
    placeholder: null,
    playsInline: boolean,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: boolean,
    referrerPolicy: null,
    rel: spaceSeparated,
    required: boolean,
    reversed: boolean,
    rows: number,
    rowSpan: number,
    sandbox: spaceSeparated,
    scope: null,
    scoped: boolean,
    seamless: boolean,
    selected: boolean,
    shadowRootClonable: boolean,
    shadowRootCustomElementRegistry: boolean,
    shadowRootDelegatesFocus: boolean,
    shadowRootMode: null,
    shadowRootSerializable: boolean,
    shape: null,
    size: number,
    sizes: null,
    slot: null,
    span: number,
    spellCheck: booleanish,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: number,
    step: null,
    style: null,
    tabIndex: number,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: boolean,
    useMap: null,
    value: booleanish,
    width: number,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: spaceSeparated,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: number,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: number,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: boolean,
    // Lists. Use CSS to reduce space between items instead
    declare: boolean,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: number,
    // `<img>` and `<object>`
    leftMargin: number,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: number,
    // `<body>`
    marginWidth: number,
    // `<body>`
    noResize: boolean,
    // `<frame>`
    noHref: boolean,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: boolean,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: boolean,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: number,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: booleanish,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: number,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: number,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    credentialless: boolean,
    disablePictureInPicture: boolean,
    disableRemotePlayback: boolean,
    exportParts: commaSeparated,
    part: spaceSeparated,
    prefix: null,
    property: null,
    results: number,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: caseInsensitiveTransform
});

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/svg.js
var svg = create({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    maskType: "mask-type",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: commaOrSpaceSeparated,
    accentHeight: number,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: number,
    amplitude: number,
    arabicForm: null,
    ascent: number,
    attributeName: null,
    attributeType: null,
    azimuth: number,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: number,
    by: null,
    calcMode: null,
    capHeight: number,
    className: spaceSeparated,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: number,
    diffuseConstant: number,
    direction: null,
    display: null,
    dur: null,
    divisor: number,
    dominantBaseline: null,
    download: boolean,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: number,
    enableBackground: null,
    end: null,
    event: null,
    exponent: number,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: number,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: commaSeparated,
    g2: commaSeparated,
    glyphName: commaSeparated,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: number,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: number,
    horizOriginX: number,
    horizOriginY: number,
    id: null,
    ideographic: number,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: number,
    k: number,
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    kernelMatrix: commaOrSpaceSeparated,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: number,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskType: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: number,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: number,
    overlineThickness: number,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: number,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: spaceSeparated,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: number,
    pointsAtY: number,
    pointsAtZ: number,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: commaOrSpaceSeparated,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: commaOrSpaceSeparated,
    rev: commaOrSpaceSeparated,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: commaOrSpaceSeparated,
    requiredFeatures: commaOrSpaceSeparated,
    requiredFonts: commaOrSpaceSeparated,
    requiredFormats: commaOrSpaceSeparated,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: number,
    specularExponent: number,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: number,
    strikethroughThickness: number,
    string: null,
    stroke: null,
    strokeDashArray: commaOrSpaceSeparated,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: number,
    strokeOpacity: number,
    strokeWidth: null,
    style: null,
    surfaceScale: number,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: commaOrSpaceSeparated,
    tabIndex: number,
    tableValues: null,
    target: null,
    targetX: number,
    targetY: number,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: commaOrSpaceSeparated,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: number,
    underlineThickness: number,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: number,
    values: null,
    vAlphabetic: number,
    vMathematical: number,
    vectorEffect: null,
    vHanging: number,
    vIdeographic: number,
    version: null,
    vertAdvY: number,
    vertOriginX: number,
    vertOriginY: number,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: number,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: caseSensitiveTransform
});

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/xlink.js
var xlink = create({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(_2, property2) {
    return "xlink:" + property2.slice(5).toLowerCase();
  }
});

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/xmlns.js
var xmlns = create({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: caseInsensitiveTransform
});

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/xml.js
var xml = create({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(_2, property2) {
    return "xml:" + property2.slice(3).toLowerCase();
  }
});

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/lib/find.js
var cap = /[A-Z]/g;
var dash = /-[a-z]/g;
var valid = /^data[-\w.:]+$/i;
function find(schema, value) {
  const normal = normalize(value);
  let property2 = value;
  let Type = Info;
  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]];
  }
  if (normal.length > 4 && normal.slice(0, 4) === "data" && valid.test(value)) {
    if (value.charAt(4) === "-") {
      const rest = value.slice(5).replace(dash, camelcase);
      property2 = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
    } else {
      const rest = value.slice(4);
      if (!dash.test(rest)) {
        let dashes = rest.replace(cap, kebab);
        if (dashes.charAt(0) !== "-") {
          dashes = "-" + dashes;
        }
        value = "data" + dashes;
      }
    }
    Type = DefinedInfo;
  }
  return new Type(property2, value);
}
function kebab($0) {
  return "-" + $0.toLowerCase();
}
function camelcase($0) {
  return $0.charAt(1).toUpperCase();
}

// node_modules/.pnpm/property-information@7.2.0/node_modules/property-information/index.js
var html2 = merge([aria, html, xlink, xmlns, xml], "html");
var svg2 = merge([aria, svg, xlink, xmlns, xml], "svg");

// node_modules/.pnpm/comma-separated-tokens@2.0.3/node_modules/comma-separated-tokens/index.js
function parse(value) {
  const tokens = [];
  const input = String(value || "");
  let index2 = input.indexOf(",");
  let start = 0;
  let end = false;
  while (!end) {
    if (index2 === -1) {
      index2 = input.length;
      end = true;
    }
    const token2 = input.slice(start, index2).trim();
    if (token2 || !end) {
      tokens.push(token2);
    }
    start = index2 + 1;
    index2 = input.indexOf(",", start);
  }
  return tokens;
}

// node_modules/.pnpm/hast-util-parse-selector@4.0.0/node_modules/hast-util-parse-selector/lib/index.js
var search = /[#.]/g;
function parseSelector(selector, defaultTagName) {
  const value = selector || "";
  const props = {};
  let start = 0;
  let previous;
  let tagName;
  while (start < value.length) {
    search.lastIndex = start;
    const match = search.exec(value);
    const subvalue = value.slice(start, match ? match.index : value.length);
    if (subvalue) {
      if (!previous) {
        tagName = subvalue;
      } else if (previous === "#") {
        props.id = subvalue;
      } else if (Array.isArray(props.className)) {
        props.className.push(subvalue);
      } else {
        props.className = [subvalue];
      }
      start += subvalue.length;
    }
    if (match) {
      previous = match[0];
      start++;
    }
  }
  return {
    type: "element",
    // @ts-expect-error: tag name is parsed.
    tagName: tagName || defaultTagName || "div",
    properties: props,
    children: []
  };
}

// node_modules/.pnpm/space-separated-tokens@2.0.2/node_modules/space-separated-tokens/index.js
function parse2(value) {
  const input = String(value || "").trim();
  return input ? input.split(/[ \t\n\r\f]+/g) : [];
}

// node_modules/.pnpm/hastscript@9.0.1/node_modules/hastscript/lib/create-h.js
function createH(schema, defaultTagName, caseSensitive) {
  const adjust = caseSensitive ? createAdjustMap(caseSensitive) : void 0;
  function h2(selector, properties, ...children) {
    let node;
    if (selector === null || selector === void 0) {
      node = { type: "root", children: [] };
      const child = (
        /** @type {Child} */
        properties
      );
      children.unshift(child);
    } else {
      node = parseSelector(selector, defaultTagName);
      const lower = node.tagName.toLowerCase();
      const adjusted = adjust ? adjust.get(lower) : void 0;
      node.tagName = adjusted || lower;
      if (isChild(properties)) {
        children.unshift(properties);
      } else {
        for (const [key, value] of Object.entries(properties)) {
          addProperty(schema, node.properties, key, value);
        }
      }
    }
    for (const child of children) {
      addChild(node.children, child);
    }
    if (node.type === "element" && node.tagName === "template") {
      node.content = { type: "root", children: node.children };
      node.children = [];
    }
    return node;
  }
  return h2;
}
function isChild(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return true;
  }
  if (typeof value.type !== "string") return false;
  const record = (
    /** @type {Record<string, unknown>} */
    value
  );
  const keys = Object.keys(value);
  for (const key of keys) {
    const value2 = record[key];
    if (value2 && typeof value2 === "object") {
      if (!Array.isArray(value2)) return true;
      const list = (
        /** @type {ReadonlyArray<unknown>} */
        value2
      );
      for (const item of list) {
        if (typeof item !== "number" && typeof item !== "string") {
          return true;
        }
      }
    }
  }
  if ("children" in value && Array.isArray(value.children)) {
    return true;
  }
  return false;
}
function addProperty(schema, properties, key, value) {
  const info = find(schema, key);
  let result;
  if (value === null || value === void 0) return;
  if (typeof value === "number") {
    if (Number.isNaN(value)) return;
    result = value;
  } else if (typeof value === "boolean") {
    result = value;
  } else if (typeof value === "string") {
    if (info.spaceSeparated) {
      result = parse2(value);
    } else if (info.commaSeparated) {
      result = parse(value);
    } else if (info.commaOrSpaceSeparated) {
      result = parse2(parse(value).join(" "));
    } else {
      result = parsePrimitive(info, info.property, value);
    }
  } else if (Array.isArray(value)) {
    result = [...value];
  } else {
    result = info.property === "style" ? style(value) : String(value);
  }
  if (Array.isArray(result)) {
    const finalResult = [];
    for (const item of result) {
      finalResult.push(
        /** @type {number | string} */
        parsePrimitive(info, info.property, item)
      );
    }
    result = finalResult;
  }
  if (info.property === "className" && Array.isArray(properties.className)) {
    result = properties.className.concat(
      /** @type {Array<number | string> | number | string} */
      result
    );
  }
  properties[info.property] = result;
}
function addChild(nodes, value) {
  if (value === null || value === void 0) {
  } else if (typeof value === "number" || typeof value === "string") {
    nodes.push({ type: "text", value: String(value) });
  } else if (Array.isArray(value)) {
    for (const child of value) {
      addChild(nodes, child);
    }
  } else if (typeof value === "object" && "type" in value) {
    if (value.type === "root") {
      addChild(nodes, value.children);
    } else {
      nodes.push(value);
    }
  } else {
    throw new Error("Expected node, nodes, or string, got `" + value + "`");
  }
}
function parsePrimitive(info, name2, value) {
  if (typeof value === "string") {
    if (info.number && value && !Number.isNaN(Number(value))) {
      return Number(value);
    }
    if ((info.boolean || info.overloadedBoolean) && (value === "" || normalize(value) === normalize(name2))) {
      return true;
    }
  }
  return value;
}
function style(styles) {
  const result = [];
  for (const [key, value] of Object.entries(styles)) {
    result.push([key, value].join(": "));
  }
  return result.join("; ");
}
function createAdjustMap(values) {
  const result = /* @__PURE__ */ new Map();
  for (const value of values) {
    result.set(value.toLowerCase(), value);
  }
  return result;
}

// node_modules/.pnpm/hastscript@9.0.1/node_modules/hastscript/lib/svg-case-sensitive-tag-names.js
var svgCaseSensitiveTagNames = [
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "clipPath",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "foreignObject",
  "glyphRef",
  "linearGradient",
  "radialGradient",
  "solidColor",
  "textArea",
  "textPath"
];

// node_modules/.pnpm/hastscript@9.0.1/node_modules/hastscript/lib/index.js
var h = createH(html2, "div");
var s = createH(svg2, "g", svgCaseSensitiveTagNames);

// node_modules/.pnpm/character-entities-legacy@3.0.0/node_modules/character-entities-legacy/index.js
var characterEntitiesLegacy = [
  "AElig",
  "AMP",
  "Aacute",
  "Acirc",
  "Agrave",
  "Aring",
  "Atilde",
  "Auml",
  "COPY",
  "Ccedil",
  "ETH",
  "Eacute",
  "Ecirc",
  "Egrave",
  "Euml",
  "GT",
  "Iacute",
  "Icirc",
  "Igrave",
  "Iuml",
  "LT",
  "Ntilde",
  "Oacute",
  "Ocirc",
  "Ograve",
  "Oslash",
  "Otilde",
  "Ouml",
  "QUOT",
  "REG",
  "THORN",
  "Uacute",
  "Ucirc",
  "Ugrave",
  "Uuml",
  "Yacute",
  "aacute",
  "acirc",
  "acute",
  "aelig",
  "agrave",
  "amp",
  "aring",
  "atilde",
  "auml",
  "brvbar",
  "ccedil",
  "cedil",
  "cent",
  "copy",
  "curren",
  "deg",
  "divide",
  "eacute",
  "ecirc",
  "egrave",
  "eth",
  "euml",
  "frac12",
  "frac14",
  "frac34",
  "gt",
  "iacute",
  "icirc",
  "iexcl",
  "igrave",
  "iquest",
  "iuml",
  "laquo",
  "lt",
  "macr",
  "micro",
  "middot",
  "nbsp",
  "not",
  "ntilde",
  "oacute",
  "ocirc",
  "ograve",
  "ordf",
  "ordm",
  "oslash",
  "otilde",
  "ouml",
  "para",
  "plusmn",
  "pound",
  "quot",
  "raquo",
  "reg",
  "sect",
  "shy",
  "sup1",
  "sup2",
  "sup3",
  "szlig",
  "thorn",
  "times",
  "uacute",
  "ucirc",
  "ugrave",
  "uml",
  "uuml",
  "yacute",
  "yen",
  "yuml"
];

// node_modules/.pnpm/character-reference-invalid@2.0.1/node_modules/character-reference-invalid/index.js
var characterReferenceInvalid = {
  0: "\uFFFD",
  128: "\u20AC",
  130: "\u201A",
  131: "\u0192",
  132: "\u201E",
  133: "\u2026",
  134: "\u2020",
  135: "\u2021",
  136: "\u02C6",
  137: "\u2030",
  138: "\u0160",
  139: "\u2039",
  140: "\u0152",
  142: "\u017D",
  145: "\u2018",
  146: "\u2019",
  147: "\u201C",
  148: "\u201D",
  149: "\u2022",
  150: "\u2013",
  151: "\u2014",
  152: "\u02DC",
  153: "\u2122",
  154: "\u0161",
  155: "\u203A",
  156: "\u0153",
  158: "\u017E",
  159: "\u0178"
};

// node_modules/.pnpm/is-decimal@2.0.1/node_modules/is-decimal/index.js
function isDecimal(character) {
  const code = typeof character === "string" ? character.charCodeAt(0) : character;
  return code >= 48 && code <= 57;
}

// node_modules/.pnpm/is-hexadecimal@2.0.1/node_modules/is-hexadecimal/index.js
function isHexadecimal(character) {
  const code = typeof character === "string" ? character.charCodeAt(0) : character;
  return code >= 97 && code <= 102 || code >= 65 && code <= 70 || code >= 48 && code <= 57;
}

// node_modules/.pnpm/is-alphabetical@2.0.1/node_modules/is-alphabetical/index.js
function isAlphabetical(character) {
  const code = typeof character === "string" ? character.charCodeAt(0) : character;
  return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}

// node_modules/.pnpm/is-alphanumerical@2.0.1/node_modules/is-alphanumerical/index.js
function isAlphanumerical(character) {
  return isAlphabetical(character) || isDecimal(character);
}

// node_modules/.pnpm/decode-named-character-reference@1.3.0/node_modules/decode-named-character-reference/index.dom.js
var element = document.createElement("i");
function decodeNamedCharacterReference(value) {
  const characterReference = "&" + value + ";";
  element.innerHTML = characterReference;
  const character = element.textContent;
  if (character.charCodeAt(character.length - 1) === 59 && value !== "semi") {
    return false;
  }
  return character === characterReference ? false : character;
}

// node_modules/.pnpm/parse-entities@4.0.2/node_modules/parse-entities/lib/index.js
var messages = [
  "",
  /* 1: Non terminated (named) */
  "Named character references must be terminated by a semicolon",
  /* 2: Non terminated (numeric) */
  "Numeric character references must be terminated by a semicolon",
  /* 3: Empty (named) */
  "Named character references cannot be empty",
  /* 4: Empty (numeric) */
  "Numeric character references cannot be empty",
  /* 5: Unknown (named) */
  "Named character references must be known",
  /* 6: Disallowed (numeric) */
  "Numeric character references cannot be disallowed",
  /* 7: Prohibited (numeric) */
  "Numeric character references cannot be outside the permissible Unicode range"
];
function parseEntities(value, options) {
  const settings = options || {};
  const additional = typeof settings.additional === "string" ? settings.additional.charCodeAt(0) : settings.additional;
  const result = [];
  let index2 = 0;
  let lines = -1;
  let queue = "";
  let point;
  let indent;
  if (settings.position) {
    if ("start" in settings.position || "indent" in settings.position) {
      indent = settings.position.indent;
      point = settings.position.start;
    } else {
      point = settings.position;
    }
  }
  let line = (point ? point.line : 0) || 1;
  let column = (point ? point.column : 0) || 1;
  let previous = now();
  let character;
  index2--;
  while (++index2 <= value.length) {
    if (character === 10) {
      column = (indent ? indent[lines] : 0) || 1;
    }
    character = value.charCodeAt(index2);
    if (character === 38) {
      const following = value.charCodeAt(index2 + 1);
      if (following === 9 || following === 10 || following === 12 || following === 32 || following === 38 || following === 60 || Number.isNaN(following) || additional && following === additional) {
        queue += String.fromCharCode(character);
        column++;
        continue;
      }
      const start = index2 + 1;
      let begin = start;
      let end = start;
      let type;
      if (following === 35) {
        end = ++begin;
        const following2 = value.charCodeAt(end);
        if (following2 === 88 || following2 === 120) {
          type = "hexadecimal";
          end = ++begin;
        } else {
          type = "decimal";
        }
      } else {
        type = "named";
      }
      let characterReferenceCharacters = "";
      let characterReference = "";
      let characters = "";
      const test = type === "named" ? isAlphanumerical : type === "decimal" ? isDecimal : isHexadecimal;
      end--;
      while (++end <= value.length) {
        const following2 = value.charCodeAt(end);
        if (!test(following2)) {
          break;
        }
        characters += String.fromCharCode(following2);
        if (type === "named" && characterEntitiesLegacy.includes(characters)) {
          characterReferenceCharacters = characters;
          characterReference = decodeNamedCharacterReference(characters);
        }
      }
      let terminated = value.charCodeAt(end) === 59;
      if (terminated) {
        end++;
        const namedReference = type === "named" ? decodeNamedCharacterReference(characters) : false;
        if (namedReference) {
          characterReferenceCharacters = characters;
          characterReference = namedReference;
        }
      }
      let diff2 = 1 + end - start;
      let reference = "";
      if (!terminated && settings.nonTerminated === false) {
      } else if (!characters) {
        if (type !== "named") {
          warning2(4, diff2);
        }
      } else if (type === "named") {
        if (terminated && !characterReference) {
          warning2(5, 1);
        } else {
          if (characterReferenceCharacters !== characters) {
            end = begin + characterReferenceCharacters.length;
            diff2 = 1 + end - begin;
            terminated = false;
          }
          if (!terminated) {
            const reason = characterReferenceCharacters ? 1 : 3;
            if (settings.attribute) {
              const following2 = value.charCodeAt(end);
              if (following2 === 61) {
                warning2(reason, diff2);
                characterReference = "";
              } else if (isAlphanumerical(following2)) {
                characterReference = "";
              } else {
                warning2(reason, diff2);
              }
            } else {
              warning2(reason, diff2);
            }
          }
        }
        reference = characterReference;
      } else {
        if (!terminated) {
          warning2(2, diff2);
        }
        let referenceCode = Number.parseInt(
          characters,
          type === "hexadecimal" ? 16 : 10
        );
        if (prohibited(referenceCode)) {
          warning2(7, diff2);
          reference = String.fromCharCode(
            65533
            /* `�` */
          );
        } else if (referenceCode in characterReferenceInvalid) {
          warning2(6, diff2);
          reference = characterReferenceInvalid[referenceCode];
        } else {
          let output = "";
          if (disallowed(referenceCode)) {
            warning2(6, diff2);
          }
          if (referenceCode > 65535) {
            referenceCode -= 65536;
            output += String.fromCharCode(
              referenceCode >>> (10 & 1023) | 55296
            );
            referenceCode = 56320 | referenceCode & 1023;
          }
          reference = output + String.fromCharCode(referenceCode);
        }
      }
      if (reference) {
        flush();
        previous = now();
        index2 = end - 1;
        column += end - start + 1;
        result.push(reference);
        const next = now();
        next.offset++;
        if (settings.reference) {
          settings.reference.call(
            settings.referenceContext || void 0,
            reference,
            { start: previous, end: next },
            value.slice(start - 1, end)
          );
        }
        previous = next;
      } else {
        characters = value.slice(start - 1, end);
        queue += characters;
        column += characters.length;
        index2 = end - 1;
      }
    } else {
      if (character === 10) {
        line++;
        lines++;
        column = 0;
      }
      if (Number.isNaN(character)) {
        flush();
      } else {
        queue += String.fromCharCode(character);
        column++;
      }
    }
  }
  return result.join("");
  function now() {
    return {
      line,
      column,
      offset: index2 + ((point ? point.offset : 0) || 0)
    };
  }
  function warning2(code, offset) {
    let position;
    if (settings.warning) {
      position = now();
      position.column += offset;
      position.offset += offset;
      settings.warning.call(
        settings.warningContext || void 0,
        messages[code],
        position,
        code
      );
    }
  }
  function flush() {
    if (queue) {
      result.push(queue);
      if (settings.text) {
        settings.text.call(settings.textContext || void 0, queue, {
          start: previous,
          end: now()
        });
      }
      queue = "";
    }
  }
}
function prohibited(code) {
  return code >= 55296 && code <= 57343 || code > 1114111;
}
function disallowed(code) {
  return code >= 1 && code <= 8 || code === 11 || code >= 13 && code <= 31 || code >= 127 && code <= 159 || code >= 64976 && code <= 65007 || (code & 65535) === 65535 || (code & 65535) === 65534;
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lib/prism-core.js
var uniqueId = 0;
var plainTextGrammar = {};
var _ = {
  /**
   * A namespace for utility methods.
   *
   * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
   * change or disappear at any time.
   *
   * @namespace
   * @memberof Prism
   */
  util: {
    /**
     * Returns the name of the type of the given value.
     *
     * @param {any} o
     * @returns {string}
     * @example
     * type(null)      === 'Null'
     * type(undefined) === 'Undefined'
     * type(123)       === 'Number'
     * type('foo')     === 'String'
     * type(true)      === 'Boolean'
     * type([1, 2])    === 'Array'
     * type({})        === 'Object'
     * type(String)    === 'Function'
     * type(/abc+/)    === 'RegExp'
     */
    type: function(o) {
      return Object.prototype.toString.call(o).slice(8, -1);
    },
    /**
     * Returns a unique number for the given object. Later calls will still return the same number.
     *
     * @param {Object} obj
     * @returns {number}
     */
    objId: function(obj) {
      if (!obj["__id"]) {
        Object.defineProperty(obj, "__id", { value: ++uniqueId });
      }
      return obj["__id"];
    },
    /**
     * Creates a deep clone of the given object.
     *
     * The main intended use of this function is to clone language definitions.
     *
     * @param {T} o
     * @param {Record<number, any>} [visited]
     * @returns {T}
     * @template T
     */
    clone: function deepClone(o, visited) {
      visited = visited || {};
      var clone3;
      var id;
      switch (_.util.type(o)) {
        case "Object":
          id = _.util.objId(o);
          if (visited[id]) {
            return visited[id];
          }
          clone3 = /** @type {Record<string, any>} */
          {};
          visited[id] = clone3;
          for (var key in o) {
            if (o.hasOwnProperty(key)) {
              clone3[key] = deepClone(o[key], visited);
            }
          }
          return (
            /** @type {any} */
            clone3
          );
        case "Array":
          id = _.util.objId(o);
          if (visited[id]) {
            return visited[id];
          }
          clone3 = [];
          visited[id] = clone3;
          /** @type {any} */
          o.forEach(
            function(v, i) {
              clone3[i] = deepClone(v, visited);
            }
          );
          return (
            /** @type {any} */
            clone3
          );
        default:
          return o;
      }
    }
  },
  /**
   * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
   *
   * @namespace
   * @memberof Prism
   * @public
   */
  languages: {
    /**
     * The grammar for plain, unformatted text.
     */
    plain: plainTextGrammar,
    plaintext: plainTextGrammar,
    text: plainTextGrammar,
    txt: plainTextGrammar,
    /**
     * Creates a deep copy of the language with the given id and appends the given tokens.
     *
     * If a token in `redef` also appears in the copied language, then the existing token in the copied language
     * will be overwritten at its original position.
     *
     * ## Best practices
     *
     * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
     * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
     * understand the language definition because, normally, the order of tokens matters in Prism grammars.
     *
     * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
     * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
     *
     * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
     * @param {Grammar} redef The new tokens to append.
     * @returns {Grammar} The new language created.
     * @public
     * @example
     * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
     *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
     *     // at its original position
     *     'comment': { ... },
     *     // CSS doesn't have a 'color' token, so this token will be appended
     *     'color': /\b(?:red|green|blue)\b/
     * });
     */
    extend: function(id, redef) {
      var lang = _.util.clone(_.languages[id]);
      for (var key in redef) {
        lang[key] = redef[key];
      }
      return lang;
    },
    /**
     * Inserts tokens _before_ another token in a language definition or any other grammar.
     *
     * ## Usage
     *
     * This helper method makes it easy to modify existing languages. For example, the CSS language definition
     * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
     * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
     * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
     * this:
     *
     * ```js
     * Prism.languages.markup.style = {
     *     // token
     * };
     * ```
     *
     * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
     * before existing tokens. For the CSS example above, you would use it like this:
     *
     * ```js
     * Prism.languages.insertBefore('markup', 'cdata', {
     *     'style': {
     *         // token
     *     }
     * });
     * ```
     *
     * ## Special cases
     *
     * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
     * will be ignored.
     *
     * This behavior can be used to insert tokens after `before`:
     *
     * ```js
     * Prism.languages.insertBefore('markup', 'comment', {
     *     'comment': Prism.languages.markup.comment,
     *     // tokens after 'comment'
     * });
     * ```
     *
     * ## Limitations
     *
     * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
     * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
     * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
     * deleting properties which is necessary to insert at arbitrary positions.
     *
     * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
     * Instead, it will create a new object and replace all references to the target object with the new one. This
     * can be done without temporarily deleting properties, so the iteration order is well-defined.
     *
     * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
     * you hold the target object in a variable, then the value of the variable will not change.
     *
     * ```js
     * var oldMarkup = Prism.languages.markup;
     * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
     *
     * assert(oldMarkup !== Prism.languages.markup);
     * assert(newMarkup === Prism.languages.markup);
     * ```
     *
     * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
     * object to be modified.
     * @param {string} before The key to insert before.
     * @param {Grammar} insert An object containing the key-value pairs to be inserted.
     * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
     * object to be modified.
     *
     * Defaults to `Prism.languages`.
     * @returns {Grammar} The new grammar object.
     * @public
     */
    insertBefore: function(inside, before, insert, root) {
      root = root || /** @type {any} */
      _.languages;
      var grammar = root[inside];
      var ret = {};
      for (var token2 in grammar) {
        if (grammar.hasOwnProperty(token2)) {
          if (token2 == before) {
            for (var newToken in insert) {
              if (insert.hasOwnProperty(newToken)) {
                ret[newToken] = insert[newToken];
              }
            }
          }
          if (!insert.hasOwnProperty(token2)) {
            ret[token2] = grammar[token2];
          }
        }
      }
      var old = root[inside];
      root[inside] = ret;
      _.languages.DFS(_.languages, function(key, value) {
        if (value === old && key != inside) {
          this[key] = ret;
        }
      });
      return ret;
    },
    // Traverse a language definition with Depth First Search
    DFS: function DFS(o, callback, type, visited) {
      visited = visited || {};
      var objId = _.util.objId;
      for (var i in o) {
        if (o.hasOwnProperty(i)) {
          callback.call(o, i, o[i], type || i);
          var property2 = o[i];
          var propertyType = _.util.type(property2);
          if (propertyType === "Object" && !visited[objId(property2)]) {
            visited[objId(property2)] = true;
            DFS(property2, callback, null, visited);
          } else if (propertyType === "Array" && !visited[objId(property2)]) {
            visited[objId(property2)] = true;
            DFS(property2, callback, i, visited);
          }
        }
      }
    }
  },
  plugins: {},
  /**
   * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
   * and the language definitions to use, and returns a string with the HTML produced.
   *
   * The following hooks will be run:
   * 1. `before-tokenize`
   * 2. `after-tokenize`
   * 3. `wrap`: On each {@link Token}.
   *
   * @param {string} text A string with the code to be highlighted.
   * @param {Grammar} grammar An object containing the tokens to use.
   *
   * Usually a language definition like `Prism.languages.markup`.
   * @param {string} language The name of the language definition passed to `grammar`.
   * @returns {string} The highlighted HTML.
   * @memberof Prism
   * @public
   * @example
   * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
   */
  highlight: function(text, grammar, language) {
    var env = {
      code: text,
      grammar,
      language
    };
    _.hooks.run("before-tokenize", env);
    if (!env.grammar) {
      throw new Error('The language "' + env.language + '" has no grammar.');
    }
    env.tokens = _.tokenize(env.code, env.grammar);
    _.hooks.run("after-tokenize", env);
    return Token.stringify(_.util.encode(env.tokens), env.language);
  },
  /**
   * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
   * and the language definitions to use, and returns an array with the tokenized code.
   *
   * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
   *
   * This method could be useful in other contexts as well, as a very crude parser.
   *
   * @param {string} text A string with the code to be highlighted.
   * @param {Grammar} grammar An object containing the tokens to use.
   *
   * Usually a language definition like `Prism.languages.markup`.
   * @returns {TokenStream} An array of strings and tokens, a token stream.
   * @memberof Prism
   * @public
   * @example
   * let code = `var foo = 0;`;
   * let tokens = Prism.tokenize(code, Prism.languages.javascript);
   * tokens.forEach(token => {
   *     if (token instanceof Prism.Token && token.type === 'number') {
   *         console.log(`Found numeric literal: ${token.content}`);
   *     }
   * });
   */
  tokenize: function(text, grammar) {
    var rest = grammar.rest;
    if (rest) {
      for (var token2 in rest) {
        grammar[token2] = rest[token2];
      }
      delete grammar.rest;
    }
    var tokenList = new LinkedList();
    addAfter(tokenList, tokenList.head, text);
    matchGrammar(text, tokenList, grammar, tokenList.head, 0);
    return toArray(tokenList);
  },
  /**
   * @namespace
   * @memberof Prism
   * @public
   */
  hooks: {
    all: {},
    /**
     * Adds the given callback to the list of callbacks for the given hook.
     *
     * The callback will be invoked when the hook it is registered for is run.
     * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
     *
     * One callback function can be registered to multiple hooks and the same hook multiple times.
     *
     * @param {string} name The name of the hook.
     * @param {HookCallback} callback The callback function which is given environment variables.
     * @public
     */
    add: function(name2, callback) {
      var hooks = _.hooks.all;
      hooks[name2] = hooks[name2] || [];
      hooks[name2].push(callback);
    },
    /**
     * Runs a hook invoking all registered callbacks with the given environment variables.
     *
     * Callbacks will be invoked synchronously and in the order in which they were registered.
     *
     * @param {string} name The name of the hook.
     * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
     * @public
     */
    run: function(name2, env) {
      var callbacks = _.hooks.all[name2];
      if (!callbacks || !callbacks.length) {
        return;
      }
      for (var i = 0, callback; callback = callbacks[i++]; ) {
        callback(env);
      }
    }
  },
  Token
};
function Token(type, content, alias2, matchedStr) {
  this.type = type;
  this.content = content;
  this.alias = alias2;
  this.length = (matchedStr || "").length | 0;
}
function matchPattern(pattern2, pos, text, lookbehind) {
  pattern2.lastIndex = pos;
  var match = pattern2.exec(text);
  if (match && lookbehind && match[1]) {
    var lookbehindLength = match[1].length;
    match.index += lookbehindLength;
    match[0] = match[0].slice(lookbehindLength);
  }
  return match;
}
function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
  for (var token2 in grammar) {
    if (!grammar.hasOwnProperty(token2) || !grammar[token2]) {
      continue;
    }
    var patterns = grammar[token2];
    patterns = Array.isArray(patterns) ? patterns : [patterns];
    for (var j = 0; j < patterns.length; ++j) {
      if (rematch && rematch.cause == token2 + "," + j) {
        return;
      }
      var patternObj = patterns[j];
      var inside = patternObj.inside;
      var lookbehind = !!patternObj.lookbehind;
      var greedy = !!patternObj.greedy;
      var alias2 = patternObj.alias;
      if (greedy && !patternObj.pattern.global) {
        var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
        patternObj.pattern = RegExp(patternObj.pattern.source, flags + "g");
      }
      var pattern2 = patternObj.pattern || patternObj;
      for (var currentNode = startNode.next, pos = startPos; currentNode !== tokenList.tail; pos += currentNode.value.length, currentNode = currentNode.next) {
        if (rematch && pos >= rematch.reach) {
          break;
        }
        var str = currentNode.value;
        if (tokenList.length > text.length) {
          return;
        }
        if (str instanceof Token) {
          continue;
        }
        var removeCount = 1;
        var match;
        if (greedy) {
          match = matchPattern(pattern2, pos, text, lookbehind);
          if (!match || match.index >= text.length) {
            break;
          }
          var from2 = match.index;
          var to = match.index + match[0].length;
          var p = pos;
          p += currentNode.value.length;
          while (from2 >= p) {
            currentNode = currentNode.next;
            p += currentNode.value.length;
          }
          p -= currentNode.value.length;
          pos = p;
          if (currentNode.value instanceof Token) {
            continue;
          }
          for (var k = currentNode; k !== tokenList.tail && (p < to || typeof k.value === "string"); k = k.next) {
            removeCount++;
            p += k.value.length;
          }
          removeCount--;
          str = text.slice(pos, p);
          match.index -= pos;
        } else {
          match = matchPattern(pattern2, 0, str, lookbehind);
          if (!match) {
            continue;
          }
        }
        var from2 = match.index;
        var matchStr = match[0];
        var before = str.slice(0, from2);
        var after = str.slice(from2 + matchStr.length);
        var reach = pos + str.length;
        if (rematch && reach > rematch.reach) {
          rematch.reach = reach;
        }
        var removeFrom = currentNode.prev;
        if (before) {
          removeFrom = addAfter(tokenList, removeFrom, before);
          pos += before.length;
        }
        removeRange(tokenList, removeFrom, removeCount);
        var wrapped = new Token(
          token2,
          inside ? _.tokenize(matchStr, inside) : matchStr,
          alias2,
          matchStr
        );
        currentNode = addAfter(tokenList, removeFrom, wrapped);
        if (after) {
          addAfter(tokenList, currentNode, after);
        }
        if (removeCount > 1) {
          var nestedRematch = {
            cause: token2 + "," + j,
            reach
          };
          matchGrammar(
            text,
            tokenList,
            grammar,
            currentNode.prev,
            pos,
            nestedRematch
          );
          if (rematch && nestedRematch.reach > rematch.reach) {
            rematch.reach = nestedRematch.reach;
          }
        }
      }
    }
  }
}
function LinkedList() {
  var head = { value: null, prev: null, next: null };
  var tail = { value: null, prev: head, next: null };
  head.next = tail;
  this.head = head;
  this.tail = tail;
  this.length = 0;
}
function addAfter(list, node, value) {
  var next = node.next;
  var newNode = { value, prev: node, next };
  node.next = newNode;
  next.prev = newNode;
  list.length++;
  return newNode;
}
function removeRange(list, node, count) {
  var next = node.next;
  for (var i = 0; i < count && next !== list.tail; i++) {
    next = next.next;
  }
  node.next = next;
  next.prev = node;
  list.length -= i;
}
function toArray(list) {
  var array = [];
  var node = list.head.next;
  while (node !== list.tail) {
    array.push(node.value);
    node = node.next;
  }
  return array;
}
var Prism = _;

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lib/core.js
function Refractor() {
}
Refractor.prototype = Prism;
var refractor = new Refractor();
refractor.highlight = highlight;
refractor.register = register;
refractor.alias = alias;
refractor.registered = registered;
refractor.listLanguages = listLanguages;
refractor.util.encode = encode;
refractor.Token.stringify = stringify;
function highlight(value, language) {
  if (typeof value !== "string") {
    throw new TypeError("Expected `string` for `value`, got `" + value + "`");
  }
  let grammar;
  let name2;
  if (language && typeof language === "object") {
    grammar = language;
  } else {
    name2 = language;
    if (typeof name2 !== "string") {
      throw new TypeError("Expected `string` for `name`, got `" + name2 + "`");
    }
    if (Object.hasOwn(refractor.languages, name2)) {
      grammar = refractor.languages[name2];
    } else {
      throw new Error("Unknown language: `" + name2 + "` is not registered");
    }
  }
  return {
    type: "root",
    // @ts-expect-error: we hacked Prism to accept and return the things we want.
    children: Prism.highlight.call(refractor, value, grammar, name2)
  };
}
function register(syntax) {
  if (typeof syntax !== "function" || !syntax.displayName) {
    throw new Error("Expected `function` for `syntax`, got `" + syntax + "`");
  }
  if (!Object.hasOwn(refractor.languages, syntax.displayName)) {
    syntax(refractor);
  }
}
function alias(language, alias2) {
  const languages = refractor.languages;
  let map = {};
  if (typeof language === "string") {
    if (alias2) {
      map[language] = alias2;
    }
  } else {
    map = language;
  }
  let key;
  for (key in map) {
    if (Object.hasOwn(map, key)) {
      const value = map[key];
      const list = typeof value === "string" ? [value] : value;
      let index2 = -1;
      while (++index2 < list.length) {
        languages[list[index2]] = languages[key];
      }
    }
  }
}
function registered(aliasOrLanguage) {
  if (typeof aliasOrLanguage !== "string") {
    throw new TypeError(
      "Expected `string` for `aliasOrLanguage`, got `" + aliasOrLanguage + "`"
    );
  }
  return Object.hasOwn(refractor.languages, aliasOrLanguage);
}
function listLanguages() {
  const languages = refractor.languages;
  const list = [];
  let language;
  for (language in languages) {
    if (Object.hasOwn(languages, language) && typeof languages[language] === "object") {
      list.push(language);
    }
  }
  return list;
}
function stringify(value, language) {
  if (typeof value === "string") {
    return { type: "text", value };
  }
  if (Array.isArray(value)) {
    const result = [];
    let index2 = -1;
    while (++index2 < value.length) {
      if (value[index2] !== null && value[index2] !== void 0 && value[index2] !== "") {
        result.push(
          /** @type {Element | Text} */
          stringify(value[index2], language)
        );
      }
    }
    return result;
  }
  const env = {
    attributes: {},
    classes: ["token", value.type],
    content: stringify(value.content, language),
    language,
    tag: "span",
    type: value.type
  };
  if (value.alias) {
    env.classes.push(
      ...typeof value.alias === "string" ? [value.alias] : value.alias
    );
  }
  refractor.hooks.run("wrap", env);
  return h(
    env.tag + "." + env.classes.join("."),
    attributes(env.attributes),
    env.content
  );
}
function encode(tokens) {
  return tokens;
}
function attributes(record) {
  let key;
  for (key in record) {
    if (Object.hasOwn(record, key)) {
      record[key] = parseEntities(record[key]);
    }
  }
  return record;
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/clike.js
clike.displayName = "clike";
clike.aliases = [];
function clike(Prism2) {
  Prism2.languages.clike = {
    comment: [
      {
        pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
        lookbehind: true,
        greedy: true
      },
      {
        pattern: /(^|[^\\:])\/\/.*/,
        lookbehind: true,
        greedy: true
      }
    ],
    string: {
      pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
      greedy: true
    },
    "class-name": {
      pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
      lookbehind: true,
      inside: {
        punctuation: /[.\\]/
      }
    },
    keyword: /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b\w+(?=\()/,
    number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
    operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    punctuation: /[{}[\];(),.:]/
  };
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/javascript.js
javascript.displayName = "javascript";
javascript.aliases = ["js"];
function javascript(Prism2) {
  Prism2.register(clike);
  Prism2.languages.javascript = Prism2.languages.extend("clike", {
    "class-name": [
      Prism2.languages.clike["class-name"],
      {
        pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
        lookbehind: true
      }
    ],
    keyword: [
      {
        pattern: /((?:^|\})\s*)catch\b/,
        lookbehind: true
      },
      {
        pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
        lookbehind: true
      }
    ],
    // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
    function: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    number: {
      pattern: RegExp(
        /(^|[^\w$])/.source + "(?:" + // constant
        (/NaN|Infinity/.source + "|" + // binary integer
        /0[bB][01]+(?:_[01]+)*n?/.source + "|" + // octal integer
        /0[oO][0-7]+(?:_[0-7]+)*n?/.source + "|" + // hexadecimal integer
        /0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source + "|" + // decimal bigint
        /\d+(?:_\d+)*n/.source + "|" + // decimal number (integer or float) but no bigint
        /(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source) + ")" + /(?![\w$])/.source
      ),
      lookbehind: true
    },
    operator: /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
  });
  Prism2.languages.javascript["class-name"][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;
  Prism2.languages.insertBefore("javascript", "keyword", {
    regex: {
      pattern: RegExp(
        // lookbehind
        // eslint-disable-next-line regexp/no-dupe-characters-character-class
        /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source + // Regex pattern:
        // There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
        // classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
        // with the only syntax, so we have to define 2 different regex patterns.
        /\//.source + "(?:" + /(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source + "|" + // `v` flag syntax. This supports 3 levels of nested character classes.
        /(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source + ")" + // lookahead
        /(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
      ),
      lookbehind: true,
      greedy: true,
      inside: {
        "regex-source": {
          pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
          lookbehind: true,
          alias: "language-regex",
          inside: Prism2.languages.regex
        },
        "regex-delimiter": /^\/|\/$/,
        "regex-flags": /^[a-z]+$/
      }
    },
    // This must be declared before keyword because we use "function" inside the look-forward
    "function-variable": {
      pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
      alias: "function"
    },
    parameter: [
      {
        pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
        lookbehind: true,
        inside: Prism2.languages.javascript
      },
      {
        pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
        lookbehind: true,
        inside: Prism2.languages.javascript
      },
      {
        pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
        lookbehind: true,
        inside: Prism2.languages.javascript
      },
      {
        pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
        lookbehind: true,
        inside: Prism2.languages.javascript
      }
    ],
    constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/
  });
  Prism2.languages.insertBefore("javascript", "string", {
    hashbang: {
      pattern: /^#!.*/,
      greedy: true,
      alias: "comment"
    },
    "template-string": {
      pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
      greedy: true,
      inside: {
        "template-punctuation": {
          pattern: /^`|`$/,
          alias: "string"
        },
        interpolation: {
          pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
          lookbehind: true,
          inside: {
            "interpolation-punctuation": {
              pattern: /^\$\{|\}$/,
              alias: "punctuation"
            },
            rest: Prism2.languages.javascript
          }
        },
        string: /[\s\S]+/
      }
    },
    "string-property": {
      pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
      lookbehind: true,
      greedy: true,
      alias: "property"
    }
  });
  Prism2.languages.insertBefore("javascript", "operator", {
    "literal-property": {
      pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
      lookbehind: true,
      alias: "property"
    }
  });
  if (Prism2.languages.markup) {
    Prism2.languages.markup.tag.addInlined("script", "javascript");
    Prism2.languages.markup.tag.addAttribute(
      /on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
      "javascript"
    );
  }
  Prism2.languages.js = Prism2.languages.javascript;
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/typescript.js
typescript.displayName = "typescript";
typescript.aliases = ["ts"];
function typescript(Prism2) {
  Prism2.register(javascript);
  (function(Prism3) {
    Prism3.languages.typescript = Prism3.languages.extend("javascript", {
      "class-name": {
        pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
        lookbehind: true,
        greedy: true,
        inside: null
        // see below
      },
      builtin: /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/
    });
    Prism3.languages.typescript.keyword.push(
      /\b(?:abstract|declare|is|keyof|readonly|require)\b/,
      // keywords that have to be followed by an identifier
      /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
      // This is for `import type *, {}`
      /\btype\b(?=\s*(?:[\{*]|$))/
    );
    delete Prism3.languages.typescript["parameter"];
    delete Prism3.languages.typescript["literal-property"];
    var typeInside = Prism3.languages.extend("typescript", {});
    delete typeInside["class-name"];
    Prism3.languages.typescript["class-name"].inside = typeInside;
    Prism3.languages.insertBefore("typescript", "function", {
      decorator: {
        pattern: /@[$\w\xA0-\uFFFF]+/,
        inside: {
          at: {
            pattern: /^@/,
            alias: "operator"
          },
          function: /^[\s\S]+/
        }
      },
      "generic-function": {
        // e.g. foo<T extends "bar" | "baz">( ...
        pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,
        greedy: true,
        inside: {
          function: /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,
          generic: {
            pattern: /<[\s\S]+/,
            // everything after the first <
            alias: "class-name",
            inside: typeInside
          }
        }
      }
    });
    Prism3.languages.ts = Prism3.languages.typescript;
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/markup.js
markup.displayName = "markup";
markup.aliases = ["atom", "html", "mathml", "rss", "ssml", "svg", "xml"];
function markup(Prism2) {
  Prism2.languages.markup = {
    comment: {
      pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
      greedy: true
    },
    prolog: {
      pattern: /<\?[\s\S]+?\?>/,
      greedy: true
    },
    doctype: {
      // https://www.w3.org/TR/xml/#NT-doctypedecl
      pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
      greedy: true,
      inside: {
        "internal-subset": {
          pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
          lookbehind: true,
          greedy: true,
          inside: null
          // see below
        },
        string: {
          pattern: /"[^"]*"|'[^']*'/,
          greedy: true
        },
        punctuation: /^<!|>$|[[\]]/,
        "doctype-tag": /^DOCTYPE/i,
        name: /[^\s<>'"]+/
      }
    },
    cdata: {
      pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
      greedy: true
    },
    tag: {
      pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
      greedy: true,
      inside: {
        tag: {
          pattern: /^<\/?[^\s>\/]+/,
          inside: {
            punctuation: /^<\/?/,
            namespace: /^[^\s>\/:]+:/
          }
        },
        "special-attr": [],
        "attr-value": {
          pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
          inside: {
            punctuation: [
              {
                pattern: /^=/,
                alias: "attr-equals"
              },
              {
                pattern: /^(\s*)["']|["']$/,
                lookbehind: true
              }
            ]
          }
        },
        punctuation: /\/?>/,
        "attr-name": {
          pattern: /[^\s>\/]+/,
          inside: {
            namespace: /^[^\s>\/:]+:/
          }
        }
      }
    },
    entity: [
      {
        pattern: /&[\da-z]{1,8};/i,
        alias: "named-entity"
      },
      /&#x?[\da-f]{1,8};/i
    ]
  };
  Prism2.languages.markup["tag"].inside["attr-value"].inside["entity"] = Prism2.languages.markup["entity"];
  Prism2.languages.markup["doctype"].inside["internal-subset"].inside = Prism2.languages.markup;
  Prism2.hooks.add("wrap", function(env) {
    if (env.type === "entity") {
      env.attributes["title"] = env.content.value.replace(/&amp;/, "&");
    }
  });
  Object.defineProperty(Prism2.languages.markup.tag, "addInlined", {
    /**
     * Adds an inlined language to markup.
     *
     * An example of an inlined language is CSS with `<style>` tags.
     *
     * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
     * case insensitive.
     * @param {string} lang The language key.
     * @example
     * addInlined('style', 'css');
     */
    value: function addInlined(tagName, lang) {
      var includedCdataInside = {};
      includedCdataInside["language-" + lang] = {
        pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
        lookbehind: true,
        inside: Prism2.languages[lang]
      };
      includedCdataInside["cdata"] = /^<!\[CDATA\[|\]\]>$/i;
      var inside = {
        "included-cdata": {
          pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
          inside: includedCdataInside
        }
      };
      inside["language-" + lang] = {
        pattern: /[\s\S]+/,
        inside: Prism2.languages[lang]
      };
      var def = {};
      def[tagName] = {
        pattern: RegExp(
          /(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(
            /__/g,
            function() {
              return tagName;
            }
          ),
          "i"
        ),
        lookbehind: true,
        greedy: true,
        inside
      };
      Prism2.languages.insertBefore("markup", "cdata", def);
    }
  });
  Object.defineProperty(Prism2.languages.markup.tag, "addAttribute", {
    /**
     * Adds an pattern to highlight languages embedded in HTML attributes.
     *
     * An example of an inlined language is CSS with `style` attributes.
     *
     * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
     * case insensitive.
     * @param {string} lang The language key.
     * @example
     * addAttribute('style', 'css');
     */
    value: function(attrName, lang) {
      Prism2.languages.markup.tag.inside["special-attr"].push({
        pattern: RegExp(
          /(^|["'\s])/.source + "(?:" + attrName + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
          "i"
        ),
        lookbehind: true,
        inside: {
          "attr-name": /^[^\s=]+/,
          "attr-value": {
            pattern: /=[\s\S]+/,
            inside: {
              value: {
                pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
                lookbehind: true,
                alias: [lang, "language-" + lang],
                inside: Prism2.languages[lang]
              },
              punctuation: [
                {
                  pattern: /^=/,
                  alias: "attr-equals"
                },
                /"|'/
              ]
            }
          }
        }
      });
    }
  });
  Prism2.languages.html = Prism2.languages.markup;
  Prism2.languages.mathml = Prism2.languages.markup;
  Prism2.languages.svg = Prism2.languages.markup;
  Prism2.languages.xml = Prism2.languages.extend("markup", {});
  Prism2.languages.ssml = Prism2.languages.xml;
  Prism2.languages.atom = Prism2.languages.xml;
  Prism2.languages.rss = Prism2.languages.xml;
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/jsx.js
jsx10.displayName = "jsx";
jsx10.aliases = [];
function jsx10(Prism2) {
  Prism2.register(javascript);
  Prism2.register(markup);
  (function(Prism3) {
    var javascript2 = Prism3.util.clone(Prism3.languages.javascript);
    var space = /(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)/.source;
    var braces = /(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source;
    var spread = /(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;
    function re(source, flags) {
      source = source.replace(/<S>/g, function() {
        return space;
      }).replace(/<BRACES>/g, function() {
        return braces;
      }).replace(/<SPREAD>/g, function() {
        return spread;
      });
      return RegExp(source, flags);
    }
    spread = re(spread).source;
    Prism3.languages.jsx = Prism3.languages.extend("markup", javascript2);
    Prism3.languages.jsx.tag.pattern = re(
      /<\/?(?:[\w.:-]+(?:<S>+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"/>=]+|<BRACES>))?|<SPREAD>))*<S>*\/?)?>/.source
    );
    Prism3.languages.jsx.tag.inside["tag"].pattern = /^<\/?[^\s>\/]*/;
    Prism3.languages.jsx.tag.inside["attr-value"].pattern = /=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/;
    Prism3.languages.jsx.tag.inside["tag"].inside["class-name"] = /^[A-Z]\w*(?:\.[A-Z]\w*)*$/;
    Prism3.languages.jsx.tag.inside["comment"] = javascript2["comment"];
    Prism3.languages.insertBefore(
      "inside",
      "attr-name",
      {
        spread: {
          pattern: re(/<SPREAD>/.source),
          inside: Prism3.languages.jsx
        }
      },
      Prism3.languages.jsx.tag
    );
    Prism3.languages.insertBefore(
      "inside",
      "special-attr",
      {
        script: {
          // Allow for two levels of nesting
          pattern: re(/=<BRACES>/.source),
          alias: "language-javascript",
          inside: {
            "script-punctuation": {
              pattern: /^=(?=\{)/,
              alias: "punctuation"
            },
            rest: Prism3.languages.jsx
          }
        }
      },
      Prism3.languages.jsx.tag
    );
    var stringifyToken = function(token2) {
      if (!token2) {
        return "";
      }
      if (typeof token2 === "string") {
        return token2;
      }
      if (typeof token2.content === "string") {
        return token2.content;
      }
      return token2.content.map(stringifyToken).join("");
    };
    var walkTokens = function(tokens) {
      var openedTags = [];
      for (var i = 0; i < tokens.length; i++) {
        var token2 = tokens[i];
        var notTagNorBrace = false;
        if (typeof token2 !== "string") {
          if (token2.type === "tag" && token2.content[0] && token2.content[0].type === "tag") {
            if (token2.content[0].content[0].content === "</") {
              if (openedTags.length > 0 && openedTags[openedTags.length - 1].tagName === stringifyToken(token2.content[0].content[1])) {
                openedTags.pop();
              }
            } else {
              if (token2.content[token2.content.length - 1].content === "/>") {
              } else {
                openedTags.push({
                  tagName: stringifyToken(token2.content[0].content[1]),
                  openedBraces: 0
                });
              }
            }
          } else if (openedTags.length > 0 && token2.type === "punctuation" && token2.content === "{") {
            openedTags[openedTags.length - 1].openedBraces++;
          } else if (openedTags.length > 0 && openedTags[openedTags.length - 1].openedBraces > 0 && token2.type === "punctuation" && token2.content === "}") {
            openedTags[openedTags.length - 1].openedBraces--;
          } else {
            notTagNorBrace = true;
          }
        }
        if (notTagNorBrace || typeof token2 === "string") {
          if (openedTags.length > 0 && openedTags[openedTags.length - 1].openedBraces === 0) {
            var plainText = stringifyToken(token2);
            if (i < tokens.length - 1 && (typeof tokens[i + 1] === "string" || tokens[i + 1].type === "plain-text")) {
              plainText += stringifyToken(tokens[i + 1]);
              tokens.splice(i + 1, 1);
            }
            if (i > 0 && (typeof tokens[i - 1] === "string" || tokens[i - 1].type === "plain-text")) {
              plainText = stringifyToken(tokens[i - 1]) + plainText;
              tokens.splice(i - 1, 1);
              i--;
            }
            tokens[i] = new Prism3.Token(
              "plain-text",
              plainText,
              null,
              plainText
            );
          }
        }
        if (token2.content && typeof token2.content !== "string") {
          walkTokens(token2.content);
        }
      }
    };
    Prism3.hooks.add("after-tokenize", function(env) {
      if (env.language !== "jsx" && env.language !== "tsx") {
        return;
      }
      walkTokens(env.tokens);
    });
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/tsx.js
tsx.displayName = "tsx";
tsx.aliases = [];
function tsx(Prism2) {
  Prism2.register(jsx10);
  Prism2.register(typescript);
  (function(Prism3) {
    var typescript2 = Prism3.util.clone(Prism3.languages.typescript);
    Prism3.languages.tsx = Prism3.languages.extend("jsx", typescript2);
    delete Prism3.languages.tsx["parameter"];
    delete Prism3.languages.tsx["literal-property"];
    var tag = Prism3.languages.tsx.tag;
    tag.pattern = RegExp(
      /(^|[^\w$]|(?=<\/))/.source + "(?:" + tag.pattern.source + ")",
      tag.pattern.flags
    );
    tag.lookbehind = true;
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/json.js
json.displayName = "json";
json.aliases = ["webmanifest"];
function json(Prism2) {
  Prism2.languages.json = {
    property: {
      pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
      lookbehind: true,
      greedy: true
    },
    string: {
      pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
      lookbehind: true,
      greedy: true
    },
    comment: {
      pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
      greedy: true
    },
    number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
    punctuation: /[{}[\],]/,
    operator: /:/,
    boolean: /\b(?:false|true)\b/,
    null: {
      pattern: /\bnull\b/,
      alias: "keyword"
    }
  };
  Prism2.languages.webmanifest = Prism2.languages.json;
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/python.js
python.displayName = "python";
python.aliases = ["py"];
function python(Prism2) {
  Prism2.languages.python = {
    comment: {
      pattern: /(^|[^\\])#.*/,
      lookbehind: true,
      greedy: true
    },
    "string-interpolation": {
      pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
      greedy: true,
      inside: {
        interpolation: {
          // "{" <expression> <optional "!s", "!r", or "!a"> <optional ":" format specifier> "}"
          pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
          lookbehind: true,
          inside: {
            "format-spec": {
              pattern: /(:)[^:(){}]+(?=\}$)/,
              lookbehind: true
            },
            "conversion-option": {
              pattern: /![sra](?=[:}]$)/,
              alias: "punctuation"
            },
            rest: null
          }
        },
        string: /[\s\S]+/
      }
    },
    "triple-quoted-string": {
      pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
      greedy: true,
      alias: "string"
    },
    string: {
      pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
      greedy: true
    },
    function: {
      pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
      lookbehind: true
    },
    "class-name": {
      pattern: /(\bclass\s+)\w+/i,
      lookbehind: true
    },
    decorator: {
      pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
      lookbehind: true,
      alias: ["annotation", "punctuation"],
      inside: {
        punctuation: /\./
      }
    },
    keyword: /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
    builtin: /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
    boolean: /\b(?:False|None|True)\b/,
    number: /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
    operator: /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
    punctuation: /[{}[\];(),.:]/
  };
  Prism2.languages.python["string-interpolation"].inside["interpolation"].inside.rest = Prism2.languages.python;
  Prism2.languages.py = Prism2.languages.python;
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/rust.js
rust.displayName = "rust";
rust.aliases = [];
function rust(Prism2) {
  ;
  (function(Prism3) {
    var multilineComment = /\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\//.source;
    for (var i = 0; i < 2; i++) {
      multilineComment = multilineComment.replace(/<self>/g, function() {
        return multilineComment;
      });
    }
    multilineComment = multilineComment.replace(/<self>/g, function() {
      return /[^\s\S]/.source;
    });
    Prism3.languages.rust = {
      comment: [
        {
          pattern: RegExp(/(^|[^\\])/.source + multilineComment),
          lookbehind: true,
          greedy: true
        },
        {
          pattern: /(^|[^\\:])\/\/.*/,
          lookbehind: true,
          greedy: true
        }
      ],
      string: {
        pattern: /b?"(?:\\[\s\S]|[^\\"])*"|b?r(#*)"(?:[^"]|"(?!\1))*"\1/,
        greedy: true
      },
      char: {
        pattern: /b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/,
        greedy: true
      },
      attribute: {
        pattern: /#!?\[(?:[^\[\]"]|"(?:\\[\s\S]|[^\\"])*")*\]/,
        greedy: true,
        alias: "attr-name",
        inside: {
          string: null
          // see below
        }
      },
      // Closure params should not be confused with bitwise OR |
      "closure-params": {
        pattern: /([=(,:]\s*|\bmove\s*)\|[^|]*\||\|[^|]*\|(?=\s*(?:\{|->))/,
        lookbehind: true,
        greedy: true,
        inside: {
          "closure-punctuation": {
            pattern: /^\||\|$/,
            alias: "punctuation"
          },
          rest: null
          // see below
        }
      },
      "lifetime-annotation": {
        pattern: /'\w+/,
        alias: "symbol"
      },
      "fragment-specifier": {
        pattern: /(\$\w+:)[a-z]+/,
        lookbehind: true,
        alias: "punctuation"
      },
      variable: /\$\w+/,
      "function-definition": {
        pattern: /(\bfn\s+)\w+/,
        lookbehind: true,
        alias: "function"
      },
      "type-definition": {
        pattern: /(\b(?:enum|struct|trait|type|union)\s+)\w+/,
        lookbehind: true,
        alias: "class-name"
      },
      "module-declaration": [
        {
          pattern: /(\b(?:crate|mod)\s+)[a-z][a-z_\d]*/,
          lookbehind: true,
          alias: "namespace"
        },
        {
          pattern: /(\b(?:crate|self|super)\s*)::\s*[a-z][a-z_\d]*\b(?:\s*::(?:\s*[a-z][a-z_\d]*\s*::)*)?/,
          lookbehind: true,
          alias: "namespace",
          inside: {
            punctuation: /::/
          }
        }
      ],
      keyword: [
        // https://github.com/rust-lang/reference/blob/master/src/keywords.md
        /\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,
        // primitives and str
        // https://doc.rust-lang.org/stable/rust-by-example/primitives.html
        /\b(?:bool|char|f(?:32|64)|[ui](?:8|16|32|64|128|size)|str)\b/
      ],
      // functions can technically start with an upper-case letter, but this will introduce a lot of false positives
      // and Rust's naming conventions recommend snake_case anyway.
      // https://doc.rust-lang.org/1.0.0/style/style/naming/README.html
      function: /\b[a-z_]\w*(?=\s*(?:::\s*<|\())/,
      macro: {
        pattern: /\b\w+!/,
        alias: "property"
      },
      constant: /\b[A-Z_][A-Z_\d]+\b/,
      "class-name": /\b[A-Z]\w*\b/,
      namespace: {
        pattern: /(?:\b[a-z][a-z_\d]*\s*::\s*)*\b[a-z][a-z_\d]*\s*::(?!\s*<)/,
        inside: {
          punctuation: /::/
        }
      },
      // Hex, oct, bin, dec numbers with visual separators and type suffix
      number: /\b(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)(?:_?(?:f32|f64|[iu](?:8|16|32|64|size)?))?\b/,
      boolean: /\b(?:false|true)\b/,
      punctuation: /->|\.\.=|\.{1,3}|::|[{}[\];(),:]/,
      operator: /[-+*\/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/
    };
    Prism3.languages.rust["closure-params"].inside.rest = Prism3.languages.rust;
    Prism3.languages.rust["attribute"].inside["string"] = Prism3.languages.rust["string"];
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/go.js
go.displayName = "go";
go.aliases = [];
function go(Prism2) {
  Prism2.register(clike);
  Prism2.languages.go = Prism2.languages.extend("clike", {
    string: {
      pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/,
      lookbehind: true,
      greedy: true
    },
    keyword: /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
    boolean: /\b(?:_|false|iota|nil|true)\b/,
    number: [
      // binary and octal integers
      /\b0(?:b[01_]+|o[0-7_]+)i?\b/i,
      // hexadecimal integers and floats
      /\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i,
      // decimal integers and floats
      /(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i
    ],
    operator: /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,
    builtin: /\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/
  });
  Prism2.languages.insertBefore("go", "string", {
    char: {
      pattern: /'(?:\\.|[^'\\\r\n]){0,10}'/,
      greedy: true
    }
  });
  delete Prism2.languages.go["class-name"];
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/java.js
java.displayName = "java";
java.aliases = [];
function java(Prism2) {
  Prism2.register(clike);
  (function(Prism3) {
    var keywords = /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|non-sealed|null|open|opens|package|permits|private|protected|provides|public|record(?!\s*[(){}[\]<>=%~.:,;?+\-*/&|^])|requires|return|sealed|short|static|strictfp|super|switch|synchronized|this|throw|throws|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/;
    var classNamePrefix = /(?:[a-z]\w*\s*\.\s*)*(?:[A-Z]\w*\s*\.\s*)*/.source;
    var className = {
      pattern: RegExp(
        /(^|[^\w.])/.source + classNamePrefix + /[A-Z](?:[\d_A-Z]*[a-z]\w*)?\b/.source
      ),
      lookbehind: true,
      inside: {
        namespace: {
          pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/,
          inside: {
            punctuation: /\./
          }
        },
        punctuation: /\./
      }
    };
    Prism3.languages.java = Prism3.languages.extend("clike", {
      string: {
        pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"/,
        lookbehind: true,
        greedy: true
      },
      "class-name": [
        className,
        {
          // variables, parameters, and constructor references
          // this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
          pattern: RegExp(
            /(^|[^\w.])/.source + classNamePrefix + /[A-Z]\w*(?=\s+\w+\s*[;,=()]|\s*(?:\[[\s,]*\]\s*)?::\s*new\b)/.source
          ),
          lookbehind: true,
          inside: className.inside
        },
        {
          // class names based on keyword
          // this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
          pattern: RegExp(
            /(\b(?:class|enum|extends|implements|instanceof|interface|new|record|throws)\s+)/.source + classNamePrefix + /[A-Z]\w*\b/.source
          ),
          lookbehind: true,
          inside: className.inside
        }
      ],
      keyword: keywords,
      function: [
        Prism3.languages.clike.function,
        {
          pattern: /(::\s*)[a-z_]\w*/,
          lookbehind: true
        }
      ],
      number: /\b0b[01][01_]*L?\b|\b0x(?:\.[\da-f_p+-]+|[\da-f_]+(?:\.[\da-f_p+-]+)?)\b|(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i,
      operator: {
        pattern: /(^|[^.])(?:<<=?|>>>?=?|->|--|\+\+|&&|\|\||::|[?:~]|[-+*/%&|^!=<>]=?)/m,
        lookbehind: true
      },
      constant: /\b[A-Z][A-Z_\d]+\b/
    });
    Prism3.languages.insertBefore("java", "string", {
      "triple-quoted-string": {
        // http://openjdk.java.net/jeps/355#Description
        pattern: /"""[ \t]*[\r\n](?:(?:"|"")?(?:\\.|[^"\\]))*"""/,
        greedy: true,
        alias: "string"
      },
      char: {
        pattern: /'(?:\\.|[^'\\\r\n]){1,6}'/,
        greedy: true
      }
    });
    Prism3.languages.insertBefore("java", "class-name", {
      annotation: {
        pattern: /(^|[^.])@\w+(?:\s*\.\s*\w+)*/,
        lookbehind: true,
        alias: "punctuation"
      },
      generics: {
        pattern: /<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&))*>)*>)*>)*>/,
        inside: {
          "class-name": className,
          keyword: keywords,
          punctuation: /[<>(),.:]/,
          operator: /[?&|]/
        }
      },
      import: [
        {
          pattern: RegExp(
            /(\bimport\s+)/.source + classNamePrefix + /(?:[A-Z]\w*|\*)(?=\s*;)/.source
          ),
          lookbehind: true,
          inside: {
            namespace: className.inside.namespace,
            punctuation: /\./,
            operator: /\*/,
            "class-name": /\w+/
          }
        },
        {
          pattern: RegExp(
            /(\bimport\s+static\s+)/.source + classNamePrefix + /(?:\w+|\*)(?=\s*;)/.source
          ),
          lookbehind: true,
          alias: "static",
          inside: {
            namespace: className.inside.namespace,
            static: /\b\w+$/,
            punctuation: /\./,
            operator: /\*/,
            "class-name": /\w+/
          }
        }
      ],
      namespace: {
        pattern: RegExp(
          /(\b(?:exports|import(?:\s+static)?|module|open|opens|package|provides|requires|to|transitive|uses|with)\s+)(?!<keyword>)[a-z]\w*(?:\.[a-z]\w*)*\.?/.source.replace(
            /<keyword>/g,
            function() {
              return keywords.source;
            }
          )
        ),
        lookbehind: true,
        inside: {
          punctuation: /\./
        }
      }
    });
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/kotlin.js
kotlin.displayName = "kotlin";
kotlin.aliases = ["kt", "kts"];
function kotlin(Prism2) {
  Prism2.register(clike);
  (function(Prism3) {
    Prism3.languages.kotlin = Prism3.languages.extend("clike", {
      keyword: {
        // The lookbehind prevents wrong highlighting of e.g. kotlin.properties.get
        pattern: /(^|[^.])\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|to|try|typealias|val|var|vararg|when|where|while)\b/,
        lookbehind: true
      },
      function: [
        {
          pattern: /(?:`[^\r\n`]+`|\b\w+)(?=\s*\()/,
          greedy: true
        },
        {
          pattern: /(\.)(?:`[^\r\n`]+`|\w+)(?=\s*\{)/,
          lookbehind: true,
          greedy: true
        }
      ],
      number: /\b(?:0[xX][\da-fA-F]+(?:_[\da-fA-F]+)*|0[bB][01]+(?:_[01]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?[fFL]?)\b/,
      operator: /\+[+=]?|-[-=>]?|==?=?|!(?:!|==?)?|[\/*%<>]=?|[?:]:?|\.\.|&&|\|\||\b(?:and|inv|or|shl|shr|ushr|xor)\b/
    });
    delete Prism3.languages.kotlin["class-name"];
    var interpolationInside = {
      "interpolation-punctuation": {
        pattern: /^\$\{?|\}$/,
        alias: "punctuation"
      },
      expression: {
        pattern: /[\s\S]+/,
        inside: Prism3.languages.kotlin
      }
    };
    Prism3.languages.insertBefore("kotlin", "string", {
      // https://kotlinlang.org/spec/expressions.html#string-interpolation-expressions
      "string-literal": [
        {
          pattern: /"""(?:[^$]|\$(?:(?!\{)|\{[^{}]*\}))*?"""/,
          alias: "multiline",
          inside: {
            interpolation: {
              pattern: /\$(?:[a-z_]\w*|\{[^{}]*\})/i,
              inside: interpolationInside
            },
            string: /[\s\S]+/
          }
        },
        {
          pattern: /"(?:[^"\\\r\n$]|\\.|\$(?:(?!\{)|\{[^{}]*\}))*"/,
          alias: "singleline",
          inside: {
            interpolation: {
              pattern: /((?:^|[^\\])(?:\\{2})*)\$(?:[a-z_]\w*|\{[^{}]*\})/i,
              lookbehind: true,
              inside: interpolationInside
            },
            string: /[\s\S]+/
          }
        }
      ],
      char: {
        // https://kotlinlang.org/spec/expressions.html#character-literals
        pattern: /'(?:[^'\\\r\n]|\\(?:.|u[a-fA-F0-9]{0,4}))'/,
        greedy: true
      }
    });
    delete Prism3.languages.kotlin["string"];
    Prism3.languages.insertBefore("kotlin", "keyword", {
      annotation: {
        pattern: /\B@(?:\w+:)?(?:[A-Z]\w*|\[[^\]]+\])/,
        alias: "builtin"
      }
    });
    Prism3.languages.insertBefore("kotlin", "function", {
      label: {
        pattern: /\b\w+@|@\w+\b/,
        alias: "symbol"
      }
    });
    Prism3.languages.kt = Prism3.languages.kotlin;
    Prism3.languages.kts = Prism3.languages.kotlin;
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/c.js
c.displayName = "c";
c.aliases = [];
function c(Prism2) {
  Prism2.register(clike);
  Prism2.languages.c = Prism2.languages.extend("clike", {
    comment: {
      pattern: /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,
      greedy: true
    },
    string: {
      // https://en.cppreference.com/w/c/language/string_literal
      pattern: /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
      greedy: true
    },
    "class-name": {
      pattern: /(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,
      lookbehind: true
    },
    keyword: /\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/,
    function: /\b[a-z_]\w*(?=\s*\()/i,
    number: /(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
    operator: />>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/
  });
  Prism2.languages.insertBefore("c", "string", {
    char: {
      // https://en.cppreference.com/w/c/language/character_constant
      pattern: /'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/,
      greedy: true
    }
  });
  Prism2.languages.insertBefore("c", "string", {
    macro: {
      // allow for multiline macro definitions
      // spaces after the # character compile fine with gcc
      pattern: /(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,
      lookbehind: true,
      greedy: true,
      alias: "property",
      inside: {
        string: [
          {
            // highlight the path of the include statement as a string
            pattern: /^(#\s*include\s*)<[^>]+>/,
            lookbehind: true
          },
          Prism2.languages.c["string"]
        ],
        char: Prism2.languages.c["char"],
        comment: Prism2.languages.c["comment"],
        "macro-name": [
          {
            pattern: /(^#\s*define\s+)\w+\b(?!\()/i,
            lookbehind: true
          },
          {
            pattern: /(^#\s*define\s+)\w+\b(?=\()/i,
            lookbehind: true,
            alias: "function"
          }
        ],
        // highlight macro directives as keywords
        directive: {
          pattern: /^(#\s*)[a-z]+/,
          lookbehind: true,
          alias: "keyword"
        },
        "directive-hash": /^#/,
        punctuation: /##|\\(?=[\r\n])/,
        expression: {
          pattern: /\S[\s\S]*/,
          inside: Prism2.languages.c
        }
      }
    }
  });
  Prism2.languages.insertBefore("c", "function", {
    // highlight predefined macros as constants
    constant: /\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/
  });
  delete Prism2.languages.c["boolean"];
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/cpp.js
cpp.displayName = "cpp";
cpp.aliases = [];
function cpp(Prism2) {
  Prism2.register(c);
  (function(Prism3) {
    var keyword = /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|char8_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|final|float|for|friend|goto|if|import|inline|int|int16_t|int32_t|int64_t|int8_t|long|module|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|uint16_t|uint32_t|uint64_t|uint8_t|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/;
    var modName = /\b(?!<keyword>)\w+(?:\s*\.\s*\w+)*\b/.source.replace(
      /<keyword>/g,
      function() {
        return keyword.source;
      }
    );
    Prism3.languages.cpp = Prism3.languages.extend("c", {
      "class-name": [
        {
          pattern: RegExp(
            /(\b(?:class|concept|enum|struct|typename)\s+)(?!<keyword>)\w+/.source.replace(
              /<keyword>/g,
              function() {
                return keyword.source;
              }
            )
          ),
          lookbehind: true
        },
        // This is intended to capture the class name of method implementations like:
        //   void foo::bar() const {}
        // However! The `foo` in the above example could also be a namespace, so we only capture the class name if
        // it starts with an uppercase letter. This approximation should give decent results.
        /\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/,
        // This will capture the class name before destructors like:
        //   Foo::~Foo() {}
        /\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i,
        // This also intends to capture the class name of method implementations but here the class has template
        // parameters, so it can't be a namespace (until C++ adds generic namespaces).
        /\b\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/
      ],
      keyword,
      number: {
        pattern: /(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i,
        greedy: true
      },
      operator: />>=?|<<=?|->|--|\+\+|&&|\|\||[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/,
      boolean: /\b(?:false|true)\b/
    });
    Prism3.languages.insertBefore("cpp", "string", {
      module: {
        // https://en.cppreference.com/w/cpp/language/modules
        pattern: RegExp(
          /(\b(?:import|module)\s+)/.source + "(?:" + // header-name
          /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|<[^<>\r\n]*>/.source + "|" + // module name or partition or both
          /<mod-name>(?:\s*:\s*<mod-name>)?|:\s*<mod-name>/.source.replace(
            /<mod-name>/g,
            function() {
              return modName;
            }
          ) + ")"
        ),
        lookbehind: true,
        greedy: true,
        inside: {
          string: /^[<"][\s\S]+/,
          operator: /:/,
          punctuation: /\./
        }
      },
      "raw-string": {
        pattern: /R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/,
        alias: "string",
        greedy: true
      }
    });
    Prism3.languages.insertBefore("cpp", "keyword", {
      "generic-function": {
        pattern: /\b(?!operator\b)[a-z_]\w*\s*<(?:[^<>]|<[^<>]*>)*>(?=\s*\()/i,
        inside: {
          function: /^\w+/,
          generic: {
            pattern: /<[\s\S]+/,
            alias: "class-name",
            inside: Prism3.languages.cpp
          }
        }
      }
    });
    Prism3.languages.insertBefore("cpp", "operator", {
      "double-colon": {
        pattern: /::/,
        alias: "punctuation"
      }
    });
    Prism3.languages.insertBefore("cpp", "class-name", {
      // the base clause is an optional list of parent classes
      // https://en.cppreference.com/w/cpp/language/class
      "base-clause": {
        pattern: /(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/,
        lookbehind: true,
        greedy: true,
        inside: Prism3.languages.extend("cpp", {})
      }
    });
    Prism3.languages.insertBefore(
      "inside",
      "double-colon",
      {
        // All untokenized words that are not namespaces should be class names
        "class-name": /\b[a-z_]\w*\b(?!\s*::)/i
      },
      Prism3.languages.cpp["base-clause"]
    );
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/csharp.js
csharp.displayName = "csharp";
csharp.aliases = ["cs", "dotnet"];
function csharp(Prism2) {
  Prism2.register(clike);
  (function(Prism3) {
    function replace2(pattern2, replacements) {
      return pattern2.replace(/<<(\d+)>>/g, function(m, index2) {
        return "(?:" + replacements[+index2] + ")";
      });
    }
    function re(pattern2, replacements, flags) {
      return RegExp(replace2(pattern2, replacements), flags || "");
    }
    function nested(pattern2, depthLog2) {
      for (var i = 0; i < depthLog2; i++) {
        pattern2 = pattern2.replace(/<<self>>/g, function() {
          return "(?:" + pattern2 + ")";
        });
      }
      return pattern2.replace(/<<self>>/g, "[^\\s\\S]");
    }
    var keywordKinds = {
      // keywords which represent a return or variable type
      type: "bool byte char decimal double dynamic float int long object sbyte short string uint ulong ushort var void",
      // keywords which are used to declare a type
      typeDeclaration: "class enum interface record struct",
      // contextual keywords
      // ("var" and "dynamic" are missing because they are used like types)
      contextual: "add alias and ascending async await by descending from(?=\\s*(?:\\w|$)) get global group into init(?=\\s*;) join let nameof not notnull on or orderby partial remove select set unmanaged value when where with(?=\\s*{)",
      // all other keywords
      other: "abstract as base break case catch checked const continue default delegate do else event explicit extern finally fixed for foreach goto if implicit in internal is lock namespace new null operator out override params private protected public readonly ref return sealed sizeof stackalloc static switch this throw try typeof unchecked unsafe using virtual volatile while yield"
    };
    function keywordsToPattern(words) {
      return "\\b(?:" + words.trim().replace(/ /g, "|") + ")\\b";
    }
    var typeDeclarationKeywords = keywordsToPattern(
      keywordKinds.typeDeclaration
    );
    var keywords = RegExp(
      keywordsToPattern(
        keywordKinds.type + " " + keywordKinds.typeDeclaration + " " + keywordKinds.contextual + " " + keywordKinds.other
      )
    );
    var nonTypeKeywords = keywordsToPattern(
      keywordKinds.typeDeclaration + " " + keywordKinds.contextual + " " + keywordKinds.other
    );
    var nonContextualKeywords = keywordsToPattern(
      keywordKinds.type + " " + keywordKinds.typeDeclaration + " " + keywordKinds.other
    );
    var generic = nested(/<(?:[^<>;=+\-*/%&|^]|<<self>>)*>/.source, 2);
    var nestedRound = nested(/\((?:[^()]|<<self>>)*\)/.source, 2);
    var name2 = /@?\b[A-Za-z_]\w*\b/.source;
    var genericName = replace2(/<<0>>(?:\s*<<1>>)?/.source, [name2, generic]);
    var identifier = replace2(/(?!<<0>>)<<1>>(?:\s*\.\s*<<1>>)*/.source, [
      nonTypeKeywords,
      genericName
    ]);
    var array = /\[\s*(?:,\s*)*\]/.source;
    var typeExpressionWithoutTuple = replace2(
      /<<0>>(?:\s*(?:\?\s*)?<<1>>)*(?:\s*\?)?/.source,
      [identifier, array]
    );
    var tupleElement = replace2(
      /[^,()<>[\];=+\-*/%&|^]|<<0>>|<<1>>|<<2>>/.source,
      [generic, nestedRound, array]
    );
    var tuple = replace2(/\(<<0>>+(?:,<<0>>+)+\)/.source, [tupleElement]);
    var typeExpression = replace2(
      /(?:<<0>>|<<1>>)(?:\s*(?:\?\s*)?<<2>>)*(?:\s*\?)?/.source,
      [tuple, identifier, array]
    );
    var typeInside = {
      keyword: keywords,
      punctuation: /[<>()?,.:[\]]/
    };
    var character = /'(?:[^\r\n'\\]|\\.|\\[Uux][\da-fA-F]{1,8})'/.source;
    var regularString = /"(?:\\.|[^\\"\r\n])*"/.source;
    var verbatimString = /@"(?:""|\\[\s\S]|[^\\"])*"(?!")/.source;
    Prism3.languages.csharp = Prism3.languages.extend("clike", {
      string: [
        {
          pattern: re(/(^|[^$\\])<<0>>/.source, [verbatimString]),
          lookbehind: true,
          greedy: true
        },
        {
          pattern: re(/(^|[^@$\\])<<0>>/.source, [regularString]),
          lookbehind: true,
          greedy: true
        }
      ],
      "class-name": [
        {
          // Using static
          // using static System.Math;
          pattern: re(/(\busing\s+static\s+)<<0>>(?=\s*;)/.source, [
            identifier
          ]),
          lookbehind: true,
          inside: typeInside
        },
        {
          // Using alias (type)
          // using Project = PC.MyCompany.Project;
          pattern: re(/(\busing\s+<<0>>\s*=\s*)<<1>>(?=\s*;)/.source, [
            name2,
            typeExpression
          ]),
          lookbehind: true,
          inside: typeInside
        },
        {
          // Using alias (alias)
          // using Project = PC.MyCompany.Project;
          pattern: re(/(\busing\s+)<<0>>(?=\s*=)/.source, [name2]),
          lookbehind: true
        },
        {
          // Type declarations
          // class Foo<A, B>
          // interface Foo<out A, B>
          pattern: re(/(\b<<0>>\s+)<<1>>/.source, [
            typeDeclarationKeywords,
            genericName
          ]),
          lookbehind: true,
          inside: typeInside
        },
        {
          // Single catch exception declaration
          // catch(Foo)
          // (things like catch(Foo e) is covered by variable declaration)
          pattern: re(/(\bcatch\s*\(\s*)<<0>>/.source, [identifier]),
          lookbehind: true,
          inside: typeInside
        },
        {
          // Name of the type parameter of generic constraints
          // where Foo : class
          pattern: re(/(\bwhere\s+)<<0>>/.source, [name2]),
          lookbehind: true
        },
        {
          // Casts and checks via as and is.
          // as Foo<A>, is Bar<B>
          // (things like if(a is Foo b) is covered by variable declaration)
          pattern: re(/(\b(?:is(?:\s+not)?|as)\s+)<<0>>/.source, [
            typeExpressionWithoutTuple
          ]),
          lookbehind: true,
          inside: typeInside
        },
        {
          // Variable, field and parameter declaration
          // (Foo bar, Bar baz, Foo[,,] bay, Foo<Bar, FooBar<Bar>> bax)
          pattern: re(
            /\b<<0>>(?=\s+(?!<<1>>|with\s*\{)<<2>>(?:\s*[=,;:{)\]]|\s+(?:in|when)\b))/.source,
            [typeExpression, nonContextualKeywords, name2]
          ),
          inside: typeInside
        }
      ],
      keyword: keywords,
      // https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/lexical-structure#literals
      number: /(?:\b0(?:x[\da-f_]*[\da-f]|b[01_]*[01])|(?:\B\.\d+(?:_+\d+)*|\b\d+(?:_+\d+)*(?:\.\d+(?:_+\d+)*)?)(?:e[-+]?\d+(?:_+\d+)*)?)(?:[dflmu]|lu|ul)?\b/i,
      operator: />>=?|<<=?|[-=]>|([-+&|])\1|~|\?\?=?|[-+*/%&|^!=<>]=?/,
      punctuation: /\?\.?|::|[{}[\];(),.:]/
    });
    Prism3.languages.insertBefore("csharp", "number", {
      range: {
        pattern: /\.\./,
        alias: "operator"
      }
    });
    Prism3.languages.insertBefore("csharp", "punctuation", {
      "named-parameter": {
        pattern: re(/([(,]\s*)<<0>>(?=\s*:)/.source, [name2]),
        lookbehind: true,
        alias: "punctuation"
      }
    });
    Prism3.languages.insertBefore("csharp", "class-name", {
      namespace: {
        // namespace Foo.Bar {}
        // using Foo.Bar;
        pattern: re(
          /(\b(?:namespace|using)\s+)<<0>>(?:\s*\.\s*<<0>>)*(?=\s*[;{])/.source,
          [name2]
        ),
        lookbehind: true,
        inside: {
          punctuation: /\./
        }
      },
      "type-expression": {
        // default(Foo), typeof(Foo<Bar>), sizeof(int)
        pattern: re(
          /(\b(?:default|sizeof|typeof)\s*\(\s*(?!\s))(?:[^()\s]|\s(?!\s)|<<0>>)*(?=\s*\))/.source,
          [nestedRound]
        ),
        lookbehind: true,
        alias: "class-name",
        inside: typeInside
      },
      "return-type": {
        // Foo<Bar> ForBar(); Foo IFoo.Bar() => 0
        // int this[int index] => 0; T IReadOnlyList<T>.this[int index] => this[index];
        // int Foo => 0; int Foo { get; set } = 0;
        pattern: re(
          /<<0>>(?=\s+(?:<<1>>\s*(?:=>|[({]|\.\s*this\s*\[)|this\s*\[))/.source,
          [typeExpression, identifier]
        ),
        inside: typeInside,
        alias: "class-name"
      },
      "constructor-invocation": {
        // new List<Foo<Bar[]>> { }
        pattern: re(/(\bnew\s+)<<0>>(?=\s*[[({])/.source, [typeExpression]),
        lookbehind: true,
        inside: typeInside,
        alias: "class-name"
      },
      /*'explicit-implementation': {
      // int IFoo<Foo>.Bar => 0; void IFoo<Foo<Foo>>.Foo<T>();
      pattern: replace(/\b<<0>>(?=\.<<1>>)/, className, methodOrPropertyDeclaration),
      inside: classNameInside,
      alias: 'class-name'
      },*/
      "generic-method": {
        // foo<Bar>()
        pattern: re(/<<0>>\s*<<1>>(?=\s*\()/.source, [name2, generic]),
        inside: {
          function: re(/^<<0>>/.source, [name2]),
          generic: {
            pattern: RegExp(generic),
            alias: "class-name",
            inside: typeInside
          }
        }
      },
      "type-list": {
        // The list of types inherited or of generic constraints
        // class Foo<F> : Bar, IList<FooBar>
        // where F : Bar, IList<int>
        pattern: re(
          /\b((?:<<0>>\s+<<1>>|record\s+<<1>>\s*<<5>>|where\s+<<2>>)\s*:\s*)(?:<<3>>|<<4>>|<<1>>\s*<<5>>|<<6>>)(?:\s*,\s*(?:<<3>>|<<4>>|<<6>>))*(?=\s*(?:where|[{;]|=>|$))/.source,
          [
            typeDeclarationKeywords,
            genericName,
            name2,
            typeExpression,
            keywords.source,
            nestedRound,
            /\bnew\s*\(\s*\)/.source
          ]
        ),
        lookbehind: true,
        inside: {
          "record-arguments": {
            pattern: re(/(^(?!new\s*\()<<0>>\s*)<<1>>/.source, [
              genericName,
              nestedRound
            ]),
            lookbehind: true,
            greedy: true,
            inside: Prism3.languages.csharp
          },
          keyword: keywords,
          "class-name": {
            pattern: RegExp(typeExpression),
            greedy: true,
            inside: typeInside
          },
          punctuation: /[,()]/
        }
      },
      preprocessor: {
        pattern: /(^[\t ]*)#.*/m,
        lookbehind: true,
        alias: "property",
        inside: {
          // highlight preprocessor directives as keywords
          directive: {
            pattern: /(#)\b(?:define|elif|else|endif|endregion|error|if|line|nullable|pragma|region|undef|warning)\b/,
            lookbehind: true,
            alias: "keyword"
          }
        }
      }
    });
    var regularStringOrCharacter = regularString + "|" + character;
    var regularStringCharacterOrComment = replace2(
      /\/(?![*/])|\/\/[^\r\n]*[\r\n]|\/\*(?:[^*]|\*(?!\/))*\*\/|<<0>>/.source,
      [regularStringOrCharacter]
    );
    var roundExpression = nested(
      replace2(/[^"'/()]|<<0>>|\(<<self>>*\)/.source, [
        regularStringCharacterOrComment
      ]),
      2
    );
    var attrTarget = /\b(?:assembly|event|field|method|module|param|property|return|type)\b/.source;
    var attr = replace2(/<<0>>(?:\s*\(<<1>>*\))?/.source, [
      identifier,
      roundExpression
    ]);
    Prism3.languages.insertBefore("csharp", "class-name", {
      attribute: {
        // Attributes
        // [Foo], [Foo(1), Bar(2, Prop = "foo")], [return: Foo(1), Bar(2)], [assembly: Foo(Bar)]
        pattern: re(
          /((?:^|[^\s\w>)?])\s*\[\s*)(?:<<0>>\s*:\s*)?<<1>>(?:\s*,\s*<<1>>)*(?=\s*\])/.source,
          [attrTarget, attr]
        ),
        lookbehind: true,
        greedy: true,
        inside: {
          target: {
            pattern: re(/^<<0>>(?=\s*:)/.source, [attrTarget]),
            alias: "keyword"
          },
          "attribute-arguments": {
            pattern: re(/\(<<0>>*\)/.source, [roundExpression]),
            inside: Prism3.languages.csharp
          },
          "class-name": {
            pattern: RegExp(identifier),
            inside: {
              punctuation: /\./
            }
          },
          punctuation: /[:,]/
        }
      }
    });
    var formatString = /:[^}\r\n]+/.source;
    var mInterpolationRound = nested(
      replace2(/[^"'/()]|<<0>>|\(<<self>>*\)/.source, [
        regularStringCharacterOrComment
      ]),
      2
    );
    var mInterpolation = replace2(/\{(?!\{)(?:(?![}:])<<0>>)*<<1>>?\}/.source, [
      mInterpolationRound,
      formatString
    ]);
    var sInterpolationRound = nested(
      replace2(
        /[^"'/()]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|<<0>>|\(<<self>>*\)/.source,
        [regularStringOrCharacter]
      ),
      2
    );
    var sInterpolation = replace2(/\{(?!\{)(?:(?![}:])<<0>>)*<<1>>?\}/.source, [
      sInterpolationRound,
      formatString
    ]);
    function createInterpolationInside(interpolation, interpolationRound) {
      return {
        interpolation: {
          pattern: re(/((?:^|[^{])(?:\{\{)*)<<0>>/.source, [interpolation]),
          lookbehind: true,
          inside: {
            "format-string": {
              pattern: re(/(^\{(?:(?![}:])<<0>>)*)<<1>>(?=\}$)/.source, [
                interpolationRound,
                formatString
              ]),
              lookbehind: true,
              inside: {
                punctuation: /^:/
              }
            },
            punctuation: /^\{|\}$/,
            expression: {
              pattern: /[\s\S]+/,
              alias: "language-csharp",
              inside: Prism3.languages.csharp
            }
          }
        },
        string: /[\s\S]+/
      };
    }
    Prism3.languages.insertBefore("csharp", "string", {
      "interpolation-string": [
        {
          pattern: re(
            /(^|[^\\])(?:\$@|@\$)"(?:""|\\[\s\S]|\{\{|<<0>>|[^\\{"])*"/.source,
            [mInterpolation]
          ),
          lookbehind: true,
          greedy: true,
          inside: createInterpolationInside(mInterpolation, mInterpolationRound)
        },
        {
          pattern: re(/(^|[^@\\])\$"(?:\\.|\{\{|<<0>>|[^\\"{])*"/.source, [
            sInterpolation
          ]),
          lookbehind: true,
          greedy: true,
          inside: createInterpolationInside(sInterpolation, sInterpolationRound)
        }
      ],
      char: {
        pattern: RegExp(character),
        greedy: true
      }
    });
    Prism3.languages.dotnet = Prism3.languages.cs = Prism3.languages.csharp;
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/markup-templating.js
markupTemplating.displayName = "markup-templating";
markupTemplating.aliases = [];
function markupTemplating(Prism2) {
  Prism2.register(markup);
  (function(Prism3) {
    function getPlaceholder(language, index2) {
      return "___" + language.toUpperCase() + index2 + "___";
    }
    Object.defineProperties(Prism3.languages["markup-templating"] = {}, {
      buildPlaceholders: {
        /**
         * Tokenize all inline templating expressions matching `placeholderPattern`.
         *
         * If `replaceFilter` is provided, only matches of `placeholderPattern` for which `replaceFilter` returns
         * `true` will be replaced.
         *
         * @param {object} env The environment of the `before-tokenize` hook.
         * @param {string} language The language id.
         * @param {RegExp} placeholderPattern The matches of this pattern will be replaced by placeholders.
         * @param {(match: string) => boolean} [replaceFilter]
         */
        value: function(env, language, placeholderPattern, replaceFilter) {
          if (env.language !== language) {
            return;
          }
          var tokenStack = env.tokenStack = [];
          env.code = env.code.replace(placeholderPattern, function(match) {
            if (typeof replaceFilter === "function" && !replaceFilter(match)) {
              return match;
            }
            var i = tokenStack.length;
            var placeholder;
            while (env.code.indexOf(placeholder = getPlaceholder(language, i)) !== -1) {
              ++i;
            }
            tokenStack[i] = match;
            return placeholder;
          });
          env.grammar = Prism3.languages.markup;
        }
      },
      tokenizePlaceholders: {
        /**
         * Replace placeholders with proper tokens after tokenizing.
         *
         * @param {object} env The environment of the `after-tokenize` hook.
         * @param {string} language The language id.
         */
        value: function(env, language) {
          if (env.language !== language || !env.tokenStack) {
            return;
          }
          env.grammar = Prism3.languages[language];
          var j = 0;
          var keys = Object.keys(env.tokenStack);
          function walkTokens(tokens) {
            for (var i = 0; i < tokens.length; i++) {
              if (j >= keys.length) {
                break;
              }
              var token2 = tokens[i];
              if (typeof token2 === "string" || token2.content && typeof token2.content === "string") {
                var k = keys[j];
                var t = env.tokenStack[k];
                var s2 = typeof token2 === "string" ? token2 : token2.content;
                var placeholder = getPlaceholder(language, k);
                var index2 = s2.indexOf(placeholder);
                if (index2 > -1) {
                  ++j;
                  var before = s2.substring(0, index2);
                  var middle = new Prism3.Token(
                    language,
                    Prism3.tokenize(t, env.grammar),
                    "language-" + language,
                    t
                  );
                  var after = s2.substring(index2 + placeholder.length);
                  var replacement = [];
                  if (before) {
                    replacement.push.apply(replacement, walkTokens([before]));
                  }
                  replacement.push(middle);
                  if (after) {
                    replacement.push.apply(replacement, walkTokens([after]));
                  }
                  if (typeof token2 === "string") {
                    tokens.splice.apply(tokens, [i, 1].concat(replacement));
                  } else {
                    token2.content = replacement;
                  }
                }
              } else if (token2.content) {
                walkTokens(token2.content);
              }
            }
            return tokens;
          }
          walkTokens(env.tokens);
        }
      }
    });
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/php.js
php.displayName = "php";
php.aliases = [];
function php(Prism2) {
  Prism2.register(markupTemplating);
  (function(Prism3) {
    var comment = /\/\*[\s\S]*?\*\/|\/\/.*|#(?!\[).*/;
    var constant = [
      {
        pattern: /\b(?:false|true)\b/i,
        alias: "boolean"
      },
      {
        pattern: /(::\s*)\b[a-z_]\w*\b(?!\s*\()/i,
        greedy: true,
        lookbehind: true
      },
      {
        pattern: /(\b(?:case|const)\s+)\b[a-z_]\w*(?=\s*[;=])/i,
        greedy: true,
        lookbehind: true
      },
      /\b(?:null)\b/i,
      /\b[A-Z_][A-Z0-9_]*\b(?!\s*\()/
    ];
    var number2 = /\b0b[01]+(?:_[01]+)*\b|\b0o[0-7]+(?:_[0-7]+)*\b|\b0x[\da-f]+(?:_[\da-f]+)*\b|(?:\b\d+(?:_\d+)*\.?(?:\d+(?:_\d+)*)?|\B\.\d+)(?:e[+-]?\d+)?/i;
    var operator = /<?=>|\?\?=?|\.{3}|\??->|[!=]=?=?|::|\*\*=?|--|\+\+|&&|\|\||<<|>>|[?~]|[/^|%*&<>.+-]=?/;
    var punctuation = /[{}\[\](),:;]/;
    Prism3.languages.php = {
      delimiter: {
        pattern: /\?>$|^<\?(?:php(?=\s)|=)?/i,
        alias: "important"
      },
      comment,
      variable: /\$+(?:\w+\b|(?=\{))/,
      package: {
        pattern: /(namespace\s+|use\s+(?:function\s+)?)(?:\\?\b[a-z_]\w*)+\b(?!\\)/i,
        lookbehind: true,
        inside: {
          punctuation: /\\/
        }
      },
      "class-name-definition": {
        pattern: /(\b(?:class|enum|interface|trait)\s+)\b[a-z_]\w*(?!\\)\b/i,
        lookbehind: true,
        alias: "class-name"
      },
      "function-definition": {
        pattern: /(\bfunction\s+)[a-z_]\w*(?=\s*\()/i,
        lookbehind: true,
        alias: "function"
      },
      keyword: [
        {
          pattern: /(\(\s*)\b(?:array|bool|boolean|float|int|integer|object|string)\b(?=\s*\))/i,
          alias: "type-casting",
          greedy: true,
          lookbehind: true
        },
        {
          pattern: /([(,?]\s*)\b(?:array(?!\s*\()|bool|callable|(?:false|null)(?=\s*\|)|float|int|iterable|mixed|object|self|static|string)\b(?=\s*\$)/i,
          alias: "type-hint",
          greedy: true,
          lookbehind: true
        },
        {
          pattern: /(\)\s*:\s*(?:\?\s*)?)\b(?:array(?!\s*\()|bool|callable|(?:false|null)(?=\s*\|)|float|int|iterable|mixed|never|object|self|static|string|void)\b/i,
          alias: "return-type",
          greedy: true,
          lookbehind: true
        },
        {
          pattern: /\b(?:array(?!\s*\()|bool|float|int|iterable|mixed|object|string|void)\b/i,
          alias: "type-declaration",
          greedy: true
        },
        {
          pattern: /(\|\s*)(?:false|null)\b|\b(?:false|null)(?=\s*\|)/i,
          alias: "type-declaration",
          greedy: true,
          lookbehind: true
        },
        {
          pattern: /\b(?:parent|self|static)(?=\s*::)/i,
          alias: "static-context",
          greedy: true
        },
        {
          // yield from
          pattern: /(\byield\s+)from\b/i,
          lookbehind: true
        },
        // `class` is always a keyword unlike other keywords
        /\bclass\b/i,
        {
          // https://www.php.net/manual/en/reserved.keywords.php
          //
          // keywords cannot be preceded by "->"
          // the complex lookbehind means `(?<!(?:->|::)\s*)`
          pattern: /((?:^|[^\s>:]|(?:^|[^-])>|(?:^|[^:]):)\s*)\b(?:abstract|and|array|as|break|callable|case|catch|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|enum|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|match|namespace|never|new|or|parent|print|private|protected|public|readonly|require|require_once|return|self|static|switch|throw|trait|try|unset|use|var|while|xor|yield|__halt_compiler)\b/i,
          lookbehind: true
        }
      ],
      "argument-name": {
        pattern: /([(,]\s*)\b[a-z_]\w*(?=\s*:(?!:))/i,
        lookbehind: true
      },
      "class-name": [
        {
          pattern: /(\b(?:extends|implements|instanceof|new(?!\s+self|\s+static))\s+|\bcatch\s*\()\b[a-z_]\w*(?!\\)\b/i,
          greedy: true,
          lookbehind: true
        },
        {
          pattern: /(\|\s*)\b[a-z_]\w*(?!\\)\b/i,
          greedy: true,
          lookbehind: true
        },
        {
          pattern: /\b[a-z_]\w*(?!\\)\b(?=\s*\|)/i,
          greedy: true
        },
        {
          pattern: /(\|\s*)(?:\\?\b[a-z_]\w*)+\b/i,
          alias: "class-name-fully-qualified",
          greedy: true,
          lookbehind: true,
          inside: {
            punctuation: /\\/
          }
        },
        {
          pattern: /(?:\\?\b[a-z_]\w*)+\b(?=\s*\|)/i,
          alias: "class-name-fully-qualified",
          greedy: true,
          inside: {
            punctuation: /\\/
          }
        },
        {
          pattern: /(\b(?:extends|implements|instanceof|new(?!\s+self\b|\s+static\b))\s+|\bcatch\s*\()(?:\\?\b[a-z_]\w*)+\b(?!\\)/i,
          alias: "class-name-fully-qualified",
          greedy: true,
          lookbehind: true,
          inside: {
            punctuation: /\\/
          }
        },
        {
          pattern: /\b[a-z_]\w*(?=\s*\$)/i,
          alias: "type-declaration",
          greedy: true
        },
        {
          pattern: /(?:\\?\b[a-z_]\w*)+(?=\s*\$)/i,
          alias: ["class-name-fully-qualified", "type-declaration"],
          greedy: true,
          inside: {
            punctuation: /\\/
          }
        },
        {
          pattern: /\b[a-z_]\w*(?=\s*::)/i,
          alias: "static-context",
          greedy: true
        },
        {
          pattern: /(?:\\?\b[a-z_]\w*)+(?=\s*::)/i,
          alias: ["class-name-fully-qualified", "static-context"],
          greedy: true,
          inside: {
            punctuation: /\\/
          }
        },
        {
          pattern: /([(,?]\s*)[a-z_]\w*(?=\s*\$)/i,
          alias: "type-hint",
          greedy: true,
          lookbehind: true
        },
        {
          pattern: /([(,?]\s*)(?:\\?\b[a-z_]\w*)+(?=\s*\$)/i,
          alias: ["class-name-fully-qualified", "type-hint"],
          greedy: true,
          lookbehind: true,
          inside: {
            punctuation: /\\/
          }
        },
        {
          pattern: /(\)\s*:\s*(?:\?\s*)?)\b[a-z_]\w*(?!\\)\b/i,
          alias: "return-type",
          greedy: true,
          lookbehind: true
        },
        {
          pattern: /(\)\s*:\s*(?:\?\s*)?)(?:\\?\b[a-z_]\w*)+\b(?!\\)/i,
          alias: ["class-name-fully-qualified", "return-type"],
          greedy: true,
          lookbehind: true,
          inside: {
            punctuation: /\\/
          }
        }
      ],
      constant,
      function: {
        pattern: /(^|[^\\\w])\\?[a-z_](?:[\w\\]*\w)?(?=\s*\()/i,
        lookbehind: true,
        inside: {
          punctuation: /\\/
        }
      },
      property: {
        pattern: /(->\s*)\w+/,
        lookbehind: true
      },
      number: number2,
      operator,
      punctuation
    };
    var string_interpolation = {
      pattern: /\{\$(?:\{(?:\{[^{}]+\}|[^{}]+)\}|[^{}])+\}|(^|[^\\{])\$+(?:\w+(?:\[[^\r\n\[\]]+\]|->\w+)?)/,
      lookbehind: true,
      inside: Prism3.languages.php
    };
    var string = [
      {
        pattern: /<<<'([^']+)'[\r\n](?:.*[\r\n])*?\1;/,
        alias: "nowdoc-string",
        greedy: true,
        inside: {
          delimiter: {
            pattern: /^<<<'[^']+'|[a-z_]\w*;$/i,
            alias: "symbol",
            inside: {
              punctuation: /^<<<'?|[';]$/
            }
          }
        }
      },
      {
        pattern: /<<<(?:"([^"]+)"[\r\n](?:.*[\r\n])*?\1;|([a-z_]\w*)[\r\n](?:.*[\r\n])*?\2;)/i,
        alias: "heredoc-string",
        greedy: true,
        inside: {
          delimiter: {
            pattern: /^<<<(?:"[^"]+"|[a-z_]\w*)|[a-z_]\w*;$/i,
            alias: "symbol",
            inside: {
              punctuation: /^<<<"?|[";]$/
            }
          },
          interpolation: string_interpolation
        }
      },
      {
        pattern: /`(?:\\[\s\S]|[^\\`])*`/,
        alias: "backtick-quoted-string",
        greedy: true
      },
      {
        pattern: /'(?:\\[\s\S]|[^\\'])*'/,
        alias: "single-quoted-string",
        greedy: true
      },
      {
        pattern: /"(?:\\[\s\S]|[^\\"])*"/,
        alias: "double-quoted-string",
        greedy: true,
        inside: {
          interpolation: string_interpolation
        }
      }
    ];
    Prism3.languages.insertBefore("php", "variable", {
      string,
      attribute: {
        pattern: /#\[(?:[^"'\/#]|\/(?![*/])|\/\/.*$|#(?!\[).*$|\/\*(?:[^*]|\*(?!\/))*\*\/|"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*')+\](?=\s*[a-z$#])/im,
        greedy: true,
        inside: {
          "attribute-content": {
            pattern: /^(#\[)[\s\S]+(?=\]$)/,
            lookbehind: true,
            // inside can appear subset of php
            inside: {
              comment,
              string,
              "attribute-class-name": [
                {
                  pattern: /([^:]|^)\b[a-z_]\w*(?!\\)\b/i,
                  alias: "class-name",
                  greedy: true,
                  lookbehind: true
                },
                {
                  pattern: /([^:]|^)(?:\\?\b[a-z_]\w*)+/i,
                  alias: ["class-name", "class-name-fully-qualified"],
                  greedy: true,
                  lookbehind: true,
                  inside: {
                    punctuation: /\\/
                  }
                }
              ],
              constant,
              number: number2,
              operator,
              punctuation
            }
          },
          delimiter: {
            pattern: /^#\[|\]$/,
            alias: "punctuation"
          }
        }
      }
    });
    Prism3.hooks.add("before-tokenize", function(env) {
      if (!/<\?/.test(env.code)) {
        return;
      }
      var phpPattern = /<\?(?:[^"'/#]|\/(?![*/])|("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|(?:\/\/|#(?!\[))(?:[^?\n\r]|\?(?!>))*(?=$|\?>|[\r\n])|#\[|\/\*(?:[^*]|\*(?!\/))*(?:\*\/|$))*?(?:\?>|$)/g;
      Prism3.languages["markup-templating"].buildPlaceholders(
        env,
        "php",
        phpPattern
      );
    });
    Prism3.hooks.add("after-tokenize", function(env) {
      Prism3.languages["markup-templating"].tokenizePlaceholders(env, "php");
    });
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/ruby.js
ruby.displayName = "ruby";
ruby.aliases = ["rb"];
function ruby(Prism2) {
  Prism2.register(clike);
  (function(Prism3) {
    Prism3.languages.ruby = Prism3.languages.extend("clike", {
      comment: {
        pattern: /#.*|^=begin\s[\s\S]*?^=end/m,
        greedy: true
      },
      "class-name": {
        pattern: /(\b(?:class|module)\s+|\bcatch\s+\()[\w.\\]+|\b[A-Z_]\w*(?=\s*\.\s*new\b)/,
        lookbehind: true,
        inside: {
          punctuation: /[.\\]/
        }
      },
      keyword: /\b(?:BEGIN|END|alias|and|begin|break|case|class|def|define_method|defined|do|each|else|elsif|end|ensure|extend|for|if|in|include|module|new|next|nil|not|or|prepend|private|protected|public|raise|redo|require|rescue|retry|return|self|super|then|throw|undef|unless|until|when|while|yield)\b/,
      operator: /\.{2,3}|&\.|===|<?=>|[!=]?~|(?:&&|\|\||<<|>>|\*\*|[+\-*/%<>!^&|=])=?|[?:]/,
      punctuation: /[(){}[\].,;]/
    });
    Prism3.languages.insertBefore("ruby", "operator", {
      "double-colon": {
        pattern: /::/,
        alias: "punctuation"
      }
    });
    var interpolation = {
      pattern: /((?:^|[^\\])(?:\\{2})*)#\{(?:[^{}]|\{[^{}]*\})*\}/,
      lookbehind: true,
      inside: {
        content: {
          pattern: /^(#\{)[\s\S]+(?=\}$)/,
          lookbehind: true,
          inside: Prism3.languages.ruby
        },
        delimiter: {
          pattern: /^#\{|\}$/,
          alias: "punctuation"
        }
      }
    };
    delete Prism3.languages.ruby.function;
    var percentExpression = "(?:" + [
      /([^a-zA-Z0-9\s{(\[<=])(?:(?!\1)[^\\]|\\[\s\S])*\1/.source,
      /\((?:[^()\\]|\\[\s\S]|\((?:[^()\\]|\\[\s\S])*\))*\)/.source,
      /\{(?:[^{}\\]|\\[\s\S]|\{(?:[^{}\\]|\\[\s\S])*\})*\}/.source,
      /\[(?:[^\[\]\\]|\\[\s\S]|\[(?:[^\[\]\\]|\\[\s\S])*\])*\]/.source,
      /<(?:[^<>\\]|\\[\s\S]|<(?:[^<>\\]|\\[\s\S])*>)*>/.source
    ].join("|") + ")";
    var symbolName = /(?:"(?:\\.|[^"\\\r\n])*"|(?:\b[a-zA-Z_]\w*|[^\s\0-\x7F]+)[?!]?|\$.)/.source;
    Prism3.languages.insertBefore("ruby", "keyword", {
      "regex-literal": [
        {
          pattern: RegExp(
            /%r/.source + percentExpression + /[egimnosux]{0,6}/.source
          ),
          greedy: true,
          inside: {
            interpolation,
            regex: /[\s\S]+/
          }
        },
        {
          pattern: /(^|[^/])\/(?!\/)(?:\[[^\r\n\]]+\]|\\.|[^[/\\\r\n])+\/[egimnosux]{0,6}(?=\s*(?:$|[\r\n,.;})#]))/,
          lookbehind: true,
          greedy: true,
          inside: {
            interpolation,
            regex: /[\s\S]+/
          }
        }
      ],
      variable: /[@$]+[a-zA-Z_]\w*(?:[?!]|\b)/,
      symbol: [
        {
          pattern: RegExp(/(^|[^:]):/.source + symbolName),
          lookbehind: true,
          greedy: true
        },
        {
          pattern: RegExp(
            /([\r\n{(,][ \t]*)/.source + symbolName + /(?=:(?!:))/.source
          ),
          lookbehind: true,
          greedy: true
        }
      ],
      "method-definition": {
        pattern: /(\bdef\s+)\w+(?:\s*\.\s*\w+)?/,
        lookbehind: true,
        inside: {
          function: /\b\w+$/,
          keyword: /^self\b/,
          "class-name": /^\w+/,
          punctuation: /\./
        }
      }
    });
    Prism3.languages.insertBefore("ruby", "string", {
      "string-literal": [
        {
          pattern: RegExp(/%[qQiIwWs]?/.source + percentExpression),
          greedy: true,
          inside: {
            interpolation,
            string: /[\s\S]+/
          }
        },
        {
          pattern: /("|')(?:#\{[^}]+\}|#(?!\{)|\\(?:\r\n|[\s\S])|(?!\1)[^\\#\r\n])*\1/,
          greedy: true,
          inside: {
            interpolation,
            string: /[\s\S]+/
          }
        },
        {
          pattern: /<<[-~]?([a-z_]\w*)[\r\n](?:.*[\r\n])*?[\t ]*\1/i,
          alias: "heredoc-string",
          greedy: true,
          inside: {
            delimiter: {
              pattern: /^<<[-~]?[a-z_]\w*|\b[a-z_]\w*$/i,
              inside: {
                symbol: /\b\w+/,
                punctuation: /^<<[-~]?/
              }
            },
            interpolation,
            string: /[\s\S]+/
          }
        },
        {
          pattern: /<<[-~]?'([a-z_]\w*)'[\r\n](?:.*[\r\n])*?[\t ]*\1/i,
          alias: "heredoc-string",
          greedy: true,
          inside: {
            delimiter: {
              pattern: /^<<[-~]?'[a-z_]\w*'|\b[a-z_]\w*$/i,
              inside: {
                symbol: /\b\w+/,
                punctuation: /^<<[-~]?'|'$/
              }
            },
            string: /[\s\S]+/
          }
        }
      ],
      "command-literal": [
        {
          pattern: RegExp(/%x/.source + percentExpression),
          greedy: true,
          inside: {
            interpolation,
            command: {
              pattern: /[\s\S]+/,
              alias: "string"
            }
          }
        },
        {
          pattern: /`(?:#\{[^}]+\}|#(?!\{)|\\(?:\r\n|[\s\S])|[^\\`#\r\n])*`/,
          greedy: true,
          inside: {
            interpolation,
            command: {
              pattern: /[\s\S]+/,
              alias: "string"
            }
          }
        }
      ]
    });
    delete Prism3.languages.ruby.string;
    Prism3.languages.insertBefore("ruby", "number", {
      builtin: /\b(?:Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Fixnum|Float|Hash|IO|Integer|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|Stat|String|Struct|Symbol|TMS|Thread|ThreadGroup|Time|TrueClass)\b/,
      constant: /\b[A-Z][A-Z0-9_]*(?:[?!]|\b)/
    });
    Prism3.languages.rb = Prism3.languages.ruby;
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/swift.js
swift.displayName = "swift";
swift.aliases = [];
function swift(Prism2) {
  Prism2.languages.swift = {
    comment: {
      // Nested comments are supported up to 2 levels
      pattern: /(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/,
      lookbehind: true,
      greedy: true
    },
    "string-literal": [
      // https://docs.swift.org/swift-book/LanguageGuide/StringsAndCharacters.html
      {
        pattern: RegExp(
          /(^|[^"#])/.source + "(?:" + // single-line string
          /"(?:\\(?:\((?:[^()]|\([^()]*\))*\)|\r\n|[^(])|[^\\\r\n"])*"/.source + "|" + // multi-line string
          /"""(?:\\(?:\((?:[^()]|\([^()]*\))*\)|[^(])|[^\\"]|"(?!""))*"""/.source + ")" + /(?!["#])/.source
        ),
        lookbehind: true,
        greedy: true,
        inside: {
          interpolation: {
            pattern: /(\\\()(?:[^()]|\([^()]*\))*(?=\))/,
            lookbehind: true,
            inside: null
            // see below
          },
          "interpolation-punctuation": {
            pattern: /^\)|\\\($/,
            alias: "punctuation"
          },
          punctuation: /\\(?=[\r\n])/,
          string: /[\s\S]+/
        }
      },
      {
        pattern: RegExp(
          /(^|[^"#])(#+)/.source + "(?:" + // single-line string
          /"(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|\r\n|[^#])|[^\\\r\n])*?"/.source + "|" + // multi-line string
          /"""(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|[^#])|[^\\])*?"""/.source + ")\\2"
        ),
        lookbehind: true,
        greedy: true,
        inside: {
          interpolation: {
            pattern: /(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/,
            lookbehind: true,
            inside: null
            // see below
          },
          "interpolation-punctuation": {
            pattern: /^\)|\\#+\($/,
            alias: "punctuation"
          },
          string: /[\s\S]+/
        }
      }
    ],
    directive: {
      // directives with conditions
      pattern: RegExp(
        /#/.source + "(?:" + (/(?:elseif|if)\b/.source + "(?:[ 	]*" + // This regex is a little complex. It's equivalent to this:
        //   (?:![ \t]*)?(?:\b\w+\b(?:[ \t]*<round>)?|<round>)(?:[ \t]*(?:&&|\|\|))?
        // where <round> is a general parentheses expression.
        /(?:![ \t]*)?(?:\b\w+\b(?:[ \t]*\((?:[^()]|\([^()]*\))*\))?|\((?:[^()]|\([^()]*\))*\))(?:[ \t]*(?:&&|\|\|))?/.source + ")+") + "|" + /(?:else|endif)\b/.source + ")"
      ),
      alias: "property",
      inside: {
        "directive-name": /^#\w+/,
        boolean: /\b(?:false|true)\b/,
        number: /\b\d+(?:\.\d+)*\b/,
        operator: /!|&&|\|\||[<>]=?/,
        punctuation: /[(),]/
      }
    },
    literal: {
      pattern: /#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/,
      alias: "constant"
    },
    "other-directive": {
      pattern: /#\w+\b/,
      alias: "property"
    },
    attribute: {
      pattern: /@\w+/,
      alias: "atrule"
    },
    "function-definition": {
      pattern: /(\bfunc\s+)\w+/,
      lookbehind: true,
      alias: "function"
    },
    label: {
      // https://docs.swift.org/swift-book/LanguageGuide/ControlFlow.html#ID141
      pattern: /\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/,
      lookbehind: true,
      alias: "important"
    },
    keyword: /\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/,
    boolean: /\b(?:false|true)\b/,
    nil: {
      pattern: /\bnil\b/,
      alias: "constant"
    },
    "short-argument": /\$\d+\b/,
    omit: {
      pattern: /\b_\b/,
      alias: "keyword"
    },
    number: /\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,
    // A class name must start with an upper-case letter and be either 1 letter long or contain a lower-case letter.
    "class-name": /\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/,
    function: /\b[a-z_]\w*(?=\s*\()/i,
    constant: /\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,
    // Operators are generic in Swift. Developers can even create new operators (e.g. +++).
    // https://docs.swift.org/swift-book/ReferenceManual/zzSummaryOfTheGrammar.html#ID481
    // This regex only supports ASCII operators.
    operator: /[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/,
    punctuation: /[{}[\]();,.:\\]/
  };
  Prism2.languages.swift["string-literal"].forEach(function(rule) {
    rule.inside["interpolation"].inside = Prism2.languages.swift;
  });
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/lua.js
lua.displayName = "lua";
lua.aliases = [];
function lua(Prism2) {
  Prism2.languages.lua = {
    comment: /^#!.+|--(?:\[(=*)\[[\s\S]*?\]\1\]|.*)/m,
    // \z may be used to skip the following space
    string: {
      pattern: /(["'])(?:(?!\1)[^\\\r\n]|\\z(?:\r\n|\s)|\\(?:\r\n|[^z]))*\1|\[(=*)\[[\s\S]*?\]\2\]/,
      greedy: true
    },
    number: /\b0x[a-f\d]+(?:\.[a-f\d]*)?(?:p[+-]?\d+)?\b|\b\d+(?:\.\B|(?:\.\d*)?(?:e[+-]?\d+)?\b)|\B\.\d+(?:e[+-]?\d+)?\b/i,
    keyword: /\b(?:and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b/,
    function: /(?!\d)\w+(?=\s*(?:[({]))/,
    operator: [
      /[-+*%^&|#]|\/\/?|<[<=]?|>[>=]?|[=~]=?/,
      {
        // Match ".." but don't break "..."
        pattern: /(^|[^.])\.\.(?!\.)/,
        lookbehind: true
      }
    ],
    punctuation: /[\[\](){},;]|\.+|:+/
  };
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/bash.js
bash.displayName = "bash";
bash.aliases = ["sh", "shell"];
function bash(Prism2) {
  ;
  (function(Prism3) {
    var envVars = "\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b";
    var commandAfterHeredoc = {
      pattern: /(^(["']?)\w+\2)[ \t]+\S.*/,
      lookbehind: true,
      alias: "punctuation",
      // this looks reasonably well in all themes
      inside: null
      // see below
    };
    var insideString = {
      bash: commandAfterHeredoc,
      environment: {
        pattern: RegExp("\\$" + envVars),
        alias: "constant"
      },
      variable: [
        // [0]: Arithmetic Environment
        {
          pattern: /\$?\(\([\s\S]+?\)\)/,
          greedy: true,
          inside: {
            // If there is a $ sign at the beginning highlight $(( and )) as variable
            variable: [
              {
                pattern: /(^\$\(\([\s\S]+)\)\)/,
                lookbehind: true
              },
              /^\$\(\(/
            ],
            number: /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/,
            // Operators according to https://www.gnu.org/software/bash/manual/bashref.html#Shell-Arithmetic
            operator: /--|\+\+|\*\*=?|<<=?|>>=?|&&|\|\||[=!+\-*/%<>^&|]=?|[?~:]/,
            // If there is no $ sign at the beginning highlight (( and )) as punctuation
            punctuation: /\(\(?|\)\)?|,|;/
          }
        },
        // [1]: Command Substitution
        {
          pattern: /\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,
          greedy: true,
          inside: {
            variable: /^\$\(|^`|\)$|`$/
          }
        },
        // [2]: Brace expansion
        {
          pattern: /\$\{[^}]+\}/,
          greedy: true,
          inside: {
            operator: /:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,
            punctuation: /[\[\]]/,
            environment: {
              pattern: RegExp("(\\{)" + envVars),
              lookbehind: true,
              alias: "constant"
            }
          }
        },
        /\$(?:\w+|[#?*!@$])/
      ],
      // Escape sequences from echo and printf's manuals, and escaped quotes.
      entity: /\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2})/
    };
    Prism3.languages.bash = {
      shebang: {
        pattern: /^#!\s*\/.*/,
        alias: "important"
      },
      comment: {
        pattern: /(^|[^"{\\$])#.*/,
        lookbehind: true
      },
      "function-name": [
        // a) function foo {
        // b) foo() {
        // c) function foo() {
        // but not “foo {”
        {
          // a) and c)
          pattern: /(\bfunction\s+)[\w-]+(?=(?:\s*\(?:\s*\))?\s*\{)/,
          lookbehind: true,
          alias: "function"
        },
        {
          // b)
          pattern: /\b[\w-]+(?=\s*\(\s*\)\s*\{)/,
          alias: "function"
        }
      ],
      // Highlight variable names as variables in for and select beginnings.
      "for-or-select": {
        pattern: /(\b(?:for|select)\s+)\w+(?=\s+in\s)/,
        alias: "variable",
        lookbehind: true
      },
      // Highlight variable names as variables in the left-hand part
      // of assignments (“=” and “+=”).
      "assign-left": {
        pattern: /(^|[\s;|&]|[<>]\()\w+(?:\.\w+)*(?=\+?=)/,
        inside: {
          environment: {
            pattern: RegExp("(^|[\\s;|&]|[<>]\\()" + envVars),
            lookbehind: true,
            alias: "constant"
          }
        },
        alias: "variable",
        lookbehind: true
      },
      // Highlight parameter names as variables
      parameter: {
        pattern: /(^|\s)-{1,2}(?:\w+:[+-]?)?\w+(?:\.\w+)*(?=[=\s]|$)/,
        alias: "variable",
        lookbehind: true
      },
      string: [
        // Support for Here-documents https://en.wikipedia.org/wiki/Here_document
        {
          pattern: /((?:^|[^<])<<-?\s*)(\w+)\s[\s\S]*?(?:\r?\n|\r)\2/,
          lookbehind: true,
          greedy: true,
          inside: insideString
        },
        // Here-document with quotes around the tag
        // → No expansion (so no “inside”).
        {
          pattern: /((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,
          lookbehind: true,
          greedy: true,
          inside: {
            bash: commandAfterHeredoc
          }
        },
        // “Normal” string
        {
          // https://www.gnu.org/software/bash/manual/html_node/Double-Quotes.html
          pattern: /(^|[^\\](?:\\\\)*)"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/,
          lookbehind: true,
          greedy: true,
          inside: insideString
        },
        {
          // https://www.gnu.org/software/bash/manual/html_node/Single-Quotes.html
          pattern: /(^|[^$\\])'[^']*'/,
          lookbehind: true,
          greedy: true
        },
        {
          // https://www.gnu.org/software/bash/manual/html_node/ANSI_002dC-Quoting.html
          pattern: /\$'(?:[^'\\]|\\[\s\S])*'/,
          greedy: true,
          inside: {
            entity: insideString.entity
          }
        }
      ],
      environment: {
        pattern: RegExp("\\$?" + envVars),
        alias: "constant"
      },
      variable: insideString.variable,
      function: {
        pattern: /(^|[\s;|&]|[<>]\()(?:add|apropos|apt|apt-cache|apt-get|aptitude|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cargo|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|docker|docker-compose|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|java|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|node|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|podman|podman-compose|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|sysctl|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vcpkg|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,
        lookbehind: true
      },
      keyword: {
        pattern: /(^|[\s;|&]|[<>]\()(?:case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while)(?=$|[)\s;|&])/,
        lookbehind: true
      },
      // https://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
      builtin: {
        pattern: /(^|[\s;|&]|[<>]\()(?:\.|:|alias|bind|break|builtin|caller|cd|command|continue|declare|echo|enable|eval|exec|exit|export|getopts|hash|help|let|local|logout|mapfile|printf|pwd|read|readarray|readonly|return|set|shift|shopt|source|test|times|trap|type|typeset|ulimit|umask|unalias|unset)(?=$|[)\s;|&])/,
        lookbehind: true,
        // Alias added to make those easier to distinguish from strings.
        alias: "class-name"
      },
      boolean: {
        pattern: /(^|[\s;|&]|[<>]\()(?:false|true)(?=$|[)\s;|&])/,
        lookbehind: true
      },
      "file-descriptor": {
        pattern: /\B&\d\b/,
        alias: "important"
      },
      operator: {
        // Lots of redirections here, but not just that.
        pattern: /\d?<>|>\||\+=|=[=~]?|!=?|<<[<-]?|[&\d]?>>|\d[<>]&?|[<>][&=]?|&[>&]?|\|[&|]?/,
        inside: {
          "file-descriptor": {
            pattern: /^\d/,
            alias: "important"
          }
        }
      },
      punctuation: /\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,
      number: {
        pattern: /(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,
        lookbehind: true
      }
    };
    commandAfterHeredoc.inside = Prism3.languages.bash;
    var toBeCopied = [
      "comment",
      "function-name",
      "for-or-select",
      "assign-left",
      "parameter",
      "string",
      "environment",
      "function",
      "keyword",
      "builtin",
      "boolean",
      "file-descriptor",
      "operator",
      "punctuation",
      "number"
    ];
    var inside = insideString.variable[1].inside;
    for (var i = 0; i < toBeCopied.length; i++) {
      inside[toBeCopied[i]] = Prism3.languages.bash[toBeCopied[i]];
    }
    Prism3.languages.sh = Prism3.languages.bash;
    Prism3.languages.shell = Prism3.languages.bash;
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/batch.js
batch.displayName = "batch";
batch.aliases = [];
function batch(Prism2) {
  ;
  (function(Prism3) {
    var variable = /%%?[~:\w]+%?|!\S+!/;
    var parameter = {
      pattern: /\/[a-z?]+(?=[ :]|$):?|-[a-z]\b|--[a-z-]+\b/im,
      alias: "attr-name",
      inside: {
        punctuation: /:/
      }
    };
    var string = /"(?:[\\"]"|[^"])*"(?!")/;
    var number2 = /(?:\b|-)\d+\b/;
    Prism3.languages.batch = {
      comment: [
        /^::.*/m,
        {
          pattern: /((?:^|[&(])[ \t]*)rem\b(?:[^^&)\r\n]|\^(?:\r\n|[\s\S]))*/im,
          lookbehind: true
        }
      ],
      label: {
        pattern: /^:.*/m,
        alias: "property"
      },
      command: [
        {
          // FOR command
          pattern: /((?:^|[&(])[ \t]*)for(?: \/[a-z?](?:[ :](?:"[^"]*"|[^\s"/]\S*))?)* \S+ in \([^)]+\) do/im,
          lookbehind: true,
          inside: {
            keyword: /\b(?:do|in)\b|^for\b/i,
            string,
            parameter,
            variable,
            number: number2,
            punctuation: /[()',]/
          }
        },
        {
          // IF command
          pattern: /((?:^|[&(])[ \t]*)if(?: \/[a-z?](?:[ :](?:"[^"]*"|[^\s"/]\S*))?)* (?:not )?(?:cmdextversion \d+|defined \w+|errorlevel \d+|exist \S+|(?:"[^"]*"|(?!")(?:(?!==)\S)+)?(?:==| (?:equ|geq|gtr|leq|lss|neq) )(?:"[^"]*"|[^\s"]\S*))/im,
          lookbehind: true,
          inside: {
            keyword: /\b(?:cmdextversion|defined|errorlevel|exist|not)\b|^if\b/i,
            string,
            parameter,
            variable,
            number: number2,
            operator: /\^|==|\b(?:equ|geq|gtr|leq|lss|neq)\b/i
          }
        },
        {
          // ELSE command
          pattern: /((?:^|[&()])[ \t]*)else\b/im,
          lookbehind: true,
          inside: {
            keyword: /^else\b/i
          }
        },
        {
          // SET command
          pattern: /((?:^|[&(])[ \t]*)set(?: \/[a-z](?:[ :](?:"[^"]*"|[^\s"/]\S*))?)* (?:[^^&)\r\n]|\^(?:\r\n|[\s\S]))*/im,
          lookbehind: true,
          inside: {
            keyword: /^set\b/i,
            string,
            parameter,
            variable: [variable, /\w+(?=(?:[*\/%+\-&^|]|<<|>>)?=)/],
            number: number2,
            operator: /[*\/%+\-&^|]=?|<<=?|>>=?|[!~_=]/,
            punctuation: /[()',]/
          }
        },
        {
          // Other commands
          pattern: /((?:^|[&(])[ \t]*@?)\w+\b(?:"(?:[\\"]"|[^"])*"(?!")|[^"^&)\r\n]|\^(?:\r\n|[\s\S]))*/m,
          lookbehind: true,
          inside: {
            keyword: /^\w+\b/,
            string,
            parameter,
            label: {
              pattern: /(^\s*):\S+/m,
              lookbehind: true,
              alias: "property"
            },
            variable,
            number: number2,
            operator: /\^/
          }
        }
      ],
      operator: /[&@]/,
      punctuation: /[()']/
    };
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/powershell.js
powershell.displayName = "powershell";
powershell.aliases = [];
function powershell(Prism2) {
  ;
  (function(Prism3) {
    var powershell2 = Prism3.languages.powershell = {
      comment: [
        {
          pattern: /(^|[^`])<#[\s\S]*?#>/,
          lookbehind: true
        },
        {
          pattern: /(^|[^`])#.*/,
          lookbehind: true
        }
      ],
      string: [
        {
          pattern: /"(?:`[\s\S]|[^`"])*"/,
          greedy: true,
          inside: null
          // see below
        },
        {
          pattern: /'(?:[^']|'')*'/,
          greedy: true
        }
      ],
      // Matches name spaces as well as casts, attribute decorators. Force starting with letter to avoid matching array indices
      // Supports two levels of nested brackets (e.g. `[OutputType([System.Collections.Generic.List[int]])]`)
      namespace: /\[[a-z](?:\[(?:\[[^\]]*\]|[^\[\]])*\]|[^\[\]])*\]/i,
      boolean: /\$(?:false|true)\b/i,
      variable: /\$\w+\b/,
      // Cmdlets and aliases. Aliases should come last, otherwise "write" gets preferred over "write-host" for example
      // Get-Command | ?{ $_.ModuleName -match "Microsoft.PowerShell.(Util|Core|Management)" }
      // Get-Alias | ?{ $_.ReferencedCommand.Module.Name -match "Microsoft.PowerShell.(Util|Core|Management)" }
      function: [
        /\b(?:Add|Approve|Assert|Backup|Block|Checkpoint|Clear|Close|Compare|Complete|Compress|Confirm|Connect|Convert|ConvertFrom|ConvertTo|Copy|Debug|Deny|Disable|Disconnect|Dismount|Edit|Enable|Enter|Exit|Expand|Export|Find|ForEach|Format|Get|Grant|Group|Hide|Import|Initialize|Install|Invoke|Join|Limit|Lock|Measure|Merge|Move|New|Open|Optimize|Out|Ping|Pop|Protect|Publish|Push|Read|Receive|Redo|Register|Remove|Rename|Repair|Request|Reset|Resize|Resolve|Restart|Restore|Resume|Revoke|Save|Search|Select|Send|Set|Show|Skip|Sort|Split|Start|Step|Stop|Submit|Suspend|Switch|Sync|Tee|Test|Trace|Unblock|Undo|Uninstall|Unlock|Unprotect|Unpublish|Unregister|Update|Use|Wait|Watch|Where|Write)-[a-z]+\b/i,
        /\b(?:ac|cat|chdir|clc|cli|clp|clv|compare|copy|cp|cpi|cpp|cvpa|dbp|del|diff|dir|ebp|echo|epal|epcsv|epsn|erase|fc|fl|ft|fw|gal|gbp|gc|gci|gcs|gdr|gi|gl|gm|gp|gps|group|gsv|gu|gv|gwmi|iex|ii|ipal|ipcsv|ipsn|irm|iwmi|iwr|kill|lp|ls|measure|mi|mount|move|mp|mv|nal|ndr|ni|nv|ogv|popd|ps|pushd|pwd|rbp|rd|rdr|ren|ri|rm|rmdir|rni|rnp|rp|rv|rvpa|rwmi|sal|saps|sasv|sbp|sc|select|set|shcm|si|sl|sleep|sls|sort|sp|spps|spsv|start|sv|swmi|tee|trcm|type|write)\b/i
      ],
      // per http://technet.microsoft.com/en-us/library/hh847744.aspx
      keyword: /\b(?:Begin|Break|Catch|Class|Continue|Data|Define|Do|DynamicParam|Else|ElseIf|End|Exit|Filter|Finally|For|ForEach|From|Function|If|InlineScript|Parallel|Param|Process|Return|Sequence|Switch|Throw|Trap|Try|Until|Using|Var|While|Workflow)\b/i,
      operator: {
        pattern: /(^|\W)(?:!|-(?:b?(?:and|x?or)|as|(?:Not)?(?:Contains|In|Like|Match)|eq|ge|gt|is(?:Not)?|Join|le|lt|ne|not|Replace|sh[lr])\b|-[-=]?|\+[+=]?|[*\/%]=?)/i,
        lookbehind: true
      },
      punctuation: /[|{}[\];(),.]/
    };
    powershell2.string[0].inside = {
      function: {
        // Allow for one level of nesting
        pattern: /(^|[^`])\$\((?:\$\([^\r\n()]*\)|(?!\$\()[^\r\n)])*\)/,
        lookbehind: true,
        inside: powershell2
      },
      boolean: powershell2.boolean,
      variable: powershell2.variable
    };
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/yaml.js
yaml.displayName = "yaml";
yaml.aliases = ["yml"];
function yaml(Prism2) {
  ;
  (function(Prism3) {
    var anchorOrAlias = /[*&][^\s[\]{},]+/;
    var tag = /!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/;
    var properties = "(?:" + tag.source + "(?:[ 	]+" + anchorOrAlias.source + ")?|" + anchorOrAlias.source + "(?:[ 	]+" + tag.source + ")?)";
    var plainKey = /(?:[^\s\x00-\x08\x0e-\x1f!"#%&'*,\-:>?@[\]`{|}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*/.source.replace(
      /<PLAIN>/g,
      function() {
        return /[^\s\x00-\x08\x0e-\x1f,[\]{}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]/.source;
      }
    );
    var string = /"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/.source;
    function createValuePattern(value, flags) {
      flags = (flags || "").replace(/m/g, "") + "m";
      var pattern2 = /([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\]|\}|(?:[\r\n]\s*)?#))/.source.replace(/<<prop>>/g, function() {
        return properties;
      }).replace(/<<value>>/g, function() {
        return value;
      });
      return RegExp(pattern2, flags);
    }
    Prism3.languages.yaml = {
      scalar: {
        pattern: RegExp(
          /([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)\S[^\r\n]*(?:\2[^\r\n]+)*)/.source.replace(
            /<<prop>>/g,
            function() {
              return properties;
            }
          )
        ),
        lookbehind: true,
        alias: "string"
      },
      comment: /#.*/,
      key: {
        pattern: RegExp(
          /((?:^|[:\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\s*:\s)/.source.replace(/<<prop>>/g, function() {
            return properties;
          }).replace(/<<key>>/g, function() {
            return "(?:" + plainKey + "|" + string + ")";
          })
        ),
        lookbehind: true,
        greedy: true,
        alias: "atrule"
      },
      directive: {
        pattern: /(^[ \t]*)%.+/m,
        lookbehind: true,
        alias: "important"
      },
      datetime: {
        pattern: createValuePattern(
          /\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?))?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/.source
        ),
        lookbehind: true,
        alias: "number"
      },
      boolean: {
        pattern: createValuePattern(/false|true/.source, "i"),
        lookbehind: true,
        alias: "important"
      },
      null: {
        pattern: createValuePattern(/null|~/.source, "i"),
        lookbehind: true,
        alias: "important"
      },
      string: {
        pattern: createValuePattern(string),
        lookbehind: true,
        greedy: true
      },
      number: {
        pattern: createValuePattern(
          /[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/.source,
          "i"
        ),
        lookbehind: true
      },
      tag,
      important: anchorOrAlias,
      punctuation: /---|[:[\]{}\-,|>?]|\.\.\./
    };
    Prism3.languages.yml = Prism3.languages.yaml;
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/ini.js
ini.displayName = "ini";
ini.aliases = [];
function ini(Prism2) {
  Prism2.languages.ini = {
    /**
     * The component mimics the behavior of the Win32 API parser.
     *
     * @see {@link https://github.com/PrismJS/prism/issues/2775#issuecomment-787477723}
     */
    comment: {
      pattern: /(^[ \f\t\v]*)[#;][^\n\r]*/m,
      lookbehind: true
    },
    section: {
      pattern: /(^[ \f\t\v]*)\[[^\n\r\]]*\]?/m,
      lookbehind: true,
      inside: {
        "section-name": {
          pattern: /(^\[[ \f\t\v]*)[^ \f\t\v\]]+(?:[ \f\t\v]+[^ \f\t\v\]]+)*/,
          lookbehind: true,
          alias: "selector"
        },
        punctuation: /\[|\]/
      }
    },
    key: {
      pattern: /(^[ \f\t\v]*)[^ \f\n\r\t\v=]+(?:[ \f\t\v]+[^ \f\n\r\t\v=]+)*(?=[ \f\t\v]*=)/m,
      lookbehind: true,
      alias: "attr-name"
    },
    value: {
      pattern: /(=[ \f\t\v]*)[^ \f\n\r\t\v]+(?:[ \f\t\v]+[^ \f\n\r\t\v]+)*/,
      lookbehind: true,
      alias: "attr-value",
      inside: {
        "inner-value": {
          pattern: /^("|').+(?=\1$)/,
          lookbehind: true
        }
      }
    },
    punctuation: /=/
  };
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/toml.js
toml.displayName = "toml";
toml.aliases = [];
function toml(Prism2) {
  ;
  (function(Prism3) {
    var key = /(?:[\w-]+|'[^'\n\r]*'|"(?:\\.|[^\\"\r\n])*")/.source;
    function insertKey(pattern2) {
      return pattern2.replace(/__/g, function() {
        return key;
      });
    }
    Prism3.languages.toml = {
      comment: {
        pattern: /#.*/,
        greedy: true
      },
      table: {
        pattern: RegExp(
          insertKey(
            /(^[\t ]*\[\s*(?:\[\s*)?)__(?:\s*\.\s*__)*(?=\s*\])/.source
          ),
          "m"
        ),
        lookbehind: true,
        greedy: true,
        alias: "class-name"
      },
      key: {
        pattern: RegExp(
          insertKey(/(^[\t ]*|[{,]\s*)__(?:\s*\.\s*__)*(?=\s*=)/.source),
          "m"
        ),
        lookbehind: true,
        greedy: true,
        alias: "property"
      },
      string: {
        pattern: /"""(?:\\[\s\S]|[^\\])*?"""|'''[\s\S]*?'''|'[^'\n\r]*'|"(?:\\.|[^\\"\r\n])*"/,
        greedy: true
      },
      date: [
        {
          // Offset Date-Time, Local Date-Time, Local Date
          pattern: /\b\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?\b/i,
          alias: "number"
        },
        {
          // Local Time
          pattern: /\b\d{2}:\d{2}:\d{2}(?:\.\d+)?\b/,
          alias: "number"
        }
      ],
      number: /(?:\b0(?:x[\da-zA-Z]+(?:_[\da-zA-Z]+)*|o[0-7]+(?:_[0-7]+)*|b[10]+(?:_[10]+)*))\b|[-+]?\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?\b|[-+]?\b(?:inf|nan)\b/,
      boolean: /\b(?:false|true)\b/,
      punctuation: /[.,=[\]{}]/
    };
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/markdown.js
markdown.displayName = "markdown";
markdown.aliases = ["md"];
function markdown(Prism2) {
  Prism2.register(markup);
  (function(Prism3) {
    var inner = /(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;
    function createInline(pattern2) {
      pattern2 = pattern2.replace(/<inner>/g, function() {
        return inner;
      });
      return RegExp(/((?:^|[^\\])(?:\\{2})*)/.source + "(?:" + pattern2 + ")");
    }
    var tableCell = /(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source;
    var tableRow = /\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(
      /__/g,
      function() {
        return tableCell;
      }
    );
    var tableLine = /\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/.source;
    Prism3.languages.markdown = Prism3.languages.extend("markup", {});
    Prism3.languages.insertBefore("markdown", "prolog", {
      "front-matter-block": {
        pattern: /(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/,
        lookbehind: true,
        greedy: true,
        inside: {
          punctuation: /^---|---$/,
          "front-matter": {
            pattern: /\S+(?:\s+\S+)*/,
            alias: ["yaml", "language-yaml"],
            inside: Prism3.languages.yaml
          }
        }
      },
      blockquote: {
        // > ...
        pattern: /^>(?:[\t ]*>)*/m,
        alias: "punctuation"
      },
      table: {
        pattern: RegExp(
          "^" + tableRow + tableLine + "(?:" + tableRow + ")*",
          "m"
        ),
        inside: {
          "table-data-rows": {
            pattern: RegExp(
              "^(" + tableRow + tableLine + ")(?:" + tableRow + ")*$"
            ),
            lookbehind: true,
            inside: {
              "table-data": {
                pattern: RegExp(tableCell),
                inside: Prism3.languages.markdown
              },
              punctuation: /\|/
            }
          },
          "table-line": {
            pattern: RegExp("^(" + tableRow + ")" + tableLine + "$"),
            lookbehind: true,
            inside: {
              punctuation: /\||:?-{3,}:?/
            }
          },
          "table-header-row": {
            pattern: RegExp("^" + tableRow + "$"),
            inside: {
              "table-header": {
                pattern: RegExp(tableCell),
                alias: "important",
                inside: Prism3.languages.markdown
              },
              punctuation: /\|/
            }
          }
        }
      },
      code: [
        {
          // Prefixed by 4 spaces or 1 tab and preceded by an empty line
          pattern: /((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/,
          lookbehind: true,
          alias: "keyword"
        },
        {
          // ```optional language
          // code block
          // ```
          pattern: /^```[\s\S]*?^```$/m,
          greedy: true,
          inside: {
            "code-block": {
              pattern: /^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m,
              lookbehind: true
            },
            "code-language": {
              pattern: /^(```).+/,
              lookbehind: true
            },
            punctuation: /```/
          }
        }
      ],
      title: [
        {
          // title 1
          // =======
          // title 2
          // -------
          pattern: /\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m,
          alias: "important",
          inside: {
            punctuation: /==+$|--+$/
          }
        },
        {
          // # title 1
          // ###### title 6
          pattern: /(^\s*)#.+/m,
          lookbehind: true,
          alias: "important",
          inside: {
            punctuation: /^#+|#+$/
          }
        }
      ],
      hr: {
        // ***
        // ---
        // * * *
        // -----------
        pattern: /(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,
        lookbehind: true,
        alias: "punctuation"
      },
      list: {
        // * item
        // + item
        // - item
        // 1. item
        pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
        lookbehind: true,
        alias: "punctuation"
      },
      "url-reference": {
        // [id]: http://example.com "Optional title"
        // [id]: http://example.com 'Optional title'
        // [id]: http://example.com (Optional title)
        // [id]: <http://example.com> "Optional title"
        pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
        inside: {
          variable: {
            pattern: /^(!?\[)[^\]]+/,
            lookbehind: true
          },
          string: /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
          punctuation: /^[\[\]!:]|[<>]/
        },
        alias: "url"
      },
      bold: {
        // **strong**
        // __strong__
        // allow one nested instance of italic text using the same delimiter
        pattern: createInline(
          /\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/.source
        ),
        lookbehind: true,
        greedy: true,
        inside: {
          content: {
            pattern: /(^..)[\s\S]+(?=..$)/,
            lookbehind: true,
            inside: {}
            // see below
          },
          punctuation: /\*\*|__/
        }
      },
      italic: {
        // *em*
        // _em_
        // allow one nested instance of bold text using the same delimiter
        pattern: createInline(
          /\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/.source
        ),
        lookbehind: true,
        greedy: true,
        inside: {
          content: {
            pattern: /(^.)[\s\S]+(?=.$)/,
            lookbehind: true,
            inside: {}
            // see below
          },
          punctuation: /[*_]/
        }
      },
      strike: {
        // ~~strike through~~
        // ~strike~
        // eslint-disable-next-line regexp/strict
        pattern: createInline(/(~~?)(?:(?!~)<inner>)+\2/.source),
        lookbehind: true,
        greedy: true,
        inside: {
          content: {
            pattern: /(^~~?)[\s\S]+(?=\1$)/,
            lookbehind: true,
            inside: {}
            // see below
          },
          punctuation: /~~?/
        }
      },
      "code-snippet": {
        // `code`
        // ``code``
        pattern: /(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/,
        lookbehind: true,
        greedy: true,
        alias: ["code", "keyword"]
      },
      url: {
        // [example](http://example.com "Optional title")
        // [example][id]
        // [example] [id]
        pattern: createInline(
          /!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/.source
        ),
        lookbehind: true,
        greedy: true,
        inside: {
          operator: /^!/,
          content: {
            pattern: /(^\[)[^\]]+(?=\])/,
            lookbehind: true,
            inside: {}
            // see below
          },
          variable: {
            pattern: /(^\][ \t]?\[)[^\]]+(?=\]$)/,
            lookbehind: true
          },
          url: {
            pattern: /(^\]\()[^\s)]+/,
            lookbehind: true
          },
          string: {
            pattern: /(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,
            lookbehind: true
          }
        }
      }
    });
    ["url", "bold", "italic", "strike"].forEach(function(token2) {
      ;
      ["url", "bold", "italic", "strike", "code-snippet"].forEach(
        function(inside) {
          if (token2 !== inside) {
            Prism3.languages.markdown[token2].inside.content.inside[inside] = Prism3.languages.markdown[inside];
          }
        }
      );
    });
    Prism3.hooks.add("after-tokenize", function(env) {
      if (env.language !== "markdown" && env.language !== "md") {
        return;
      }
      function walkTokens(tokens) {
        if (!tokens || typeof tokens === "string") {
          return;
        }
        for (var i = 0, l = tokens.length; i < l; i++) {
          var token2 = tokens[i];
          if (token2.type !== "code") {
            walkTokens(token2.content);
            continue;
          }
          var codeLang = token2.content[1];
          var codeBlock = token2.content[3];
          if (codeLang && codeBlock && codeLang.type === "code-language" && codeBlock.type === "code-block" && typeof codeLang.content === "string") {
            var lang = codeLang.content.replace(/\b#/g, "sharp").replace(/\b\+\+/g, "pp");
            lang = (/[a-z][\w-]*/i.exec(lang) || [""])[0].toLowerCase();
            var alias2 = "language-" + lang;
            if (!codeBlock.alias) {
              codeBlock.alias = [alias2];
            } else if (typeof codeBlock.alias === "string") {
              codeBlock.alias = [codeBlock.alias, alias2];
            } else {
              codeBlock.alias.push(alias2);
            }
          }
        }
      }
      walkTokens(env.tokens);
    });
    Prism3.hooks.add("wrap", function(env) {
      if (env.type !== "code-block") {
        return;
      }
      var codeLang = "";
      for (var i = 0, l = env.classes.length; i < l; i++) {
        var cls = env.classes[i];
        var match = /language-(.+)/.exec(cls);
        if (match) {
          codeLang = match[1];
          break;
        }
      }
      var grammar = Prism3.languages[codeLang];
      if (!grammar) {
        if (codeLang && codeLang !== "none" && Prism3.plugins.autoloader) {
          var id = "md-" + (/* @__PURE__ */ new Date()).valueOf() + "-" + Math.floor(Math.random() * 1e16);
          env.attributes["id"] = id;
          Prism3.plugins.autoloader.loadLanguages(codeLang, function() {
            var ele = document.getElementById(id);
            if (ele) {
              ele.innerHTML = Prism3.highlight(
                ele.textContent,
                Prism3.languages[codeLang],
                codeLang
              );
            }
          });
        }
      } else {
        env.content = Prism3.highlight(env.content.value, grammar, codeLang);
      }
    });
    var tagPattern = RegExp(Prism3.languages.markup.tag.pattern.source, "gi");
    var KNOWN_ENTITY_NAMES = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"'
    };
    var fromCodePoint = String.fromCodePoint || String.fromCharCode;
    function textContent(html3) {
      var text = html3.replace(tagPattern, "");
      text = text.replace(/&(\w{1,8}|#x?[\da-f]{1,8});/gi, function(m, code) {
        code = code.toLowerCase();
        if (code[0] === "#") {
          var value;
          if (code[1] === "x") {
            value = parseInt(code.slice(2), 16);
          } else {
            value = Number(code.slice(1));
          }
          return fromCodePoint(value);
        } else {
          var known = KNOWN_ENTITY_NAMES[code];
          if (known) {
            return known;
          }
          return m;
        }
      });
      return text;
    }
    Prism3.languages.md = Prism3.languages.markdown;
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/css.js
css.displayName = "css";
css.aliases = [];
function css(Prism2) {
  ;
  (function(Prism3) {
    var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
    Prism3.languages.css = {
      comment: /\/\*[\s\S]*?\*\//,
      atrule: {
        pattern: RegExp(
          "@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + string.source + ")*?" + /(?:;|(?=\s*\{))/.source
        ),
        inside: {
          rule: /^@[\w-]+/,
          "selector-function-argument": {
            pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
            lookbehind: true,
            alias: "selector"
          },
          keyword: {
            pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
            lookbehind: true
          }
          // See rest below
        }
      },
      url: {
        // https://drafts.csswg.org/css-values-3/#urls
        pattern: RegExp(
          "\\burl\\((?:" + string.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)",
          "i"
        ),
        greedy: true,
        inside: {
          function: /^url/i,
          punctuation: /^\(|\)$/,
          string: {
            pattern: RegExp("^" + string.source + "$"),
            alias: "url"
          }
        }
      },
      selector: {
        pattern: RegExp(
          `(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + string.source + ")*(?=\\s*\\{)"
        ),
        lookbehind: true
      },
      string: {
        pattern: string,
        greedy: true
      },
      property: {
        pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
        lookbehind: true
      },
      important: /!important\b/i,
      function: {
        pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
        lookbehind: true
      },
      punctuation: /[(){};:,]/
    };
    Prism3.languages.css["atrule"].inside.rest = Prism3.languages.css;
    var markup2 = Prism3.languages.markup;
    if (markup2) {
      markup2.tag.addInlined("style", "css");
      markup2.tag.addAttribute("style", "css");
    }
  })(Prism2);
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/scss.js
scss.displayName = "scss";
scss.aliases = [];
function scss(Prism2) {
  Prism2.register(css);
  Prism2.languages.scss = Prism2.languages.extend("css", {
    comment: {
      pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,
      lookbehind: true
    },
    atrule: {
      pattern: /@[\w-](?:\([^()]+\)|[^()\s]|\s+(?!\s))*?(?=\s+[{;])/,
      inside: {
        rule: /@[\w-]+/
        // See rest below
      }
    },
    // url, compassified
    url: /(?:[-a-z]+-)?url(?=\()/i,
    // CSS selector regex is not appropriate for Sass
    // since there can be lot more things (var, @ directive, nesting..)
    // a selector must start at the end of a property or after a brace (end of other rules or nesting)
    // it can contain some characters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
    // the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
    // can "pass" as a selector- e.g: proper#{$erty})
    // this one was hard to do, so please be careful if you edit this one :)
    selector: {
      // Initial look-ahead is used to prevent matching of blank selectors
      pattern: /(?=\S)[^@;{}()]?(?:[^@;{}()\s]|\s+(?!\s)|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}][^:{}]*[:{][^}]))/,
      inside: {
        parent: {
          pattern: /&/,
          alias: "important"
        },
        placeholder: /%[-\w]+/,
        variable: /\$[-\w]+|#\{\$[-\w]+\}/
      }
    },
    property: {
      pattern: /(?:[-\w]|\$[-\w]|#\{\$[-\w]+\})+(?=\s*:)/,
      inside: {
        variable: /\$[-\w]+|#\{\$[-\w]+\}/
      }
    }
  });
  Prism2.languages.insertBefore("scss", "atrule", {
    keyword: [
      /@(?:content|debug|each|else(?: if)?|extend|for|forward|function|if|import|include|mixin|return|use|warn|while)\b/i,
      {
        pattern: /( )(?:from|through)(?= )/,
        lookbehind: true
      }
    ]
  });
  Prism2.languages.insertBefore("scss", "important", {
    // var and interpolated vars
    variable: /\$[-\w]+|#\{\$[-\w]+\}/
  });
  Prism2.languages.insertBefore("scss", "function", {
    "module-modifier": {
      pattern: /\b(?:as|hide|show|with)\b/i,
      alias: "keyword"
    },
    placeholder: {
      pattern: /%[-\w]+/,
      alias: "selector"
    },
    statement: {
      pattern: /\B!(?:default|optional)\b/i,
      alias: "keyword"
    },
    boolean: /\b(?:false|true)\b/,
    null: {
      pattern: /\bnull\b/,
      alias: "keyword"
    },
    operator: {
      pattern: /(\s)(?:[-+*\/%]|[=!]=|<=?|>=?|and|not|or)(?=\s)/,
      lookbehind: true
    }
  });
  Prism2.languages.scss["atrule"].inside.rest = Prism2.languages.scss;
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/less.js
less.displayName = "less";
less.aliases = [];
function less(Prism2) {
  Prism2.register(css);
  Prism2.languages.less = Prism2.languages.extend("css", {
    comment: [
      /\/\*[\s\S]*?\*\//,
      {
        pattern: /(^|[^\\])\/\/.*/,
        lookbehind: true
      }
    ],
    atrule: {
      pattern: /@[\w-](?:\((?:[^(){}]|\([^(){}]*\))*\)|[^(){};\s]|\s+(?!\s))*?(?=\s*\{)/,
      inside: {
        punctuation: /[:()]/
      }
    },
    // selectors and mixins are considered the same
    selector: {
      pattern: /(?:@\{[\w-]+\}|[^{};\s@])(?:@\{[\w-]+\}|\((?:[^(){}]|\([^(){}]*\))*\)|[^(){};@\s]|\s+(?!\s))*?(?=\s*\{)/,
      inside: {
        // mixin parameters
        variable: /@+[\w-]+/
      }
    },
    property: /(?:@\{[\w-]+\}|[\w-])+(?:\+_?)?(?=\s*:)/,
    operator: /[+\-*\/]/
  });
  Prism2.languages.insertBefore("less", "property", {
    variable: [
      // Variable declaration (the colon must be consumed!)
      {
        pattern: /@[\w-]+\s*:/,
        inside: {
          punctuation: /:/
        }
      },
      // Variable usage
      /@@?[\w-]+/
    ],
    "mixin-usage": {
      pattern: /([{;]\s*)[.#](?!\d)[\w-].*?(?=[(;])/,
      lookbehind: true,
      alias: "function"
    }
  });
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/sql.js
sql.displayName = "sql";
sql.aliases = [];
function sql(Prism2) {
  Prism2.languages.sql = {
    comment: {
      pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,
      lookbehind: true
    },
    variable: [
      {
        pattern: /@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,
        greedy: true
      },
      /@[\w.$]+/
    ],
    string: {
      pattern: /(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/,
      greedy: true,
      lookbehind: true
    },
    identifier: {
      pattern: /(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/,
      greedy: true,
      lookbehind: true,
      inside: {
        punctuation: /^`|`$/
      }
    },
    function: /\b(?:AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i,
    // Should we highlight user defined functions too?
    keyword: /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i,
    boolean: /\b(?:FALSE|NULL|TRUE)\b/i,
    number: /\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i,
    operator: /[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
    punctuation: /[;[\]()`,.]/
  };
}

// node_modules/.pnpm/refractor@5.0.0/node_modules/refractor/lang/diff.js
diff.displayName = "diff";
diff.aliases = [];
function diff(Prism2) {
  ;
  (function(Prism3) {
    Prism3.languages.diff = {
      coord: [
        // Match all kinds of coord lines (prefixed by "+++", "---" or "***").
        /^(?:\*{3}|-{3}|\+{3}).*$/m,
        // Match "@@ ... @@" coord lines in unified diff.
        /^@@.*@@$/m,
        // Match coord lines in normal diff (starts with a number).
        /^\d.*$/m
      ]
      // deleted, inserted, unchanged, diff
    };
    var PREFIXES = {
      "deleted-sign": "-",
      "deleted-arrow": "<",
      "inserted-sign": "+",
      "inserted-arrow": ">",
      unchanged: " ",
      diff: "!"
    };
    Object.keys(PREFIXES).forEach(function(name2) {
      var prefix = PREFIXES[name2];
      var alias2 = [];
      if (!/^\w+$/.test(name2)) {
        alias2.push(/\w+/.exec(name2)[0]);
      }
      if (name2 === "diff") {
        alias2.push("bold");
      }
      Prism3.languages.diff[name2] = {
        pattern: RegExp(
          "^(?:[" + prefix + "].*(?:\r\n?|\n|(?![\\s\\S])))+",
          "m"
        ),
        alias: alias2,
        inside: {
          line: {
            pattern: /(.)(?=[\s\S]).*(?:\r\n?|\n)?/,
            lookbehind: true
          },
          prefix: {
            pattern: /[\s\S]/,
            alias: /\w+/.exec(name2)[0]
          }
        }
      };
    });
    Object.defineProperty(Prism3.languages.diff, "PREFIXES", {
      value: PREFIXES
    });
  })(Prism2);
}

// src/client/ReviewView.tsx
var import_react11 = require("react");
var import_jsx_runtime10 = require("react/jsx-runtime");
var countAddedStyle = {
  fontSize: 12,
  color: token.success,
  fontFamily: "ui-monospace, monospace",
  flex: "0 0 auto"
};
var countRemovedStyle = {
  fontSize: 12,
  color: token.danger,
  fontFamily: "ui-monospace, monospace",
  flex: "0 0 auto"
};
function baseOf(path) {
  return path.slice(path.lastIndexOf("/") + 1);
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
var FILTERS = ["all", "staged", "unstaged"];
function filterKey(filter) {
  return filter === "all" ? "explorer.filterAll" : filter === "staged" ? "explorer.filterStaged" : "explorer.filterUnstaged";
}
function countsFor(change, filter) {
  if (filter === "staged") {
    return change.stagedAdded !== void 0 ? { added: change.stagedAdded, removed: change.stagedRemoved ?? 0 } : void 0;
  }
  if (filter === "unstaged") {
    return change.worktreeAdded !== void 0 ? { added: change.worktreeAdded, removed: change.worktreeRemoved ?? 0 } : void 0;
  }
  return change.added !== void 0 ? { added: change.added, removed: change.removed ?? 0 } : void 0;
}
var treeStyle = { listStyle: "none", margin: 0, padding: 0 };
var VIEW_PREFS_KEY = "dsh-ext:review-view-prefs";
function readViewPrefs() {
  try {
    const raw = window.localStorage.getItem(VIEW_PREFS_KEY);
    if (raw === null) return { grouped: false, filter: "all" };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { grouped: false, filter: "all" };
    const grouped = parsed.grouped === true;
    const filter = parsed.filter;
    const validFilter = filter === "all" || filter === "staged" || filter === "unstaged";
    return { grouped, filter: validFilter ? filter : "all" };
  } catch {
    return { grouped: false, filter: "all" };
  }
}
function writeViewPrefs(prefs) {
  try {
    window.localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify(prefs));
  } catch {
  }
}
function ReviewRow(props) {
  const t = useT();
  const { change, counts } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "button",
    {
      type: "button",
      onClick: () => {
        props.onOpenDiff(change.path);
      },
      title: t("explorer.preview"),
      style: { ...rowStyle, paddingLeft: 4 + props.depth * INDENT },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
          "span",
          {
            "aria-hidden": "true",
            style: {
              fontFamily: "ui-monospace, monospace",
              fontSize: 13,
              color: change.untracked ? token.textMuted : token.accent,
              flex: "0 0 auto"
            },
            children: [
              change.index,
              change.worktree
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FileIcon, { size: 16, name: baseOf(change.path) }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
          change.from !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: { color: token.textMuted }, children: [
            change.from,
            " \u2192 "
          ] }),
          props.label
        ] }),
        counts?.added !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: countAddedStyle, children: [
          "+",
          counts.added
        ] }),
        counts?.removed !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: countRemovedStyle, children: [
          "-",
          counts.removed
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: { fontSize: 12, color: token.textMuted, flex: "0 0 auto" }, children: describeChange(change, t) })
      ]
    }
  ) });
}
function buildTree(changes) {
  const root = { name: "", path: "", dirs: [], files: [] };
  const index2 = /* @__PURE__ */ new Map([["", root]]);
  for (const change of changes) {
    const segments = change.path.split("/");
    segments.pop();
    let current3 = root;
    let accumulated = "";
    for (const segment of segments) {
      accumulated = accumulated.length === 0 ? segment : `${accumulated}/${segment}`;
      let next = index2.get(accumulated);
      if (next === void 0) {
        next = { name: segment, path: accumulated, dirs: [], files: [] };
        index2.set(accumulated, next);
        current3.dirs.push(next);
      }
      current3 = next;
    }
    current3.files.push(change);
  }
  return root;
}
function sumCounts(node, countsFor2) {
  let added;
  let removed;
  const add = (counts) => {
    if (counts === void 0) return;
    added = (added ?? 0) + counts.added;
    removed = (removed ?? 0) + counts.removed;
  };
  for (const file of node.files) add(countsFor2(file));
  for (const dir of node.dirs) {
    const nested = sumCounts(dir, countsFor2);
    if (nested !== void 0) add(nested);
  }
  return added === void 0 ? void 0 : { added, removed: removed ?? 0 };
}
function FolderRow(props) {
  const { node, depth } = props;
  const open3 = !props.collapsed.has(node.path);
  const counts = sumCounts(node, props.countsFor);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "button",
    {
      type: "button",
      onClick: () => {
        props.onToggle(node.path);
      },
      style: { ...rowStyle, paddingLeft: 4 + depth * INDENT },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ChevronIcon, { size: 14, open: open3 }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FolderIcon, { size: 16, open: open3 }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: node.name }),
        counts?.added !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: countAddedStyle, children: [
          "+",
          counts.added
        ] }),
        counts?.removed !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: countRemovedStyle, children: [
          "-",
          counts.removed
        ] })
      ]
    }
  ) });
}
function FolderNodes(props) {
  const { node, depth } = props;
  const rows = [];
  const dirs = [...node.dirs].sort((a, b) => a.name.localeCompare(b.name));
  const files = [...node.files].sort((a, b) => baseOf(a.path).localeCompare(baseOf(b.path)));
  for (const dir of dirs) {
    rows.push(/* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FolderRow, { node: dir, depth, collapsed: props.collapsed, onToggle: props.onToggle, countsFor: props.countsFor }, dir.path));
    if (!props.collapsed.has(dir.path)) {
      rows.push(
        // The children live in their own list item so the whole subtree keeps
        // the folder's key and collapses with it.
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("ul", { style: treeStyle, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FolderNodes, { node: dir, depth: depth + 1, collapsed: props.collapsed, onToggle: props.onToggle, countsFor: props.countsFor, onOpenDiff: props.onOpenDiff }) }) }, `children-${dir.path}`)
      );
    }
  }
  for (const file of files) {
    rows.push(
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        ReviewRow,
        {
          change: file,
          label: baseOf(file.path),
          depth,
          counts: props.countsFor(file),
          onOpenDiff: props.onOpenDiff
        },
        file.path
      )
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_jsx_runtime10.Fragment, { children: rows });
}
function ReviewView(props) {
  const t = useT();
  const [filter, setFilter] = (0, import_react11.useState)(() => readViewPrefs().filter);
  const [grouped, setGrouped] = (0, import_react11.useState)(() => readViewPrefs().grouped);
  const [collapsed, setCollapsed] = (0, import_react11.useState)(() => /* @__PURE__ */ new Set());
  (0, import_react11.useEffect)(() => {
    writeViewPrefs({ grouped, filter });
  }, [grouped, filter]);
  const { changes } = props.status;
  const filtered = (0, import_react11.useMemo)(
    () => changes.filter((change) => filter === "all" || (filter === "staged" ? change.staged : !change.staged)),
    [changes, filter]
  );
  const sideCounts = (0, import_react11.useMemo)(() => ({
    all: changes.length,
    staged: changes.filter((change) => change.staged).length,
    unstaged: changes.filter((change) => !change.staged).length
  }), [changes]);
  const tree = (0, import_react11.useMemo)(() => grouped ? buildTree(filtered) : void 0, [grouped, filtered]);
  const rowCounts = (0, import_react11.useMemo)(() => (change) => countsFor(change, filter), [filter]);
  const onToggle = (0, import_react11.useMemo)(() => (path) => {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);
  if (!props.status.isRepository) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 14, color: token.textMuted, padding: "8px 0" }, children: t("explorer.noRepo") });
  }
  if (changes.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 14, color: token.textMuted, padding: "8px 0" }, children: t("explorer.noChanges") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
      "div",
      {
        style: {
          display: "flex",
          gap: 4,
          alignItems: "center",
          flexWrap: "wrap",
          // The panel scrolls the whole view (the file browser and review list
          // share that overflow container), so the filter row would ride away
          // with the list. Sticky keeps it pinned to the top of the panel while
          // the list scrolls underneath. Needs an opaque background so a list
          // row passing under it does not show through the gaps between
          // buttons, and a z-index to sit above those rows.
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: token.surfaceBase,
          padding: "2px 0"
        },
        children: [
          FILTERS.map((name2) => {
            const active = filter === name2;
            return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => {
                  setFilter(name2);
                },
                "aria-pressed": active,
                style: {
                  ...buttonStyle,
                  fontSize: 13,
                  padding: "4px 12px",
                  borderColor: active ? token.accent : token.border,
                  color: active ? token.accent : token.text
                },
                children: [
                  t(filterKey(name2)),
                  " ",
                  sideCounts[name2]
                ]
              },
              name2
            );
          }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: { flex: 1 } }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            "button",
            {
              type: "button",
              "aria-label": grouped ? t("explorer.reviewFlat") : t("explorer.reviewGroup"),
              title: grouped ? t("explorer.reviewFlat") : t("explorer.reviewGroup"),
              onClick: () => {
                setGrouped((value) => !value);
              },
              style: {
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 26,
                height: 26,
                padding: 0,
                border: "none",
                borderRadius: 6,
                background: "transparent",
                color: token.textMuted,
                cursor: "pointer",
                flex: "0 0 auto"
              },
              children: grouped ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FilesIcon, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FolderIcon, { size: 16, open: false })
            }
          )
        ]
      }
    ),
    filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 14, color: token.textMuted, padding: "8px 0" }, children: t("explorer.noChanges") }) : grouped && tree !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("ul", { style: treeStyle, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FolderNodes, { node: tree, depth: 0, collapsed, onToggle, countsFor: rowCounts, onOpenDiff: props.onOpenDiff }) }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("ul", { style: treeStyle, children: filtered.map((change) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      ReviewRow,
      {
        change,
        label: change.path,
        depth: 0,
        counts: rowCounts(change),
        onOpenDiff: props.onOpenDiff
      },
      `${change.index}${change.worktree} ${change.path}`
    )) })
  ] });
}

// src/client/DiffView.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
var grammars = {
  typescript,
  tsx,
  javascript,
  json,
  python,
  rust,
  go,
  java,
  kotlin,
  c,
  cpp,
  csharp,
  php,
  ruby,
  swift,
  lua,
  bash,
  batch,
  powershell,
  yaml,
  ini,
  toml,
  markdown,
  markup,
  css,
  scss,
  less,
  sql,
  diff
};
for (const grammar of Object.values(grammars)) refractor.register(grammar);
var diffRefractor = {
  highlight(text, language) {
    const children = refractor.highlight(text, language).children;
    if (language === "markup") return flattenMarkup(children);
    return children;
  }
};
function flattenMarkup(nodes) {
  const text = (node) => {
    if (typeof node === "string") return node;
    if (node === null || typeof node !== "object") return "";
    const record = node;
    if (typeof record.value === "string") return record.value;
    if (Array.isArray(record.children)) return record.children.map(text).join("");
    return "";
  };
  return nodes.map((node) => {
    const record = node;
    return {
      type: "text",
      value: text(node),
      ...record.properties === void 0 ? {} : { properties: record.properties }
    };
  });
}
var GRAMMAR_BY_EXTENSION = {
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  json: "json",
  jsonc: "json",
  json5: "json",
  py: "python",
  pyi: "python",
  rs: "rust",
  go: "go",
  java: "java",
  kt: "kotlin",
  kts: "kotlin",
  c: "c",
  h: "c",
  cc: "cpp",
  cpp: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hh: "cpp",
  cs: "csharp",
  php: "php",
  rb: "ruby",
  swift: "swift",
  lua: "lua",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "bash",
  bat: "batch",
  cmd: "batch",
  ps1: "powershell",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  ini: "ini",
  cfg: "ini",
  conf: "ini",
  md: "markdown",
  markdown: "markdown",
  mdx: "markdown",
  html: "markup",
  htm: "markup",
  xml: "markup",
  svg: "markup",
  vue: "markup",
  css: "css",
  scss: "scss",
  less: "less",
  sql: "sql",
  diff: "diff",
  patch: "diff"
};
function grammarFor(path) {
  const name2 = path.slice(path.lastIndexOf("/") + 1).toLowerCase();
  const dot = name2.lastIndexOf(".");
  const extension = dot <= 0 ? "" : name2.slice(dot + 1);
  return GRAMMAR_BY_EXTENSION[extension];
}
function safeHunks(hunks) {
  return hunks.filter((hunk) => hunk !== void 0 && typeof hunk?.oldStart === "number");
}
var PATCH_CONTEXT = 3;
var MIN_GAP_LINES = 8;
function gapsOf(hunks, oldLineCount) {
  if (hunks.length === 0) return [];
  const gaps = [];
  const first2 = hunks[0];
  if (first2.oldStart > 1) {
    gaps.push({ start: 1, end: first2.oldStart, count: first2.oldStart - 1 });
  }
  for (let index2 = 1; index2 < hunks.length; index2 += 1) {
    const previous = hunks[index2 - 1];
    const next = hunks[index2];
    const start = previous.oldStart + previous.oldLines;
    const count = next.oldStart - start;
    if (count > 0) gaps.push({ start, end: next.oldStart, count });
  }
  const last = hunks[hunks.length - 1];
  const trailingStart = last.oldStart + last.oldLines;
  const trailingCount = oldLineCount - trailingStart + 1;
  if (trailingCount > 0) {
    gaps.push({ start: trailingStart, end: oldLineCount + 1, count: trailingCount });
  }
  return gaps;
}
function GapBar(props) {
  const t = useT();
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("tbody", { className: "diff-gap", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("td", { colSpan: 3, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    "button",
    {
      type: "button",
      onClick: () => {
        props.onExpand(props.gap.start);
      },
      style: {
        display: "block",
        width: "100%",
        padding: "2px 8px",
        border: "none",
        background: "transparent",
        color: token.textMuted,
        fontSize: 12,
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit"
      },
      children: t("explorer.unmodified", { n: props.gap.count })
    }
  ) }) }) }, `gap-${props.gap.start}`);
}
var DIFF_CLASS = "dsh-ext-diff";
var diffStylesInjected = false;
function injectDiffStyles() {
  if (diffStylesInjected || typeof document === "undefined") return;
  diffStylesInjected = true;
  const style2 = document.createElement("style");
  style2.dataset.dshPlugin = "dsh-ext";
  style2.textContent = `
.${DIFF_CLASS} { border-collapse: collapse; table-layout: fixed; width: 100%; font-size: 13px; color: ${token.text}; }
.${DIFF_CLASS} td { padding: 0; vertical-align: top; }
.${DIFF_CLASS} .diff-line { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; line-height: 1.55; }
.${DIFF_CLASS} .diff-gutter-col { width: 4.5ch; }
.${DIFF_CLASS} .diff-gutter { padding: 0 1ch 0 0.5ch; text-align: right; user-select: none; color: ${token.textMuted}; }
.${DIFF_CLASS} .diff-code { padding: 0 0 0 0.5ch; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; min-width: 0; }
.${DIFF_CLASS} .diff-gutter-insert { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 22%, transparent); }
.${DIFF_CLASS} .diff-gutter-delete { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f25a5a) 22%, transparent); }
.${DIFF_CLASS} .diff-code-insert { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 13%, transparent); }
.${DIFF_CLASS} .diff-code-delete { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f25a5a) 13%, transparent); }
.${DIFF_CLASS} .diff-code-insert .diff-code-edit { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 38%, transparent); }
.${DIFF_CLASS} .diff-code-delete .diff-code-edit { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f25a5a) 38%, transparent); }
.${DIFF_CLASS} .diff-gap td { padding: 0; }
.${DIFF_CLASS} .diff-gap button:hover { color: ${token.text}; background: ${token.hover}; }

/* Prism token classes \u2192 the host's shiki variable theme, so a diff's syntax
   colours are literally the same custom properties the file viewer reads.
   Fallbacks mirror the shiki sheet's own dark-theme values, in case the host
   theme has not loaded. */
.${DIFF_CLASS} .token.comment,
.${DIFF_CLASS} .token.prolog,
.${DIFF_CLASS} .token.cdata { color: var(--shiki-token-comment, #6a737d); }
.${DIFF_CLASS} .token.punctuation { color: var(--shiki-token-punctuation, #adb5bd); }
.${DIFF_CLASS} .token.doctype,
.${DIFF_CLASS} .token.deleted { color: var(--shiki-token-deleted, #f25a5a); }
.${DIFF_CLASS} .token.keyword,
.${DIFF_CLASS} .token.module,
.${DIFF_CLASS} .token.selector,
.${DIFF_CLASS} .token.important,
.${DIFF_CLASS} .token.atrule { color: var(--shiki-token-keyword, #faa2c1); }
.${DIFF_CLASS} .token.string,
.${DIFF_CLASS} .token.char,
.${DIFF_CLASS} .token.attr-value,
.${DIFF_CLASS} .token.regex { color: var(--shiki-token-string, #8ce99a); }
.${DIFF_CLASS} .token.number,
.${DIFF_CLASS} .token.boolean,
.${DIFF_CLASS} .token.constant,
.${DIFF_CLASS} .token.symbol { color: var(--shiki-token-constant, #ffab70); }
.${DIFF_CLASS} .token.function,
.${DIFF_CLASS} .token.function-variable,
.${DIFF_CLASS} .token.class-name { color: var(--shiki-token-function, #74c0fc); }
.${DIFF_CLASS} .token.property,
.${DIFF_CLASS} .token.attr-name,
.${DIFF_CLASS} .token.tag,
.${DIFF_CLASS} .token.builtin,
.${DIFF_CLASS} .token.variable { color: var(--shiki-token-constant, #ffab70); }
.${DIFF_CLASS} .token.operator,
.${DIFF_CLASS} .token.entity,
.${DIFF_CLASS} .token.url { color: var(--shiki-foreground, #f9fafb); }
`;
  document.head.appendChild(style2);
}
function CodeView(props) {
  injectDiffStyles();
  const language = grammarFor(props.path);
  const lines = (0, import_react12.useMemo)(() => {
    if (props.content.length === 0) return [];
    const split2 = props.content.split("\n");
    if (split2[split2.length - 1] === "") split2.pop();
    return split2;
  }, [props.content]);
  const hunks = (0, import_react12.useMemo)(() => {
    const hunk = textLinesToHunk(lines, 1, 1);
    return safeHunks(hunk === null ? [] : [hunk]);
  }, [lines]);
  const tokens = (0, import_react12.useMemo)(() => {
    if (language === void 0 || hunks.length === 0) return null;
    try {
      return tokenize(hunks, {
        oldSource: props.content,
        highlight: true,
        refractor: diffRefractor,
        language
      });
    } catch {
      return null;
    }
  }, [hunks, language, props.content]);
  if (hunks.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { overflow: "auto", minWidth: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    index,
    {
      className: DIFF_CLASS,
      viewType: "unified",
      diffType: "modify",
      hunks,
      tokens,
      children: (rendered) => rendered.map((hunk, index2) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Hunk, { hunk }, `plain-${hunk.oldStart}-${index2}`))
    }
  ) });
}
function DiffView(props) {
  const t = useT();
  injectDiffStyles();
  const review = useResource(
    `/explorer/review?path=${encodeURIComponent(props.path)}${props.scope.length === 0 ? "" : `&${props.scope}`}`
  );
  const data = review.data;
  const language = grammarFor(props.path);
  const patch = (0, import_react12.useMemo)(() => {
    if (data === void 0) return void 0;
    const raw = createTwoFilesPatch(
      `a/${props.path}`,
      `b/${props.path}`,
      data.oldText ?? "",
      data.newText,
      "",
      "",
      { context: PATCH_CONTEXT }
    );
    return raw.split("\n").filter((line) => !line.startsWith("===")).join("\n");
  }, [data, props.path]);
  const parsedFile = (0, import_react12.useMemo)(() => {
    if (patch === void 0) return void 0;
    try {
      return parseDiff(patch)[0];
    } catch {
      return void 0;
    }
  }, [patch]);
  const baseHunks = parsedFile?.hunks ?? [];
  const oldSource = data?.oldText ?? null;
  const oldLineCount = (0, import_react12.useMemo)(() => (oldSource ?? "").split("\n").length, [oldSource]);
  const [expanded, setExpanded] = (0, import_react12.useState)(() => /* @__PURE__ */ new Set());
  const onExpand = (0, import_react12.useMemo)(() => (start) => {
    setExpanded((previous) => new Set(previous).add(start));
  }, []);
  const hunks = (0, import_react12.useMemo)(() => {
    if (oldSource === null) return safeHunks(baseHunks);
    try {
      let result = expandCollapsedBlockBy(baseHunks, oldSource, (lines) => lines < MIN_GAP_LINES);
      for (const gap of gapsOf(baseHunks, oldLineCount)) {
        if (gap.count >= MIN_GAP_LINES && expanded.has(gap.start)) {
          result = expandFromRawCode(result, oldSource, gap.start, gap.end);
        }
      }
      return safeHunks(result);
    } catch {
      return safeHunks(baseHunks);
    }
  }, [baseHunks, oldSource, oldLineCount, expanded]);
  const tokens = (0, import_react12.useMemo)(() => {
    if (language === void 0 || hunks.length === 0) return null;
    try {
      return tokenize(hunks, {
        oldSource: oldSource ?? void 0,
        highlight: true,
        refractor: diffRefractor,
        language,
        enhancers: oldSource === null ? [] : [markEdits(hunks, { type: "line" })]
      });
    } catch {
      return null;
    }
  }, [hunks, oldSource, language]);
  if (review.error !== void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Notice, { kind: "error", children: t("explorer.viewFailed", { message: review.error }) });
  }
  if (data === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { fontSize: 14, color: token.textMuted }, children: t("common.loading") });
  }
  const changedRows = hunks.reduce(
    (total, hunk) => total + hunk.changes.filter((change) => change.type !== "normal").length,
    0
  );
  if (changedRows === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { fontSize: 14, color: token.textMuted }, children: t("explorer.noDiff") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          minWidth: 0,
          // The panel scrolls the whole diff, so the header row (path and line
          // counts) would ride away with the hunks. Sticky pins it to the top
          // while the diff scrolls underneath — the same treatment the file
          // editor view and the review filter row get.
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: token.surfaceBase,
          padding: "6px 0 2px",
          margin: "-6px 0 0"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            "span",
            {
              title: props.path,
              style: { fontSize: 13, color: token.textMuted, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
              children: props.path
            }
          ),
          data.added !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { style: countAddedStyle, children: [
            "+",
            data.added
          ] }),
          data.removed !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { style: countRemovedStyle, children: [
            "-",
            data.removed
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { overflow: "auto", minWidth: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      index,
      {
        className: DIFF_CLASS,
        viewType: "unified",
        diffType: parsedFile?.type ?? "modify",
        hunks,
        tokens,
        children: (rendered) => {
          const rows = [];
          const currentGaps = gapsOf(rendered, oldLineCount);
          for (let index2 = 0; index2 < rendered.length; index2 += 1) {
            const hunk = rendered[index2];
            const gapBefore = currentGaps.find((gap) => gap.end === hunk.oldStart && gap.count >= MIN_GAP_LINES);
            if (index2 === 0 && gapBefore !== void 0) {
              rows.push(/* @__PURE__ */ (0, import_jsx_runtime11.jsx)(GapBar, { gap: gapBefore, onExpand }, `gap-${gapBefore.start}`));
            } else if (index2 > 0) {
              const previous = rendered[index2 - 1];
              const start = previous.oldStart + previous.oldLines;
              const gap = currentGaps.find((candidate) => candidate.start === start && candidate.count >= MIN_GAP_LINES);
              if (gap !== void 0) rows.push(/* @__PURE__ */ (0, import_jsx_runtime11.jsx)(GapBar, { gap, onExpand }, `gap-${gap.start}`));
            }
            rows.push(/* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Hunk, { hunk }, `hunk-${hunk.oldStart}-${index2}`));
          }
          const last = rendered[rendered.length - 1];
          if (last !== void 0) {
            const trailingStart = last.oldStart + last.oldLines;
            const gap = currentGaps.find((candidate) => candidate.start === trailingStart && candidate.count >= MIN_GAP_LINES);
            if (gap !== void 0) rows.push(/* @__PURE__ */ (0, import_jsx_runtime11.jsx)(GapBar, { gap, onExpand }, `gap-${gap.start}`));
          }
          return rows;
        }
      }
    ) })
  ] });
}

// src/client/ExplorerPanel.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var ViewBoundary = class extends import_react13.Component {
  state = { failed: false, message: "" };
  static getDerivedStateFromError(error) {
    return { failed: true, message: error.message };
  }
  componentDidCatch(error) {
    console.error("[dsh-ext] a side-panel view crashed:", error);
  }
  render() {
    if (this.state.failed) {
      return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { fontSize: 12, color: token.textMuted, padding: "8px 0" }, children: [
        "[dsh-ext] view crashed \u2014 close this tab and reopen it.",
        this.state.message.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { marginTop: 6, color: token.danger, fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }, children: this.state.message })
      ] });
    }
    return this.props.children;
  }
};
function formatSize(bytes) {
  if (bytes === void 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function baseOf2(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}
var metaStyle = { fontSize: 13, color: token.textMuted };
var noteStyle = { fontSize: 12, color: token.textMuted };
var treeStyle2 = { listStyle: "none", margin: 0, padding: 0 };
function TreeRow(props) {
  const t = useT();
  const { entry, depth } = props;
  const open3 = entry.kind === "directory" && props.expanded.has(entry.path);
  const children = useResource(
    `/explorer/tree?path=${encodeURIComponent(entry.path)}${props.scope}`,
    open3
  );
  const row = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
    "button",
    {
      type: "button",
      onClick: () => {
        entry.kind === "directory" ? props.onToggle(entry.path) : props.onOpenFile(entry.path);
      },
      title: entry.kind === "file" ? t("explorer.preview") : void 0,
      style: { ...rowStyle, paddingLeft: 4 + depth * INDENT },
      children: [
        entry.kind === "directory" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ChevronIcon, { size: 14, open: open3 }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { "aria-hidden": "true", style: { width: 14, flex: "0 0 auto" } }),
        entry.kind === "directory" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(FolderIcon, { size: 16, open: open3 }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(FileIcon, { size: 16, name: entry.name }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }, children: entry.name }),
        entry.kind === "file" && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: metaStyle, children: formatSize(entry.size) })
      ]
    }
  );
  if (entry.kind !== "directory") return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("li", { children: row });
  const notePad = `2px 4px 2px ${4 + (depth + 1) * INDENT}px`;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("li", { children: [
    row,
    open3 && (children.error !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { ...noteStyle, padding: notePad }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Notice, { kind: "error", children: children.error }) }) : children.data === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { ...noteStyle, padding: notePad }, children: t("common.loading") }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("ul", { style: treeStyle2, children: children.data.entries.map((child) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        TreeRow,
        {
          entry: child,
          depth: depth + 1,
          scope: props.scope,
          expanded: props.expanded,
          onToggle: props.onToggle,
          onOpenFile: props.onOpenFile
        },
        child.path
      )) }),
      children.data.entries.some((child) => child.truncated === true) && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { ...noteStyle, padding: notePad }, children: t("explorer.truncated") })
    ] }))
  ] });
}
function FilesView(props) {
  const t = useT();
  const scope = [
    props.workspace === void 0 ? void 0 : `&workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === void 0 ? void 0 : `&session=${encodeURIComponent(props.sessionId)}`
  ].filter(Boolean).join("");
  const tree = useResource(`/explorer/tree?path=${scope}`);
  const [expanded, setExpanded] = (0, import_react13.useState)(() => /* @__PURE__ */ new Set());
  const toggle = (0, import_react13.useCallback)((path) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);
  if (tree.error !== void 0) return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Notice, { kind: "error", children: tree.error });
  if (tree.data === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { fontSize: 14, color: token.textMuted }, children: t("common.loading") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("ul", { style: treeStyle2, children: tree.data.entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      TreeRow,
      {
        entry,
        depth: 0,
        scope,
        expanded,
        onToggle: toggle,
        onOpenFile: props.onOpenFile
      },
      entry.path
    )) }),
    tree.data.entries.some((entry) => entry.truncated === true) && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { ...noteStyle, padding: `2px 4px 2px ${4 + INDENT}px` }, children: t("explorer.truncated") })
  ] });
}
function EditorView(props) {
  const t = useT();
  const file = useResource(
    `/explorer/file?path=${encodeURIComponent(props.path)}${props.scope.length === 0 ? "" : `&${props.scope}`}`
  );
  const [menuOpen, setMenuOpen] = (0, import_react13.useState)(false);
  const [failure, setFailure] = (0, import_react13.useState)(void 0);
  async function openExternal(editor) {
    const parts = [
      props.scope.length === 0 ? null : props.scope,
      `path=${encodeURIComponent(props.path)}`,
      `editor=${editor}`
    ].filter((part) => part !== null);
    const result = await callApi(`/explorer/open-editor?${parts.join("&")}`);
    setMenuOpen(false);
    if (result.ok) return;
    setFailure({ text: t("explorer.openEditorFailed", { message: result.message }), seq: Date.now() });
  }
  if (file.error !== void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Notice, { kind: "error", children: t("explorer.viewFailed", { message: file.error }) });
  }
  if (file.data === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { fontSize: 14, color: token.textMuted }, children: t("common.loading") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          // The panel scrolls the whole view, so the header row (path, size,
          // and the "open" menu) would ride away with the file content. Sticky
          // pins it to the top while the content below scrolls — the same
          // treatment the review list's filter row gets. An opaque background
          // hides content passing underneath, and a z-index keeps it above them.
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: token.surfaceBase,
          padding: "6px 0 2px",
          margin: "-6px 0 0"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "span",
            {
              title: props.path,
              style: { fontSize: 13, color: token.textMuted, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
              children: props.path
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: noteStyle, children: formatSize(file.data.bytes) }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            import_dsh_client_ui_primitives.Menu,
            {
              open: menuOpen,
              onClose: () => {
                setMenuOpen(false);
              },
              onSelect: (id) => {
                void openExternal(id);
              },
              align: "end",
              portal: true,
              items: [
                { id: "explorer", label: t("explorer.openWith.explorer"), icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(FolderIcon2, { size: 14 }) },
                { id: "vscode", label: t("explorer.openWith.vscode"), icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(VscodeIcon, { size: 14 }) },
                { id: "idea", label: t("explorer.openWith.idea"), icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IdeaIcon, { size: 14 }) }
              ],
              anchor: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
                "button",
                {
                  type: "button",
                  "aria-label": t("explorer.openEditor"),
                  title: t("explorer.openEditor"),
                  "aria-expanded": menuOpen,
                  onClick: () => {
                    setMenuOpen((value) => !value);
                  },
                  style: { ...buttonStyle, height: 22, minHeight: 0, padding: "0 7px", fontSize: 12, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: t("turn.open") }),
                    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ChevronIcon, { size: 11, open: menuOpen })
                  ]
                }
              )
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CodeView, { path: props.path, content: file.data.content }),
    file.data.truncated && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: noteStyle, children: t("explorer.truncatedFile", { lines: file.data.content.split("\n").length }) }),
    failure !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_dsh_client_ui_primitives.Toast, { text: failure.text, onDone: () => {
      setFailure(void 0);
    } }, failure.seq)
  ] });
}
function TabStrip(props) {
  const t = useT();
  const [menuOpen, setMenuOpen] = (0, import_react13.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
    "div",
    {
      role: "tablist",
      style: { display: "flex", alignItems: "center", gap: 3, flex: 1, minWidth: 0, overflow: "hidden" },
      children: [
        props.tabs.map((tab) => {
          const active = tab.id === props.activeId;
          const label = tab.kind === "editor" || tab.kind === "diff" ? baseOf2(tab.path ?? "") : tab.kind === "files" ? t("explorer.files") : t("explorer.changes");
          return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
            "div",
            {
              role: "tab",
              "aria-selected": active,
              tabIndex: 0,
              title: tab.kind === "editor" || tab.kind === "diff" ? tab.path : void 0,
              onClick: () => {
                props.onSelect(tab.id);
              },
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  props.onSelect(tab.id);
                  event.preventDefault();
                }
              },
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                maxWidth: "38%",
                padding: "6px 7px 6px 10px",
                borderRadius: 6,
                fontSize: 14,
                cursor: "pointer",
                userSelect: "none",
                color: active ? token.text : token.textMuted,
                background: active ? token.hover : "transparent",
                border: `1px solid ${active ? token.border : "transparent"}`,
                flex: "0 1 auto",
                minWidth: 0
              },
              children: [
                tab.kind === "files" && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(FilesIcon, { size: 16 }),
                (tab.kind === "review" || tab.kind === "diff") && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(GitIcon, { size: 16 }),
                tab.kind === "editor" && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(FileIcon, { size: 16, name: baseOf2(tab.path ?? "") }),
                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: label }),
                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                  "button",
                  {
                    type: "button",
                    "aria-label": `${t("explorer.closeTab")}: ${label}`,
                    onClick: (event) => {
                      event.stopPropagation();
                      props.onClose(tab.id);
                    },
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 2,
                      border: "none",
                      borderRadius: 4,
                      background: "transparent",
                      color: "inherit",
                      opacity: 0.6,
                      cursor: "pointer",
                      flex: "0 0 auto"
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CloseIcon, { size: 12 })
                  }
                )
              ]
            },
            tab.id
          );
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
          import_dsh_client_ui_primitives.Menu,
          {
            open: menuOpen,
            onClose: () => {
              setMenuOpen(false);
            },
            onSelect: (id) => {
              setMenuOpen(false);
              props.onOpen(id === "files" ? "files" : "review");
            },
            align: "start",
            portal: true,
            items: [
              { type: "label", id: "views", text: t("explorer.views") },
              { id: "files", label: t("explorer.files"), icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(FilesIcon, { size: 14 }) },
              { id: "changes", label: t("explorer.changes"), icon: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(GitIcon, { size: 14 }) }
            ],
            anchor: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "button",
              {
                type: "button",
                "aria-label": t("explorer.newTab"),
                title: t("explorer.newTab"),
                "aria-expanded": menuOpen,
                onClick: () => {
                  setMenuOpen((value) => !value);
                },
                style: { ...iconButtonStyle, width: 26, height: 26, flex: "0 0 auto" },
                children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(PlusIcon, { size: 16 })
              }
            )
          }
        )
      ]
    }
  );
}
function ExplorerPanel(props) {
  const t = useT();
  const tabScope = props.workspace ?? (props.sessionId === void 0 ? "settings-preview" : `session:${props.sessionId}`);
  const { tabs, activeId, open: openPanelTab2, select: selectPanelTab, close: closePanelTab } = useTabs(tabScope);
  (0, import_react13.useEffect)(() => bindPanelTabs(tabScope), [tabScope]);
  const active = tabs.find((tab) => tab.id === activeId);
  const scope = [
    props.workspace === void 0 ? void 0 : `workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === void 0 ? void 0 : `session=${encodeURIComponent(props.sessionId)}`
  ].filter(Boolean).join("&");
  const query = scope.length === 0 ? "" : `?${scope}`;
  const status = useResource(`/explorer/status${query}`);
  const reloadRef = (0, import_react13.useRef)(status.reload);
  reloadRef.current = status.reload;
  (0, import_react13.useEffect)(() => {
    const timer = window.setInterval(() => {
      reloadRef.current();
    }, 5e3);
    return () => {
      window.clearInterval(timer);
    };
  }, [query]);
  return (
    // `flex: 1` and `minHeight: 0` together: the first claims the panel's full
    // height instead of collapsing to content, the second lets the scrolling
    // children shrink below their intrinsic size rather than overflowing it.
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { "data-dsh-plugin": "dsh-ext", "data-dsh-part": "explorer", style: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minHeight: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
          TabStrip,
          {
            tabs,
            activeId,
            onOpen: openPanelTab2,
            onSelect: selectPanelTab,
            onClose: closePanelTab
          }
        ),
        status.data?.branch !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { style: { ...metaStyle, flex: "0 0 auto" }, children: [
          status.data.branch,
          (status.data.ahead ?? 0) > 0 && ` \u2191${status.data.ahead}`,
          (status.data.behind ?? 0) > 0 && ` \u2193${status.data.behind}`
        ] })
      ] }),
      status.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Notice, { kind: "error", children: status.error }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { overflow: "auto", minHeight: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(ViewBoundary, { children: [
        active?.kind === "review" && (status.data === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { fontSize: 14, color: token.textMuted }, children: t("common.loading") }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ReviewView, { status: status.data, onOpenDiff: (path) => {
          openPanelTab2("diff", path);
        } })),
        active?.kind === "files" && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
          FilesView,
          {
            workspace: props.workspace,
            sessionId: props.sessionId,
            onOpenFile: (path) => {
              openPanelTab2("editor", path);
            }
          }
        ),
        active?.kind === "editor" && active.path !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(EditorView, { path: active.path, scope }),
        active?.kind === "diff" && active.path !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DiffView, { path: active.path, scope })
      ] }, active?.id ?? "none") })
    ] })
  );
}

// node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.3/node_modules/@deepseek-ai/cosmokit/lib/index.js
function isNullable(value) {
  return value === null || value === void 0;
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object, filter) {
  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
  return result;
}
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
(function(Binary2) {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    else return source;
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c2) => c2.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone2(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached2 = refs.get(source);
  if (cached2) return cached2;
  if (Array.isArray(source)) {
    const result2 = [];
    refs.set(source, result2);
    source.forEach((value, index2) => {
      result2[index2] = Reflect.apply(clone2, null, [value, refs]);
    });
    return result2;
  }
  const result = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) descriptor.value = Reflect.apply(clone2, null, [descriptor.value, refs]);
    Reflect.defineProperty(result, key, descriptor);
  }
  return result;
}
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (!strict && isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index2) => deepEqual(item, b2[index2]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
    return true;
  }) ?? Object.keys({
    ...a,
    ...b
  }).every((key) => deepEqual(a[key], b[key], strict));
}
var Time;
(function(Time2) {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date2 = /* @__PURE__ */ new Date(), offset) {
    if (typeof date2 === "number") date2 = new Date(date2);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date2.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date2 = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date2 + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date2) {
    const parsed = parseTime(date2);
    if (parsed) date2 = Date.now() + parsed;
    else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date2}`;
    else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date2}`;
    return date2 ? new Date(date2) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
    else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
    else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
    else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// node_modules/.pnpm/@deepseek-ai+schemastery@3.18.2/node_modules/@deepseek-ai/schemastery/lib/index.mjs
var kSchema = Symbol.for("schemastery");
var kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
  options;
  name = "ValidationError";
  constructor(message, options) {
    let prefix = "$";
    for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
    else if (typeof segment === "number") prefix += "[" + segment + "]";
    else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
    if (prefix.startsWith(".")) prefix = prefix.slice(1);
    super((prefix === "$" ? "" : `${prefix} `) + message);
    this.options = options;
  }
  static is(error) {
    return !!error?.[kValidationError];
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
var Schema2 = function(options) {
  const schema = function(data, options2 = {}) {
    return Schema2.resolve(data, schema, options2)[0];
  };
  if (options.refs) {
    const refs = mapValues(options.refs, (options2) => new Schema2(options2));
    const getRef = (uid2) => refs[uid2];
    for (const key in refs) {
      const options2 = refs[key];
      options2.sKey = getRef(options2.sKey);
      options2.inner = getRef(options2.inner);
      options2.list = options2.list && options2.list.map(getRef);
      options2.dict = options2.dict && mapValues(options2.dict, getRef);
    }
    return refs[options.uid];
  }
  Object.assign(schema, options);
  if (typeof schema.callback === "string") try {
    schema.callback = new Function("return " + schema.callback)();
  } catch {
  }
  Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
  Object.setPrototypeOf(schema, Schema2.prototype);
  schema.meta ||= {};
  schema.toString = schema.toString.bind(schema);
  return schema;
};
Schema2.prototype = Object.create(Function.prototype);
Schema2.prototype[kSchema] = true;
Object.defineProperty(Schema2.prototype, "~standard", { get() {
  return {
    version: 1,
    vendor: "schemastery",
    validate: (value) => {
      try {
        return { value: Schema2.resolve(value, this, {})[0] };
      } catch (error) {
        if (ValidationError.is(error)) return { issues: [{
          message: error.message,
          path: error.options.path
        }] };
        throw error;
      }
    }
  };
} });
Schema2.ValidationError = ValidationError;
Schema2.prototype.toJSON = function toJSON() {
  if (globalThis.__schemastery_refs__) {
    globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
    return this.uid;
  }
  globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
  globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
  const result = {
    uid: this.uid,
    refs: globalThis.__schemastery_refs__
  };
  globalThis.__schemastery_refs__ = void 0;
  return result;
};
Schema2.prototype.set = function set(key, value) {
  this.dict[key] = value;
  return this;
};
Schema2.prototype.push = function push(value) {
  this.list.push(value);
  return this;
};
function mergeDesc(original, messages2) {
  const result = typeof original === "string" ? { "": original } : { ...original };
  for (const locale in messages2) {
    const value = messages2[locale];
    if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
    else if (typeof value === "string") result[locale] = value;
  }
  return result;
}
function getInner(value) {
  return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
  return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema2.prototype.i18n = function i18n(messages2) {
  const schema = Schema2(this);
  const desc = mergeDesc(schema.meta.description, messages2);
  if (Object.keys(desc).length) schema.meta.description = desc;
  if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
    return inner.i18n(mapValues(messages2, (data) => getInner(data)?.[key] ?? data?.[key]));
  });
  if (schema.list) schema.list = schema.list.map((inner, index2) => {
    return inner.i18n(mapValues(messages2, (data = {}) => {
      if (Array.isArray(getInner(data))) return getInner(data)[index2];
      if (Array.isArray(data)) return data[index2];
      return extractKeys(data);
    }));
  });
  if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages2, (data) => {
    if (getInner(data)) return getInner(data);
    return extractKeys(data);
  }));
  if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages2, (data) => data?.$key));
  return schema;
};
Schema2.prototype.extra = function extra(key, value) {
  const schema = Schema2(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
};
for (const key of [
  "required",
  "disabled",
  "collapse",
  "hidden",
  "loose"
]) Object.assign(Schema2.prototype, { [key](value = true) {
  const schema = Schema2(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
Schema2.prototype.deprecated = function deprecated() {
  const schema = Schema2(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "deprecated",
    type: "danger"
  });
  return schema;
};
Schema2.prototype.experimental = function experimental() {
  const schema = Schema2(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "experimental",
    type: "warning"
  });
  return schema;
};
Schema2.prototype.pattern = function pattern(regexp) {
  const schema = Schema2(this);
  const pattern2 = pick(regexp, ["source", "flags"]);
  schema.meta = {
    ...schema.meta,
    pattern: pattern2
  };
  return schema;
};
Schema2.prototype.simplify = function simplify(value) {
  if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
  if (isNullable(value)) return value;
  if (this.type === "object" || this.type === "dict") {
    const result = {};
    for (const key in value) {
      const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
      if (this.type === "dict" || !isNullable(item)) result[key] = item;
    }
    if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
    return result;
  } else if (this.type === "array" || this.type === "tuple") {
    const result = [];
    value.forEach((value2, index2) => {
      const schema = this.type === "array" ? this.inner : this.list[index2];
      const item = schema ? schema.simplify(value2) : value2;
      result.push(item);
    });
    return result;
  } else if (this.type === "intersect") {
    const result = {};
    for (const item of this.list) Object.assign(result, item.simplify(value));
    return result;
  } else if (this.type === "union") for (const schema of this.list) try {
    Schema2.resolve(value, schema, {});
    return schema.simplify(value);
  } catch {
  }
  return value;
};
Schema2.prototype.toString = function toString(inline) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema2.prototype.role = function role(role, extra2) {
  const schema = Schema2(this);
  schema.meta = {
    ...schema.meta,
    role,
    extra: extra2
  };
  return schema;
};
for (const key of [
  "default",
  "link",
  "comment",
  "description",
  "max",
  "min",
  "step"
]) Object.assign(Schema2.prototype, { [key](value) {
  const schema = Schema2(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
var resolvers = {};
Schema2.extend = function extend(type, resolve2) {
  resolvers[type] = resolve2;
};
Schema2.resolve = function resolve(data, schema, options = {}, strict = false) {
  if (!schema) return [data];
  if (options.ignore?.(data, schema)) return [data];
  if (isNullable(data) && schema.type !== "lazy") {
    if (schema.meta.required) throw new ValidationError(`missing required value`, options);
    let current3 = schema;
    let fallback2 = schema.meta.default;
    while (current3?.type === "intersect" && isNullable(fallback2)) {
      current3 = current3.list[0];
      fallback2 = current3?.meta.default;
    }
    if (isNullable(fallback2)) return [data];
    data = clone2(fallback2);
  }
  const callback = resolvers[schema.type];
  if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
  try {
    return callback(data, schema, options, strict);
  } catch (error) {
    if (!schema.meta.loose) throw error;
    return [schema.meta.default];
  }
};
Schema2.from = function from(source) {
  if (isNullable(source)) return Schema2.any();
  else if ([
    "string",
    "number",
    "boolean"
  ].includes(typeof source)) return Schema2.const(source).required();
  else if (source[kSchema]) return source;
  else if (typeof source === "function") switch (source) {
    case String:
      return Schema2.string().required();
    case Number:
      return Schema2.number().required();
    case Boolean:
      return Schema2.boolean().required();
    case Function:
      return Schema2.function().required();
    default:
      return Schema2.is(source).required();
  }
  else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema2.lazy = function lazy(builder) {
  const toJSON2 = () => {
    if (!schema.inner[kSchema]) {
      schema.inner = schema.builder();
      schema.inner.meta = {
        ...schema.meta,
        ...schema.inner.meta
      };
    }
    return schema.inner.toJSON();
  };
  const schema = new Schema2({
    type: "lazy",
    builder,
    inner: { toJSON: toJSON2 }
  });
  return schema;
};
Schema2.natural = function natural() {
  return Schema2.number().step(1).min(0);
};
Schema2.percent = function percent() {
  return Schema2.number().step(0.01).min(0).max(1).role("slider");
};
Schema2.date = function date() {
  return Schema2.union([Schema2.is(Date), Schema2.transform(Schema2.string().role("datetime"), (value, options) => {
    const date2 = new Date(value);
    if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
    return date2;
  }, true)]);
};
Schema2.regExp = function regExp(flag = "") {
  return Schema2.union([Schema2.is(RegExp), Schema2.transform(Schema2.string().role("regexp", { flag }), (value, options) => {
    try {
      return new RegExp(value, flag);
    } catch (e) {
      throw new ValidationError(e.message, options);
    }
  }, true)]);
};
Schema2.arrayBuffer = function arrayBuffer(encoding) {
  return Schema2.union([
    Schema2.is(ArrayBuffer),
    Schema2.is(SharedArrayBuffer),
    Schema2.transform(Schema2.any(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value);
      throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
    }, true),
    ...encoding ? [Schema2.transform(Schema2.string(), (value, options) => {
      try {
        return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
      } catch (e) {
        throw new ValidationError(e.message, options);
      }
    }, true)] : []
  ]);
};
Schema2.extend("lazy", (data, schema, options, strict) => {
  if (!schema.inner[kSchema]) {
    schema.inner = schema.builder();
    schema.inner.meta = {
      ...schema.meta,
      ...schema.inner.meta
    };
  }
  return Schema2.resolve(data, schema.inner, options, strict);
});
Schema2.extend("any", (data) => {
  return [data];
});
Schema2.extend("never", (data, _2, options) => {
  throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema2.extend("const", (data, { value }, options) => {
  if (deepEqual(data, value)) return [value];
  throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema2.extend("string", (data, { meta }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta, "string length", options);
  return [data];
});
function decimalShift(data, digits) {
  const str = data.toString();
  if (str.includes("e")) return data * Math.pow(10, digits);
  const index2 = str.indexOf(".");
  if (index2 === -1) return data * Math.pow(10, digits);
  const frac = str.slice(index2 + 1);
  const integer = str.slice(0, index2);
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
  return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
  step = Math.abs(step);
  if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
  const index2 = step.toString().indexOf(".");
  const digits = step.toString().slice(index2 + 1).length;
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema2.extend("number", (data, { meta }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta, "number", options);
  const { step } = meta;
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  return [data];
});
Schema2.extend("boolean", (data, _2, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema2.extend("bitset", (data, { bits, meta }, options) => {
  let value = 0, keys = [];
  if (typeof data === "number") {
    value = data;
    for (const key in bits) if (data & bits[key]) keys.push(key);
  } else if (Array.isArray(data)) {
    keys = data;
    for (const key of keys) {
      if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
      if (key in bits) value |= bits[key];
    }
  } else throw new ValidationError(`expected number or array but got ${data}`, options);
  if (value === meta.default) return [value];
  return [value, keys];
});
Schema2.extend("function", (data, _2, options) => {
  if (typeof data === "function") return [data];
  throw new ValidationError(`expected function but got ${data}`, options);
});
Schema2.extend("is", (data, { constructor }, options) => {
  if (typeof constructor === "function") {
    if (data instanceof constructor) return [data];
    throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
  } else {
    if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
    let prototype = Object.getPrototypeOf(data);
    while (prototype) {
      if (prototype.constructor?.name === constructor) return [data];
      prototype = Object.getPrototypeOf(prototype);
    }
    throw new ValidationError(`expected ${constructor} but got ${data}`, options);
  }
});
function property(data, key, schema, options) {
  try {
    const [value, adapted] = Schema2.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key]
    });
    if (adapted !== void 0) data[key] = adapted;
    return value;
  } catch (e) {
    if (!options?.autofix) throw e;
    delete data[key];
    return schema.meta.default;
  }
}
Schema2.extend("array", (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
  return [data.map((_2, index2) => property(data, index2, inner, options))];
});
Schema2.extend("dict", (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in data) {
    let rKey;
    try {
      rKey = Schema2.resolve(key, sKey, options)[0];
    } catch (error) {
      if (strict) continue;
      throw error;
    }
    result[rKey] = property(data, key, inner, options);
    data[rKey] = data[key];
    if (key !== rKey) delete data[key];
  }
  return [result];
});
Schema2.extend("tuple", (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  const result = list.map((inner, index2) => property(data, index2, inner, options));
  if (strict) return [result];
  result.push(...data.slice(list.length));
  return [result];
});
function merge2(result, data) {
  for (const key in data) {
    if (key in result) continue;
    result[key] = data[key];
  }
}
Schema2.extend("object", (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in dict) {
    const value = property(data, key, dict[key], options);
    if (!isNullable(value) || key in data) result[key] = value;
  }
  if (!strict) merge2(result, data);
  return [result];
});
Schema2.extend("union", (data, { list, toString: toString2 }, options, strict) => {
  const messages2 = [];
  for (const inner of list) try {
    return Schema2.resolve(data, inner, options, strict);
  } catch (error) {
    messages2.push(error);
  }
  throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
});
Schema2.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
  if (!list.length) return [data];
  let result;
  for (const inner of list) {
    const value = Schema2.resolve(data, inner, options, true)[0];
    if (isNullable(value)) continue;
    if (isNullable(result)) result = value;
    else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    else if (typeof value === "object") merge2(result ??= {}, value);
    else if (result !== value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
  }
  if (!strict && isPlainObject(data)) merge2(result, data);
  return [result];
});
Schema2.extend("transform", (data, { inner, callback, preserve }, options) => {
  const [result, adapted = data] = Schema2.resolve(data, inner, options, true);
  if (preserve) return [callback(result)];
  else return [callback(result), callback(adapted)];
});
var formatters = {};
function defineMethod(name2, keys, format) {
  formatters[name2] = format;
  Object.assign(Schema2, { [name2](...args) {
    const schema = new Schema2({ type: name2 });
    keys.forEach((key, index2) => {
      switch (key) {
        case "sKey":
          schema.sKey = args[index2] ?? Schema2.string();
          break;
        case "inner":
          schema.inner = Schema2.from(args[index2]);
          break;
        case "list":
          schema.list = args[index2].map(Schema2.from);
          break;
        case "dict":
          schema.dict = mapValues(args[index2], Schema2.from);
          break;
        case "bits":
          schema.bits = {};
          for (const key2 in args[index2]) {
            if (typeof args[index2][key2] !== "number") continue;
            schema.bits[key2] = args[index2][key2];
          }
          break;
        case "callback": {
          const callback = schema.callback = args[index2];
          callback["toJSON"] ||= () => callback.toString();
          break;
        }
        case "constructor": {
          const constructor = schema.constructor = args[index2];
          if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
          break;
        }
        default:
          schema[key] = args[index2];
      }
    });
    if (name2 === "object" || name2 === "dict") schema.meta.default = {};
    else if (name2 === "array" || name2 === "tuple") schema.meta.default = [];
    else if (name2 === "bitset") schema.meta.default = 0;
    return schema;
  } });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
  if (typeof constructor === "function") return constructor.name;
  else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
  if (Object.keys(dict).length === 0) return "{}";
  return `{ ${Object.entries(dict).map(([key, inner]) => {
    return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
  }).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
  const result = list.map(({ toString: format }) => format()).join(" | ");
  return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
  return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
  "inner",
  "callback",
  "preserve"
], ({ inner }, isInner) => inner.toString(isInner));

// src/config.ts
var DEFAULT_DENY_PATTERNS = [
  "rm\\s+(-[a-zA-Z]*\\s+)*-[a-zA-Z]*[rf]",
  "\\bmkfs(\\.|\\s)",
  "\\bdd\\s+if=",
  ">\\s*/dev/[sh]d[a-z]",
  "\\bsudo\\b",
  "\\bchmod\\s+(-R\\s+)?0?777\\b",
  "\\bchown\\s+-R\\b",
  "\\b(curl|wget)\\b[^|]*\\|\\s*(sudo\\s+)?(ba|z|)sh",
  "\\bgit\\s+push\\b[^\\n]*(--force|-f)\\b",
  "\\bgit\\s+(reset\\s+--hard|clean\\s+-[a-zA-Z]*f)",
  "\\bDROP\\s+(TABLE|DATABASE|SCHEMA)\\b",
  "\\bTRUNCATE\\s+TABLE\\b",
  "\\b(shutdown|reboot|halt|poweroff)\\b",
  "\\breg\\s+delete\\b",
  "\\bRemove-Item\\b[^\\n]*-Recurse[^\\n]*-Force",
  "\\bnpm\\s+publish\\b",
  "\\bdocker\\s+(system\\s+prune|rm\\s+-f)",
  "\\bkubectl\\s+delete\\b"
];
var DEFAULT_READ_PATTERNS = [
  "^\\s*(pwd|cd|ls|dir|tree|find|fd|rg|grep|cat|type|head|tail|less|more|wc|stat|file|which|where)(?:\\s+[^;&|><`$()\\r\\n]*)?\\s*$",
  "^\\s*git\\s+(status|diff|log|show|branch|remote|rev-parse|ls-files)(?:\\s+[^;&|><`$()\\r\\n]*)?\\s*$",
  "^\\s*(npm|pnpm|yarn)\\s+(list|ls|view|outdated|why)(?:\\s+[^;&|><`$()\\r\\n]*)?\\s*$",
  "^\\s*(Get-ChildItem|Get-Content|Get-Item|Get-Location|Select-String|Test-Path|Resolve-Path|Get-Command)(?:\\s+[^;&|><`$()\\r\\n]*)?\\s*$"
];
var DEFAULT_DELETE_PATTERNS = [
  "^tool:(delete|remove|unlink|trash|rm)(?:_|\\b)",
  "(?:^|\\n|[;&|]\\s*)rm\\s+(?:-[^\\s]+\\s+)*[^;&|]+",
  "(?:^|\\n|[;&|]\\s*)(del|erase|rmdir|rd)\\s+(?:/[^\\s]+\\s+)*[^;&|]+",
  "(?:^|\\n|[;&|]\\s*)Remove-Item\\b",
  "(?:^|\\n|[;&|]\\s*)git\\s+(clean|rm)\\b",
  "\\b(DELETE\\s+FROM|DROP\\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE\\s+TABLE)\\b",
  "(?:^|\\n|[;&|]\\s*)docker\\s+(rm|rmi|volume\\s+rm|network\\s+rm|system\\s+prune)\\b",
  "(?:^|\\n|[;&|]\\s*)kubectl\\s+delete\\b",
  "\\*\\*\\*\\s+Delete File\\b",
  '"(?:op|operation|action)"\\s*:\\s*"(?:delete|remove|unlink)"',
  "\\b(unlink|removeSync|rmSync|rmdirSync|os\\.(remove|unlink|rmdir)|shutil\\.rmtree)\\s*\\("
];
var DEFAULT_CHECKPOINT_EXCLUDES = [
  ".git/",
  "node_modules/",
  ".venv/",
  "__pycache__/",
  "dist/",
  "build/",
  "target/",
  ".next/",
  ".turbo/",
  "*.log"
];
var Config = Schema2.object({
  imageComposer: Schema2.object({
    enabled: Schema2.boolean().default(true).description("Composer image entry in the + menu and drag-to-reorder draft images."),
    pickerButton: Schema2.boolean().default(true).description('Add an "Add images" entry at the top of the composer + menu.'),
    dragReorder: Schema2.boolean().default(true).description("Replace the draft-image rail with a drag-reorderable one.")
  }),
  reasoningEffort: Schema2.object({
    enabled: Schema2.boolean().default(true).description("Edit per-model reasoning efforts for third-party (pi-ai) providers from the Models page."),
    defaultFullEfforts: Schema2.boolean().default(true).description("Apply the complete effort ladder to every pi-ai model without an explicit declaration."),
    defaultVision: Schema2.boolean().default(true).description("Declare image input for every pi-ai model without an explicit modality declaration.")
  }),
  modelPicker: Schema2.object({
    groupCollapse: Schema2.boolean().default(true).description("Let the composer's model menu collapse each provider group, and filter models by name.")
  }),
  deepseekBalance: Schema2.object({
    enabled: Schema2.boolean().default(true).description("Show the DeepSeek official API account balance."),
    cacheTtlSeconds: Schema2.number().step(1).min(5).max(3600).default(60).description("How long a fetched balance is reused before refetching."),
    headerBadge: Schema2.boolean().default(true).description("Also show a compact balance chip in the composer, immediately left of the model selector."),
    pollSeconds: Schema2.number().step(1).min(0).max(600).default(30).description("Refresh the balance chip every N seconds. 0 disables polling."),
    peakWindowsBeijing: Schema2.array(Schema2.string()).default(["09:00-12:00", "14:00-18:00"]).description("DeepSeek peak windows in Beijing time (HH:MM-HH:MM); official defaults converted from UTC. Outside them rates are half."),
    peakWeekdaysOnly: Schema2.boolean().default(true).description("Weekend usage is always off-peak, per the official scheme.")
  }),
  commandReview: Schema2.object({
    enabled: Schema2.boolean().default(false).description("Have a second model review high-risk tool calls before they run."),
    mode: Schema2.union([
      Schema2.const("rules-only").description("Screen with local patterns only; never call a model."),
      Schema2.const("rules+llm").description("Screen locally, then send hits to the reviewer model."),
      Schema2.const("all").description("Send every covered tool call to the reviewer model.")
    ]).default("rules+llm"),
    tools: Schema2.array(Schema2.string()).default(["bash", "pwsh", "run_command"]).description("Tool names subject to review."),
    writeOnly: Schema2.boolean().default(true).description("Skip read-only calls; use host tool metadata first and readPatterns as a shell fallback."),
    readPatterns: Schema2.array(Schema2.string()).default([...DEFAULT_READ_PATTERNS]).description("Regular expressions that recognize read-only shell commands when tool metadata is unavailable."),
    absoluteDenyDelete: Schema2.boolean().default(true).description("Deny recognized deletion operations immediately, without model or human review."),
    deletePatterns: Schema2.array(Schema2.string()).default([...DEFAULT_DELETE_PATTERNS]).description("Regular expressions matched against tool name plus command/arguments to recognize deletion operations."),
    provider: Schema2.string().default("deepseek-official").description("Provider route the reviewer model runs on."),
    model: Schema2.string().default("deepseek-v4-flash").description("Reviewer model id."),
    timeoutMs: Schema2.number().step(1).min(1e3).max(12e4).default(2e4).description("Reviewer deadline."),
    onFailure: Schema2.union([
      Schema2.const("ask").description("Escalate to the user (fail-safe)."),
      Schema2.const("deny").description("Refuse the call (fail-closed)."),
      Schema2.const("allow").description("Let the call through and log it (fail-open).")
    ]).default("ask").description("What to do when the reviewer times out, errors, or has no credential."),
    denyPatterns: Schema2.array(Schema2.string()).default([...DEFAULT_DENY_PATTERNS]).description("Regular expressions that mark a command as high-risk."),
    auditLimit: Schema2.number().step(1).min(0).max(1e4).default(500).description("How many past verdicts to retain for the settings page.")
  }),
  explorer: Schema2.object({
    enabled: Schema2.boolean().default(true).description("Project explorer panel: directory tree plus uncommitted changes."),
    side: Schema2.union([Schema2.const("left"), Schema2.const("right")]).default("right"),
    defaultOpen: Schema2.boolean().default(false),
    respectGitignore: Schema2.boolean().default(true).description("Hide ignored files from the directory tree."),
    maxEntriesPerDir: Schema2.number().step(1).min(50).max(5e3).default(500).description("Cap on entries returned for one directory.")
  }),
  sessionAdmin: Schema2.object({
    enabled: Schema2.boolean().default(true).description("Surface the recycle bin and let undo/edit archive the original session."),
    attachmentGc: Schema2.boolean().default(false).description("On permanent delete, remove attachment blobs no remaining session references. Scans every session log, so it is off by default.")
  }),
  pluginSafety: Schema2.object({
    enabled: Schema2.boolean().default(true).description("Plugin inventory, quarantine list, and safe-mode helpers."),
    quarantine: Schema2.array(Schema2.string()).default([]).description("Bundle package names to disable on the next start.")
  }),
  checkpoints: Schema2.object({
    enabled: Schema2.boolean().default(true).description("Per-session rollback via a shadow git repository. Never touches the project's own git history."),
    snapshotOn: Schema2.union([
      Schema2.const("turn").description("One snapshot before the turn's first mutation and one at turn end."),
      Schema2.const("tool").description("A snapshot before every mutating tool call.")
    ]).default("turn"),
    excludes: Schema2.array(Schema2.string()).default([...DEFAULT_CHECKPOINT_EXCLUDES]).description("Shadow-repository exclude patterns (git ignore syntax)."),
    maxFileSizeMb: Schema2.number().step(1).min(1).max(1024).default(32).description("Skip files larger than this in a snapshot."),
    retentionDays: Schema2.number().step(1).min(0).max(3650).default(30).description("Prune checkpoints older than this. 0 keeps everything.")
  })
});

// src/client/SettingsPage.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function Disclosure(props) {
  const [open3, setOpen] = (0, import_react14.useState)(props.defaultOpen === true);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { paddingTop: 4 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
      "button",
      {
        type: "button",
        "aria-expanded": open3,
        onClick: () => {
          setOpen(!open3);
        },
        style: { ...buttonStyle, fontSize: 11, padding: "2px 8px" },
        children: [
          open3 ? "\u25BE" : "\u25B8",
          " ",
          props.label
        ]
      }
    ),
    open3 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { paddingTop: 8 }, children: props.children })
  ] });
}
var TABS = ["input", "balance", "review", "files", "sessions", "plugins"];
var SettingsBoundary = class extends import_react14.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("[dsh-ext] the settings page crashed:", error);
  }
  render() {
    if (this.state.failed) {
      return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Notice, { kind: "error", children: "[dsh-ext] \u8BBE\u7F6E\u9875\u6E32\u67D3\u51FA\u9519\uFF1A\u8BF7\u91CD\u542F DeepSeek Harness \u8BA9\u63D2\u4EF6\u524D\u540E\u7AEF\u7248\u672C\u4E00\u81F4\uFF1B\u82E5\u4ECD\u590D\u73B0\uFF0C\u8BF7\u628A\u63A7\u5236\u53F0\u62A5\u9519\u53CD\u9988\u7ED9\u63D2\u4EF6\u4F5C\u8005\u3002" });
    }
    return this.props.children;
  }
};
function TabStrip2(props) {
  const t = useT();
  const labels = {
    input: t("tab.input"),
    balance: t("tab.balance"),
    review: t("tab.review"),
    files: t("tab.files"),
    sessions: t("tab.sessions"),
    plugins: t("tab.plugins")
  };
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { role: "tablist", style: { display: "flex", gap: 2, borderBottom: `1px solid ${token.border}`, overflowX: "auto" }, children: TABS.map((tab) => {
    const active = tab === props.active;
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": active,
        onClick: () => {
          props.onSelect(tab);
        },
        style: {
          ...buttonStyle,
          border: "none",
          borderBottom: `2px solid ${active ? token.accent : "transparent"}`,
          borderRadius: 0,
          background: "transparent",
          padding: "8px 12px",
          fontSize: 14,
          lineHeight: 1.4,
          fontWeight: active ? 500 : 400,
          whiteSpace: "nowrap",
          color: active ? token.text : token.textMuted
        },
        children: labels[tab]
      },
      tab
    );
  }) });
}
function SettingsPage() {
  const t = useT();
  const { view, error, busy, set: set2, setMany } = useConfig();
  const [tab, setTab] = (0, import_react14.useState)("input");
  const reviewModels = useResource("/review/models");
  if (view === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { padding: 16, fontSize: 13, color: token.textMuted }, children: error === void 0 ? t("common.loading") : error });
  }
  const c2 = view.value;
  const disabled = busy || !view.writable;
  const currentModelKey = `${c2.commandReview.provider}::${c2.commandReview.model}`;
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { padding: "0 4px 24px", color: token.text }, "data-dsh-plugin": "dsh-ext", children: [
    !view.writable && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { paddingTop: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Notice, { kind: "info", children: t("common.readonly") }) }),
    error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { paddingTop: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Notice, { kind: "error", children: error }) }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { paddingTop: 8 }, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(TabStrip2, { active: tab, onSelect: setTab }) }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { paddingTop: 12, paddingLeft: 8 }, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(SettingsBoundary, { children: [
      tab === "input" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          Section,
          {
            title: t("section.images"),
            description: t("section.images.desc"),
            action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Toggle,
              {
                label: t("section.images"),
                checked: c2.imageComposer.enabled,
                disabled,
                onChange: (next) => {
                  set2(["imageComposer", "enabled"], next);
                }
              }
            ),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                Row,
                {
                  label: t("images.button"),
                  hint: t("images.button.hint"),
                  control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    Toggle,
                    {
                      label: t("images.button"),
                      checked: c2.imageComposer.pickerButton,
                      disabled: disabled || !c2.imageComposer.enabled,
                      onChange: (next) => {
                        set2(["imageComposer", "pickerButton"], next);
                      }
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                Row,
                {
                  label: t("images.drag"),
                  hint: t("images.drag.hint"),
                  control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    Toggle,
                    {
                      label: t("images.drag"),
                      checked: c2.imageComposer.dragReorder,
                      disabled: disabled || !c2.imageComposer.enabled,
                      onChange: (next) => {
                        set2(["imageComposer", "dragReorder"], next);
                      }
                    }
                  )
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          Section,
          {
            title: t("section.effort"),
            description: t("section.effort.desc"),
            action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Toggle,
              {
                label: t("section.effort"),
                checked: c2.reasoningEffort.enabled,
                disabled,
                onChange: (next) => {
                  set2(["reasoningEffort", "enabled"], next);
                }
              }
            ),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                Row,
                {
                  label: t("effort.defaultFull"),
                  hint: t("effort.defaultFull.hint"),
                  control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    Toggle,
                    {
                      label: t("effort.defaultFull"),
                      checked: c2.reasoningEffort.defaultFullEfforts ?? true,
                      disabled: disabled || !c2.reasoningEffort.enabled,
                      onChange: (next) => {
                        set2(["reasoningEffort", "defaultFullEfforts"], next);
                      }
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                Row,
                {
                  label: t("vision.defaultAll"),
                  hint: t("vision.defaultAll.hint"),
                  control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    Toggle,
                    {
                      label: t("vision.defaultAll"),
                      checked: c2.reasoningEffort.defaultVision ?? true,
                      disabled: disabled || !c2.reasoningEffort.enabled,
                      onChange: (next) => {
                        set2(["reasoningEffort", "defaultVision"], next);
                      }
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Disclosure, { label: t("effort.models"), children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(EffortsPanel, { enabled: c2.reasoningEffort.enabled }) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Section, { title: t("section.modelPicker"), description: t("section.modelPicker.desc"), children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          Row,
          {
            label: t("modelPicker.collapse"),
            hint: t("modelPicker.collapse.hint"),
            control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Toggle,
              {
                label: t("modelPicker.collapse"),
                checked: c2.modelPicker.groupCollapse,
                disabled,
                onChange: (next) => {
                  set2(["modelPicker", "groupCollapse"], next);
                }
              }
            )
          }
        ) })
      ] }),
      tab === "balance" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
        Section,
        {
          title: t("section.balance"),
          description: t("section.balance.desc"),
          action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            Toggle,
            {
              label: t("section.balance"),
              checked: c2.deepseekBalance.enabled,
              disabled,
              onChange: (next) => {
                set2(["deepseekBalance", "enabled"], next);
              }
            }
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("balance.badge"),
                hint: t("balance.badge.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Toggle,
                  {
                    label: t("balance.badge"),
                    checked: c2.deepseekBalance.headerBadge,
                    disabled: disabled || !c2.deepseekBalance.enabled,
                    onChange: (next) => {
                      set2(["deepseekBalance", "headerBadge"], next);
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("balance.poll"),
                hint: t("balance.poll.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  NumberField,
                  {
                    label: t("balance.poll"),
                    value: c2.deepseekBalance.pollSeconds ?? 30,
                    min: 0,
                    max: 600,
                    step: 5,
                    disabled: disabled || !c2.deepseekBalance.enabled,
                    onCommit: (next) => {
                      set2(["deepseekBalance", "pollSeconds"], next);
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("balance.peakWindows"),
                hint: t("balance.peakWindows.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  TextField,
                  {
                    label: t("balance.peakWindows"),
                    value: (c2.deepseekBalance.peakWindowsBeijing ?? ["09:00-12:00", "14:00-18:00"]).join(", "),
                    disabled: disabled || !c2.deepseekBalance.enabled,
                    width: 220,
                    onCommit: (next) => {
                      const windows = next.split(",").map((window2) => window2.trim()).filter((window2) => window2.length > 0);
                      set2(["deepseekBalance", "peakWindowsBeijing"], windows);
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("balance.peakWeekdays"),
                hint: t("balance.peakWeekdays.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Toggle,
                  {
                    label: t("balance.peakWeekdays"),
                    checked: c2.deepseekBalance.peakWeekdaysOnly ?? true,
                    disabled: disabled || !c2.deepseekBalance.enabled,
                    onChange: (next) => {
                      set2(["deepseekBalance", "peakWeekdaysOnly"], next);
                    }
                  }
                )
              }
            ),
            c2.deepseekBalance.enabled && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { paddingTop: 4 }, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(BalanceCard, { enabled: true }) })
          ]
        }
      ),
      tab === "review" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
        Section,
        {
          title: t("section.review"),
          description: t("section.review.desc"),
          action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            Toggle,
            {
              label: t("section.review"),
              checked: c2.commandReview.enabled,
              disabled,
              onChange: (next) => {
                set2(["commandReview", "enabled"], next);
              }
            }
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.mode"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Select,
                  {
                    label: t("review.mode"),
                    value: c2.commandReview.mode,
                    disabled: disabled || !c2.commandReview.enabled,
                    onChange: (next) => {
                      set2(["commandReview", "mode"], next);
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
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.writeOnly"),
                hint: t("review.writeOnly.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Toggle,
                  {
                    label: t("review.writeOnly"),
                    checked: c2.commandReview.writeOnly ?? true,
                    disabled: disabled || !c2.commandReview.enabled,
                    onChange: (next) => {
                      set2(["commandReview", "writeOnly"], next);
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.absoluteDelete"),
                hint: t("review.absoluteDelete.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Toggle,
                  {
                    label: t("review.absoluteDelete"),
                    checked: c2.commandReview.absoluteDenyDelete ?? true,
                    disabled: disabled || !c2.commandReview.enabled,
                    onChange: (next) => {
                      set2(["commandReview", "absoluteDenyDelete"], next);
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.modelPick"),
                hint: t("review.modelPick.hint"),
                control: (() => {
                  const options = reviewModels.data?.models.map((row) => ({
                    value: `${row.provider}::${row.model}`,
                    label: row.name === row.model ? `${row.name} \xB7 ${row.provider}` : `${row.name} \xB7 ${row.provider} / ${row.model}`
                  })) ?? [];
                  if (!options.some((option) => option.value === currentModelKey)) {
                    options.unshift({ value: currentModelKey, label: `${c2.commandReview.model} \xB7 ${c2.commandReview.provider}` });
                  }
                  if (options.length <= 1) {
                    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { style: { fontSize: 11, color: token.textMuted }, children: currentModelKey });
                  }
                  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    Select,
                    {
                      label: t("review.modelPick"),
                      value: currentModelKey,
                      disabled: disabled || !c2.commandReview.enabled,
                      onChange: (next) => {
                        const separator = next.indexOf("::");
                        setMany([
                          { path: ["commandReview", "provider"], value: next.slice(0, separator) },
                          { path: ["commandReview", "model"], value: next.slice(separator + 2) }
                        ]);
                      },
                      options
                    }
                  );
                })()
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.timeout"),
                hint: t("review.timeout.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  NumberField,
                  {
                    label: t("review.timeout"),
                    value: c2.commandReview.timeoutMs,
                    min: 1e3,
                    max: 12e4,
                    step: 500,
                    disabled: disabled || !c2.commandReview.enabled,
                    onCommit: (next) => {
                      set2(["commandReview", "timeoutMs"], next);
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.onFailure"),
                hint: t("review.onFailure.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Select,
                  {
                    label: t("review.onFailure"),
                    value: c2.commandReview.onFailure,
                    disabled: disabled || !c2.commandReview.enabled,
                    onChange: (next) => {
                      set2(["commandReview", "onFailure"], next);
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
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.tools"),
                hint: t("review.tools.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { style: { fontSize: 11, color: token.textMuted }, children: c2.commandReview.tools.join(", ") })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.denyPatterns"),
                hint: t("review.denyPatterns.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  TextAreaField,
                  {
                    label: t("review.denyPatterns"),
                    value: c2.commandReview.denyPatterns.join("\n"),
                    disabled: disabled || !c2.commandReview.enabled,
                    rows: 7,
                    onCommit: (next) => {
                      set2(["commandReview", "denyPatterns"], next.split("\n").map((line) => line.trim()).filter(Boolean));
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.readPatterns"),
                hint: t("review.readPatterns.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  TextAreaField,
                  {
                    label: t("review.readPatterns"),
                    value: (c2.commandReview.readPatterns ?? DEFAULT_READ_PATTERNS).join("\n"),
                    disabled: disabled || !c2.commandReview.enabled || !(c2.commandReview.writeOnly ?? true),
                    rows: 5,
                    onCommit: (next) => {
                      set2(["commandReview", "readPatterns"], next.split("\n").map((line) => line.trim()).filter(Boolean));
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("review.deletePatterns"),
                hint: t("review.deletePatterns.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  TextAreaField,
                  {
                    label: t("review.deletePatterns"),
                    value: (c2.commandReview.deletePatterns ?? DEFAULT_DELETE_PATTERNS).join("\n"),
                    disabled: disabled || !c2.commandReview.enabled || !(c2.commandReview.absoluteDenyDelete ?? true),
                    rows: 7,
                    onCommit: (next) => {
                      set2(["commandReview", "deletePatterns"], next.split("\n").map((line) => line.trim()).filter(Boolean));
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Disclosure, { label: t("review.verdicts"), children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(AuditPanel, { enabled: c2.commandReview.enabled }) })
          ]
        }
      ),
      tab === "files" && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
        Section,
        {
          title: t("section.explorer"),
          description: t("section.explorer.desc"),
          action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            Toggle,
            {
              label: t("section.explorer"),
              checked: c2.explorer.enabled,
              disabled,
              onChange: (next) => {
                set2(["explorer", "enabled"], next);
              }
            }
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("explorer.side"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Select,
                  {
                    label: t("explorer.side"),
                    value: c2.explorer.side,
                    disabled: disabled || !c2.explorer.enabled,
                    onChange: (next) => {
                      set2(["explorer", "side"], next);
                    },
                    options: [{ value: "left", label: t("explorer.side.left") }, { value: "right", label: t("explorer.side.right") }]
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("explorer.defaultOpen"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Toggle,
                  {
                    label: t("explorer.defaultOpen"),
                    checked: c2.explorer.defaultOpen,
                    disabled: disabled || !c2.explorer.enabled,
                    onChange: (next) => {
                      set2(["explorer", "defaultOpen"], next);
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("explorer.gitignore"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Toggle,
                  {
                    label: t("explorer.gitignore"),
                    checked: c2.explorer.respectGitignore,
                    disabled: disabled || !c2.explorer.enabled,
                    onChange: (next) => {
                      set2(["explorer", "respectGitignore"], next);
                    }
                  }
                )
              }
            ),
            c2.explorer.enabled && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Disclosure, { label: t("explorer.preview"), children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { border: `1px solid ${token.border}`, borderRadius: 8, padding: 8, maxHeight: 300, overflow: "hidden", display: "flex" }, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ExplorerPanel, {}) }) })
          ]
        }
      ),
      tab === "sessions" && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_jsx_runtime13.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
        Section,
        {
          title: t("section.checkpoints"),
          description: t("section.checkpoints.desc"),
          action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            Toggle,
            {
              label: t("section.checkpoints"),
              checked: c2.checkpoints.enabled,
              disabled,
              onChange: (next) => {
                set2(["checkpoints", "enabled"], next);
              }
            }
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("cp.snapshotOn"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                  Select,
                  {
                    label: t("cp.snapshotOn"),
                    value: c2.checkpoints.snapshotOn,
                    disabled: disabled || !c2.checkpoints.enabled,
                    onChange: (next) => {
                      set2(["checkpoints", "snapshotOn"], next);
                    },
                    options: [
                      { value: "turn", label: t("cp.snapshotOn.turn") },
                      { value: "tool", label: t("cp.snapshotOn.tool") }
                    ]
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("cp.retention"),
                hint: t("cp.retention.hint"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { style: { fontSize: 11, color: token.textMuted }, children: [
                  c2.checkpoints.retentionDays,
                  " ",
                  t("common.days")
                ] })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              Row,
              {
                label: t("cp.maxSize"),
                control: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { style: { fontSize: 11, color: token.textMuted }, children: [
                  c2.checkpoints.maxFileSizeMb,
                  " MB"
                ] })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Disclosure, { label: t("cp.list"), children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(CheckpointsPanel, { enabled: c2.checkpoints.enabled }) })
          ]
        }
      ) }),
      tab === "plugins" && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        Section,
        {
          title: t("section.plugins"),
          description: t("section.plugins.desc"),
          action: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            Toggle,
            {
              label: t("section.plugins"),
              checked: c2.pluginSafety.enabled,
              disabled,
              onChange: (next) => {
                set2(["pluginSafety", "enabled"], next);
              }
            }
          ),
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Disclosure, { label: t("plugins.list"), defaultOpen: c2.pluginSafety.quarantine.length > 0, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(PluginsPanel, { enabled: c2.pluginSafety.enabled }) })
        }
      )
    ] }) })
  ] });
}

// src/client/TrashModal.tsx
var import_react15 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime14 = require("react/jsx-runtime");
function size(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function stamp(at) {
  return Number.isFinite(at) && at > 0 ? new Date(at).toLocaleString() : "unknown";
}
function TrashModal(props) {
  const t = useT();
  const list = useResource("/sessions", props.open);
  const command = useCommand(list.reload);
  const [busy, setBusy] = (0, import_react15.useState)(false);
  const [confirm, setConfirm] = (0, import_react15.useState)(null);
  if (!props.open) return null;
  const trash = list.data?.trash ?? [];
  const onConfirmClose = () => {
    if (!busy && !command.busy) setConfirm(null);
  };
  const onDeleteConfirmed = () => {
    if (confirm === null || busy || command.busy) return;
    const body = confirm.kind === "all" ? { all: true } : { sessionId: confirm.id };
    setBusy(true);
    void command.run("/sessions/purge", body).finally(() => {
      setBusy(false);
      setConfirm(null);
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
      import_dsh_client_ui_primitives2.Modal,
      {
        title: t("sessions.trashCount", { n: trash.length }),
        open: true,
        className: "dsh-devtool-trash-card",
        onClose: () => {
          if (!busy && !command.busy) props.onClose();
        },
        footer: /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            "button",
            {
              type: "button",
              disabled: busy || command.busy || trash.length === 0,
              onClick: () => {
                setConfirm({ kind: "all" });
              },
              style: { ...buttonStyle, fontSize: 12, borderColor: token.danger, color: token.danger },
              children: t("sessions.emptyTrash")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", { type: "button", disabled: busy || command.busy, onClick: props.onClose, style: buttonStyle, children: t("common.close") })
        ] }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("style", { children: `.dsh-devtool-trash-card { width: min(560px, 92vw); max-height: min(80vh, 640px); } .dsh-devtool-trash-card .dsh-devtool-trash-body { max-height: min(56vh, 420px); }` }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "dsh-devtool-trash-body", style: { display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }, children: [
            list.data === void 0 && list.error === void 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: { color: token.textMuted }, children: t("common.loading") }),
            list.data !== void 0 && trash.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: { color: token.textMuted }, children: t("sessions.trashEmpty") }),
            list.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Notice, { kind: "error", children: list.error }),
            command.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Notice, { kind: "error", children: command.error }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("ul", { style: { listStyle: "none", margin: 0, padding: 0, overflowY: "auto", flex: "1 1 auto", minHeight: 0, overscrollBehavior: "contain" }, children: trash.map((row) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("li", { style: { display: "flex", gap: 8, alignItems: "baseline", padding: "5px 2px", borderBottom: `1px solid ${token.border}` }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { style: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: row.title }),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { style: { fontSize: 10, color: token.textMuted }, children: [
                  t("sessions.updatedAt", { when: stamp(row.updatedAt) }),
                  " \xB7 ",
                  size(row.sizeBytes),
                  row.workspace !== void 0 && ` \xB7 ${row.workspace}`
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                "button",
                {
                  type: "button",
                  disabled: command.busy,
                  onClick: () => {
                    void command.run("/sessions/restore", { sessionId: row.id }).then((ok) => {
                    });
                  },
                  style: { ...buttonStyle, fontSize: 11, whiteSpace: "nowrap" },
                  children: t("common.restore")
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                "button",
                {
                  type: "button",
                  disabled: busy || command.busy,
                  onClick: () => {
                    setConfirm({ kind: "one", id: row.id, title: row.title });
                  },
                  style: { ...buttonStyle, fontSize: 11, borderColor: token.danger, color: token.danger, whiteSpace: "nowrap" },
                  children: t("sessions.deleteForever")
                }
              )
            ] }, row.id)) })
          ] })
        ]
      }
    ),
    confirm !== null && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      import_dsh_client_ui_primitives2.Modal,
      {
        title: confirm.kind === "all" ? t("sessions.emptyTrash") : t("sessions.deleteForever"),
        open: true,
        onClose: onConfirmClose,
        footer: /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", { type: "button", disabled: busy || command.busy, onClick: onConfirmClose, style: buttonStyle, children: t("common.cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            "button",
            {
              type: "button",
              disabled: busy || command.busy,
              onClick: onDeleteConfirmed,
              style: { ...buttonStyle, borderColor: token.danger, color: token.danger },
              children: busy ? t("common.loading") : t("sessions.deleteForever")
            }
          )
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: { fontSize: 13, lineHeight: 1.55, color: token.textSecondary }, children: confirm.kind === "all" ? t("sessions.emptyTrashConfirm") : t("sessions.deleteForeverConfirm", { title: confirm.title }) })
      }
    )
  ] });
}

// src/client/TurnChangesCard.tsx
var import_react18 = require("react");
var import_dsh_client_ui_primitives3 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/rewind.ts
async function rewindTurn(props) {
  const undoAnchorSeq = props.detail?.undoAnchorSeq;
  if (props.checkpointId === void 0) {
    return { ok: false, reason: "no-sessions", message: props.firstTurnText };
  }
  const restore = await callApi("/checkpoints/restore", {
    body: { id: props.checkpointId, session: props.sessionId, confirm: true }
  });
  if (!restore.ok) return { ok: false, reason: "restore-failed", message: restore.message };
  if (undoAnchorSeq === void 0) {
    const workspaceId = props.workspace !== void 0 ? props.workspaceIdOf?.(props.workspace) : void 0;
    if (props.workspaces !== void 0 && workspaceId !== void 0) {
      try {
        const childId = await props.workspaces.connectWorkspace(workspaceId);
        props.sessions.open(childId);
        return { ok: true, childId, fresh: true };
      } catch (startError) {
        console.warn("[dsh-ext] starting the fresh session failed:", startError);
        return { ok: false, reason: "new-session-failed", message: startError instanceof Error ? startError.message : String(startError) };
      }
    }
    return { ok: false, reason: "first-turn", message: props.firstTurnText };
  }
  try {
    const childId = await props.sessions.fork({
      sessionId: props.sessionId,
      atSeq: undoAnchorSeq,
      increaseTitle: true
    });
    props.sessions.open(childId);
    return { ok: true, childId: String(childId), fresh: false };
  } catch (forkError) {
    console.warn("[dsh-ext] the chat fork after restore failed:", forkError);
    return {
      ok: false,
      reason: "fork-failed",
      message: props.forkFailedText(forkError instanceof Error ? forkError.message : String(forkError))
    };
  }
}
async function resendEditedQuestion(sessions, childId, text) {
  const binding = sessions.binding(childId);
  const sent = await binding?.session.prompt([{ type: "text", text }], "queue").catch((promptError) => {
    console.warn("[dsh-ext] re-sending the edited question failed:", promptError);
    return void 0;
  });
  if (sent === void 0 || sent.ok !== true) {
    const detail = sent !== void 0 && sent.ok === false ? sent.error?.message : void 0;
    return { ok: false, message: detail ?? "prompt rejected" };
  }
  return { ok: true };
}
function userTextOf(content) {
  let text = "";
  for (const block of content) {
    if (typeof block === "object" && block !== null && block.type === "text") {
      const value = block.text;
      if (typeof value === "string") text += value;
    }
  }
  return text;
}

// src/client/turn-info-store.ts
var import_react16 = require("react");
var STORE = /* @__PURE__ */ new Map();
var listeners3 = /* @__PURE__ */ new Set();
function notify() {
  for (const listener of [...listeners3]) listener();
}
function keyOf(session, turn) {
  return `${session}
${turn}`;
}
function refresh(maxAgeMs) {
  const now = Date.now();
  for (const entry of STORE.values()) {
    if (entry.refs <= 0) continue;
    if (now - entry.fetchedAt < maxAgeMs) continue;
    if (entry.inFlight !== void 0) continue;
    entry.inFlight = callApi(`/checkpoints/turn-info?session=${encodeURIComponent(entryKeySession(entry.key))}&turn=${entryKeyTurn(entry.key)}`).then((result) => {
      if (result.ok) {
        const current3 = entry.data;
        const next = result.value;
        entry.data = current3 !== void 0 && current3.checkpointId !== void 0 && next.checkpointId === void 0 ? current3 : next;
        entry.error = void 0;
      } else {
        entry.error = result.message;
      }
      entry.fetchedAt = Date.now();
      entry.version += 1;
      notify();
    }).catch(() => {
    }).finally(() => {
      entry.inFlight = void 0;
    });
  }
}
var ticker;
function ensureTicker() {
  if (ticker !== void 0) return;
  ticker = window.setInterval(() => {
    const hasRunningTurns = [...STORE.values()].some((e) => e.refs > 0 && e.data === void 0);
    refresh(hasRunningTurns ? 2e3 : 1e4);
  }, 2e3);
}
function entryKeySession(key) {
  return key.slice(0, key.lastIndexOf("\n"));
}
function entryKeyTurn(key) {
  return Number(key.slice(key.lastIndexOf("\n") + 1));
}
function entryOf(key) {
  let entry = STORE.get(key);
  if (entry === void 0) {
    entry = { key, data: void 0, fetchedAt: 0, error: void 0, refs: 0, inFlight: void 0, version: 0 };
    STORE.set(key, entry);
  }
  return entry;
}
function subscribe(fn) {
  listeners3.add(fn);
  return () => {
    listeners3.delete(fn);
  };
}
function useTurnInfo(session, turn) {
  const key = keyOf(session, turn);
  const subscribeKey = (0, import_react16.useCallback)((fn) => {
    const entry2 = entryOf(key);
    entry2.refs += 1;
    ensureTicker();
    if (entry2.data === void 0 && entry2.inFlight === void 0) {
      refresh(0);
    }
    const unsubscribeGlobal = subscribe(fn);
    return () => {
      entry2.refs -= 1;
      unsubscribeGlobal();
    };
  }, [key]);
  const getSnapshot = (0, import_react16.useCallback)(() => {
    const entry2 = entryOf(key);
    return entry2.version;
  }, [key]);
  (0, import_react16.useSyncExternalStore)(subscribeKey, getSnapshot);
  const entry = entryOf(key);
  return { data: entry.data, error: entry.error };
}

// src/client/panel-state.ts
var import_react17 = require("react");
var STORAGE_KEY = "dsh-ext:side-panel-open";
var open2;
var listeners4 = /* @__PURE__ */ new Set();
function read2(fallback2) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? fallback2 : stored === "1";
  } catch {
    return fallback2;
  }
}
function setPanelOpen(next) {
  if (open2 === next) return;
  open2 = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
  }
  for (const listener of [...listeners4]) listener();
}
function usePanelOpen(fallback2) {
  const [, bump] = (0, import_react17.useState)(0);
  if (open2 === void 0) open2 = read2(fallback2);
  (0, import_react17.useEffect)(() => {
    const listener = () => {
      bump((n) => n + 1);
    };
    listeners4.add(listener);
    return () => {
      listeners4.delete(listener);
    };
  }, []);
  return open2;
}
var sessionId;
var sessionListeners = /* @__PURE__ */ new Set();
function setPanelSession(next) {
  if (sessionId === next) return;
  sessionId = next;
  for (const listener of [...sessionListeners]) listener();
}
function usePanelSession() {
  const [, bump] = (0, import_react17.useState)(0);
  (0, import_react17.useEffect)(() => {
    const listener = () => {
      bump((n) => n + 1);
    };
    sessionListeners.add(listener);
    return () => {
      sessionListeners.delete(listener);
    };
  }, []);
  return sessionId;
}

// src/client/TurnChangesCard.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");
var countStyle = (color) => ({
  fontSize: 12,
  fontFamily: "ui-monospace, monospace",
  color
});
function dirOf(path) {
  const slash = path.lastIndexOf("/");
  return slash < 0 ? "" : path.slice(0, slash + 1);
}
function normalizeWorkspacePath(path) {
  if (path === void 0) return "";
  return path.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}
async function trashSession(sessionId2, archive) {
  try {
    await archive(sessionId2);
    return true;
  } catch (error) {
    console.warn("[dsh-ext] archiving the original session failed:", error);
    return false;
  }
}
function nameOf(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}
var CardBoundary = class extends import_react18.Component {
  state = { failed: false, message: "" };
  static getDerivedStateFromError(error) {
    return { failed: true, message: error.message };
  }
  componentDidCatch(error, info) {
    console.error("[dsh-ext] the turn-changes card crashed and hid itself:", error, info);
  }
  render() {
    if (this.state.failed) {
      return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { style: { border: "1px solid #f59e0b", borderRadius: 8, padding: "4px 8px", margin: "6px 0", fontSize: 11, color: "#f59e0b" }, children: `[card-crash] ${this.state.message.slice(0, 300)}` });
    }
    return this.props.children;
  }
};
function TurnChangesCard(props) {
  const t = useT();
  const turn = Number(props.turn);
  const [expanded, setExpanded] = (0, import_react18.useState)(false);
  const [dialog, setDialog] = (0, import_react18.useState)("none");
  const [busy, setBusy] = (0, import_react18.useState)(false);
  const [error, setError] = (0, import_react18.useState)(void 0);
  const [openMenuFor, setOpenMenuFor] = (0, import_react18.useState)(null);
  const [failure, setFailure] = (0, import_react18.useState)(void 0);
  const detailRoute = `/checkpoints/turn-info?session=${encodeURIComponent(props.sessionId)}&turn=${turn}&detail=1`;
  const info = useTurnInfo(props.sessionId, turn).data;
  const detail = useResource(detailRoute, dialog !== "none");
  const preview = useResource(
    dialog === "undo" && info?.checkpointId !== void 0 ? `/checkpoints/preview?id=${encodeURIComponent(info.checkpointId)}&session=${encodeURIComponent(props.sessionId)}` : "/checkpoints/preview",
    dialog === "undo" && info?.checkpointId !== void 0
  );
  if (!Number.isSafeInteger(turn)) return null;
  const data = info;
  if (props.disabled === true || data === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      "div",
      {
        "data-dsh-plugin": "dsh-ext",
        "data-dsh-part": "turn-changes",
        style: {
          border: `1px solid color-mix(in srgb, ${token.border} 60%, transparent)`,
          borderRadius: 10,
          padding: "5px 10px",
          marginTop: 6,
          fontSize: 12,
          color: token.textMuted
        },
        children: t("turn.checking")
      }
    );
  }
  if (data.checkpointId === void 0 || data.files.length === 0) return null;
  const running = props.status === "open";
  const detailReady = detail.data !== void 0;
  const canRewind = props.sessions !== void 0 && detailReady;
  const firstTurn = detail.data !== void 0 && detail.data.undoAnchorSeq === void 0;
  const actionable = !running && props.sessions !== void 0;
  const openInPanel = (kind, path) => {
    const scope = currentPanelScope() ?? (data.workspace.length > 0 ? data.workspace : `session:${props.sessionId}`);
    openPanelTab(scope, kind, path);
    setPanelOpen(true);
  };
  const openExternal = async (path, editor) => {
    const query = [
      `session=${encodeURIComponent(props.sessionId)}`,
      `path=${encodeURIComponent(path)}`,
      `editor=${editor}`
    ].join("&");
    const result = await callApi(`/explorer/open-editor?${query}`);
    if (result.ok) return;
    setFailure({ text: t("explorer.openEditorFailed", { message: result.message }), seq: Date.now() });
  };
  const workspaceItems = props.workspaceItems;
  const rewind = async () => {
    if (props.sessions === void 0) return { ok: false, message: t("turn.firstTurnNoFork") };
    const result = await rewindTurn({
      sessions: props.sessions,
      workspaces: props.workspaces,
      sessionId: props.sessionId,
      checkpointId: data.checkpointId,
      detail: detail.data,
      forkFailedText: (message) => t("cp.forkFailed", { message }),
      firstTurnText: t("turn.firstTurnNoFork"),
      workspace: data.workspace,
      // The backend's workspace path and the host's registered workspace path
      // can differ in casing or a trailing separator even when they are the
      // same project. Match loosely (case-insensitive, ignore a trailing slash)
      // so the first-turn fallback finds the id it needs to open a fresh
      // session; exact-match-only used to leave it undefined and fail the undo.
      workspaceIdOf: (path) => {
        const target = normalizeWorkspacePath(path);
        return workspaceItems?.find((item) => normalizeWorkspacePath(item.path) === target)?.workspaceId;
      }
    });
    return result;
  };
  const undo = async () => {
    setBusy(true);
    setError(void 0);
    const result = await rewind();
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    const trashed = await trashSession(props.sessionId, async (id) => {
      await props.workspaces?.archiveSession(id);
    });
    if (trashed) {
      const sessionsRef = props.sessions;
      await sessionsRef.refresh?.().catch(() => {
      });
    }
    if (!trashed) setFailure({ text: t("turn.trashFailed"), seq: Date.now() });
    setDialog("none");
  };
  const openUndo = () => {
    setError(void 0);
    setDialog("undo");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
      "div",
      {
        "data-dsh-plugin": "dsh-ext",
        "data-dsh-part": "turn-changes",
        style: {
          border: `1px solid ${token.border}`,
          borderRadius: 10,
          background: token.surface,
          padding: "6px 10px",
          marginTop: 6,
          fontSize: 13,
          color: token.text
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, minHeight: 28 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
              "button",
              {
                type: "button",
                "aria-expanded": expanded,
                "aria-label": t("turn.toggleList"),
                onClick: () => {
                  setExpanded((value) => !value);
                },
                style: {
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: 2,
                  border: "none",
                  background: "transparent",
                  color: token.textSecondary,
                  cursor: "pointer",
                  font: "inherit",
                  fontWeight: 500,
                  flex: "0 1 auto",
                  minWidth: 0
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ChevronIcon, { size: 13, open: expanded }),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { style: { whiteSpace: "nowrap" }, children: t("turn.filesChanged", { n: data.files.length }) })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { style: countStyle(token.success), children: [
              "+",
              data.added
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { style: countStyle(token.danger), children: [
              "-",
              data.removed
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { style: { flex: 1 } }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
              "button",
              {
                type: "button",
                disabled: !actionable,
                title: running ? t("turn.stillRunning") : t("turn.undo"),
                "aria-label": t("turn.undo"),
                onClick: openUndo,
                style: {
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  height: 24,
                  padding: "0 8px",
                  border: "none",
                  borderRadius: 6,
                  background: "transparent",
                  color: actionable ? token.textSecondary : "color-mix(in srgb, currentColor 35%, transparent)",
                  cursor: actionable ? "pointer" : "default",
                  fontSize: 12,
                  whiteSpace: "nowrap"
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(UndoIcon, { size: 14 }),
                  t("turn.undo")
                ]
              }
            )
          ] }),
          expanded && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("ul", { style: { listStyle: "none", margin: "2px 0 4px", padding: 0, display: "flex", flexDirection: "column" }, children: data.files.map((file) => {
            const slash = file.path.lastIndexOf("/");
            return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
              "li",
              {
                style: { display: "flex", alignItems: "center", gap: 7, minHeight: 27, padding: "1px 0", borderTop: `1px solid color-mix(in srgb, ${token.border} 45%, transparent)` },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(FileIcon, { size: 15, name: nameOf(file.path) }),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        openInPanel("diff", file.path);
                      },
                      title: t("explorer.preview"),
                      style: {
                        font: "inherit",
                        color: "inherit",
                        textAlign: "left",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        cursor: "pointer"
                      },
                      children: nameOf(file.path)
                    }
                  ),
                  slash > 0 && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { style: { fontSize: 12, color: token.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: dirOf(file.path) }),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { style: countStyle(token.success), children: [
                    "+",
                    file.added
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { style: countStyle(token.danger), children: [
                    "-",
                    file.removed
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { style: { flex: 1 } }),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        openInPanel("diff", file.path);
                      },
                      title: t("explorer.preview"),
                      style: { ...buttonStyle, height: 22, minHeight: 0, padding: "0 9px", fontSize: 12, borderRadius: 6 },
                      children: t("turn.review")
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { style: { position: "relative", display: "inline-flex" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          openInPanel("editor", file.path);
                        },
                        title: t("explorer.preview"),
                        style: { ...buttonStyle, height: 22, minHeight: 0, padding: "0 9px", fontSize: 12, borderRadius: "6px 0 0 6px", borderRightWidth: 0 },
                        children: t("turn.open")
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                      "button",
                      {
                        type: "button",
                        "aria-expanded": openMenuFor === file.path,
                        "aria-label": t("explorer.openEditor"),
                        onClick: () => {
                          setOpenMenuFor(openMenuFor === file.path ? null : file.path);
                        },
                        style: { ...buttonStyle, height: 22, minHeight: 0, padding: "0 5px", fontSize: 12, borderRadius: "0 6px 6px 0" },
                        children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ChevronIcon, { size: 11, open: openMenuFor === file.path })
                      }
                    ),
                    openMenuFor === file.path && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                        "div",
                        {
                          style: { position: "fixed", inset: 0, zIndex: 999 },
                          onClick: () => {
                            setOpenMenuFor(null);
                          }
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                        "div",
                        {
                          style: {
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: 4,
                            background: "var(--dsw-alias-bg-layer-2, #1a1d24)",
                            border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.1))",
                            borderRadius: 8,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                            minWidth: 170,
                            zIndex: 1e3,
                            overflow: "hidden",
                            padding: 2
                          },
                          children: [
                            { type: "explorer", icon: FolderIcon2, label: t("explorer.openWith.explorer") },
                            { type: "vscode", icon: VscodeIcon, label: t("explorer.openWith.vscode") },
                            { type: "idea", icon: IdeaIcon, label: t("explorer.openWith.idea") }
                          ].map(({ type, icon: Icon, label }) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
                            "button",
                            {
                              type: "button",
                              onClick: () => {
                                setOpenMenuFor(null);
                                void openExternal(file.path, type);
                              },
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                width: "100%",
                                padding: "7px 10px",
                                border: "none",
                                borderRadius: 6,
                                background: "transparent",
                                color: "var(--dsw-alias-label-primary, #e8eaed)",
                                fontSize: 12,
                                cursor: "pointer",
                                textAlign: "left"
                              },
                              onMouseEnter: (e) => {
                                e.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.08))";
                              },
                              onMouseLeave: (e) => {
                                e.currentTarget.style.background = "transparent";
                              },
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, { size: 14 }),
                                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { children: label })
                              ]
                            },
                            type
                          ))
                        }
                      )
                    ] })
                  ] })
                ]
              },
              file.path
            );
          }) })
        ]
      }
    ),
    dialog !== "none" && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      import_dsh_client_ui_primitives3.Modal,
      {
        title: t("turn.undoTitle"),
        open: true,
        onClose: () => {
          if (!busy) setDialog("none");
        },
        footer: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { type: "button", disabled: busy, onClick: () => {
            setDialog("none");
          }, style: buttonStyle, children: t("common.cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            "button",
            {
              type: "button",
              disabled: busy || !canRewind,
              onClick: () => {
                void undo();
              },
              style: { ...buttonStyle, borderColor: token.danger, color: token.danger },
              children: busy ? t("cp.restoring") : t("turn.undo")
            }
          )
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }, children: [
          data.workspace.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { style: { fontSize: 11, color: token.textMuted }, children: t("cp.restoreWorkspace", { path: data.workspace }) }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { style: { margin: 0, lineHeight: 1.55, color: token.textSecondary }, children: t("turn.undoHint", { n: data.files.length }) }),
          preview.data !== void 0 && preview.data.unprotected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Notice, { kind: "error", children: t("cp.unprotected", { n: preview.data.unprotected.length }) }),
          detail.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Notice, { kind: "error", children: detail.error }),
          firstTurn && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Notice, { kind: "info", children: t("turn.firstTurnUndo") }),
          error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Notice, { kind: "error", children: error })
        ] })
      }
    ),
    failure !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_dsh_client_ui_primitives3.Toast, { text: failure.text, onDone: () => {
      setFailure(void 0);
    } }, failure.seq)
  ] });
}

// src/client/UserEditBubble.tsx
var import_react19 = require("react");
var import_dsh_client_ui_primitives4 = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime16 = require("react/jsx-runtime");
function BubbleActions(props) {
  const t = useT();
  const iconStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    border: "none",
    borderRadius: 6,
    background: "transparent",
    color: "var(--dsw-alias-label-tertiary, " + token.textMuted + ")",
    cursor: "pointer",
    padding: 0
  };
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
    "div",
    {
      "data-dsh-part": "user-bubble-actions",
      style: { display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 4, marginRight: 2 },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "button",
          {
            type: "button",
            "aria-label": props.copied ? t("turn.copied") : t("turn.copy"),
            title: props.copied ? t("turn.copied") : t("turn.copy"),
            onClick: props.onCopy,
            style: iconStyle,
            children: props.copied ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(CheckIcon, { size: 15 }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("svg", { width: "15", height: "15", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("rect", { x: "5.2", y: "5.2", width: "8", height: "8", rx: "1.6", stroke: "currentColor", strokeWidth: "1.3" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("path", { d: "M10.8 3.2H4A1.8 1.8 0 0 0 2.2 5v6", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" })
            ] })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "button",
          {
            type: "button",
            "aria-label": t("turn.edit"),
            title: t("turn.editTitle"),
            onClick: props.onEdit,
            style: iconStyle,
            children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(EditIcon, { size: 15 })
          }
        )
      ]
    }
  );
}
function UserEditBubble(props) {
  const t = useT();
  const [editing, setEditing] = (0, import_react19.useState)(false);
  const [draft, setDraft] = (0, import_react19.useState)("");
  const [busy, setBusy] = (0, import_react19.useState)(false);
  const [error, setError] = (0, import_react19.useState)(void 0);
  const [copied, setCopied] = (0, import_react19.useState)(false);
  const text = userTextOf(props.node.content);
  const workspaceItems = props.useWorkspaces?.((state) => state.items);
  const startEdit = () => {
    setDraft(text);
    setError(void 0);
    setEditing(true);
  };
  const copy = () => {
    void (0, import_dsh_client_ui_primitives4.writeClipboard)(text).then((ok) => {
      if (!ok) return;
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1e3);
    });
  };
  const send = async () => {
    const value = draft.trim();
    if (value.length === 0 || busy) return;
    setBusy(true);
    setError(void 0);
    const mapped = await callApi(
      `/checkpoints/turn-info?session=${encodeURIComponent(props.sessionId)}&seq=${props.node.seq}&detail=1`
    );
    if (!mapped.ok) {
      setBusy(false);
      setError(mapped.message);
      return;
    }
    const info = mapped.value;
    if (info.checkpointId === void 0) {
      setBusy(false);
      setError(t("turn.firstTurnNoFork"));
      return;
    }
    const result = await rewindTurn({
      sessions: props.sessions,
      workspaces: props.workspaces,
      sessionId: props.sessionId,
      checkpointId: info.checkpointId,
      detail: info,
      forkFailedText: (message) => t("cp.forkFailed", { message }),
      firstTurnText: t("turn.firstTurnNoFork"),
      workspace: info.workspace,
      workspaceIdOf: (path) => workspaceItems?.find((item) => item.path === path)?.workspaceId
    });
    if (!result.ok) {
      setBusy(false);
      setError(result.message);
      return;
    }
    const sent = await resendEditedQuestion(props.sessions, result.childId, value);
    setBusy(false);
    if (!sent.ok) setError(t("turn.editSendFailed", { message: sent.message }));
    else {
      try {
        await props.workspaces?.archiveSession(props.sessionId);
      } catch (archiveError) {
        console.warn("[dsh-ext] archiving the original session after edit failed:", archiveError);
      }
      setEditing(false);
    }
  };
  if (editing) {
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { "data-dsh-plugin": "dsh-ext", "data-dsh-part": "user-edit", style: { display: "flex", flexDirection: "column", gap: 8, margin: "6px 0 10px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
        "div",
        {
          style: {
            borderRadius: 16,
            border: `1px solid ${token.border}`,
            background: token.surface,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
              "textarea",
              {
                value: draft,
                autoFocus: true,
                disabled: busy,
                rows: Math.min(10, Math.max(2, draft.split("\n").length)),
                onChange: (event) => {
                  setDraft(event.currentTarget.value);
                },
                onKeyDown: (event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                  if (event.key === "Escape" && !busy) setEditing(false);
                },
                style: {
                  font: "inherit",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: token.text,
                  border: "none",
                  background: "transparent",
                  resize: "none",
                  outline: "none",
                  padding: 0
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { style: { flex: 1 } }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "button",
                {
                  type: "button",
                  disabled: busy,
                  onClick: () => {
                    setEditing(false);
                  },
                  style: { ...buttonStyle, height: 26, width: 26, borderRadius: 999, padding: 0, border: "none", background: "transparent", color: token.textSecondary, display: "inline-flex", alignItems: "center", justifyContent: "center" },
                  "aria-label": t("common.cancel"),
                  title: t("common.cancel"),
                  children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("svg", { width: "15", height: "15", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("path", { d: "M4 4l8 8M12 4l-8 8", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }) })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
                "button",
                {
                  type: "button",
                  disabled: busy || draft.trim().length === 0,
                  onClick: () => {
                    void send();
                  },
                  title: busy ? t("cp.restoring") : t("turn.sendEdit"),
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    border: "none",
                    padding: 0,
                    background: "var(--dsw-alias-brand-primary, " + token.accent + ")",
                    color: "var(--dsw-alias-bg-base, #fff)",
                    cursor: busy || draft.trim().length === 0 ? "default" : "pointer",
                    opacity: busy || draft.trim().length === 0 ? 0.45 : 1
                  },
                  children: [
                    busy ? (
                      // A fixed 30px circle while restoring: text like 恢复中 would
                      // stretch it mid-edit, so the state is just a spinning ring.
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                        "span",
                        {
                          "aria-hidden": "true",
                          style: {
                            width: 13,
                            height: 13,
                            border: "2px solid currentColor",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "dsh-devtool-spin 900ms linear infinite"
                          }
                        }
                      )
                    ) : /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("svg", { width: "15", height: "15", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("path", { d: "M8 13V3M8 3L3.8 7.2M8 3l4.2 4.2", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("style", { children: "@keyframes dsh-devtool-spin { to { transform: rotate(360deg) } }" })
                  ]
                }
              )
            ] })
          ]
        }
      ),
      error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Notice, { kind: "error", children: error })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
    "div",
    {
      "data-dsh-plugin": "dsh-ext",
      "data-dsh-part": "user-bubble",
      className: "__dsh_user_row__",
      style: { display: "flex", flexDirection: "column", alignItems: "flex-end", margin: "8px 0" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("style", { children: `
        .__dsh_user_row__ [data-dsh-part="user-bubble-actions"] { opacity: 0; transition: opacity 120ms ease; }
        .__dsh_user_row__:hover [data-dsh-part="user-bubble-actions"] { opacity: 1; }
      ` }),
        text.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "div",
          {
            style: {
              maxWidth: "80%",
              background: "var(--dsw-alias-bg-layer-2, " + token.surface + ")",
              color: token.text,
              borderRadius: 16,
              padding: "9px 14px",
              fontSize: 14,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            },
            children: text
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(BubbleActions, { text, copied, onCopy: copy, onEdit: startEdit })
      ]
    }
  );
}

// src/client/ComposerImages.tsx
var import_react20 = require("react");

// src/client/picker-channel.ts
var channel;
var listeners5 = /* @__PURE__ */ new Set();
function provideImagePicker(next) {
  channel = next;
  for (const listener of listeners5) listener();
  return () => {
    if (channel !== next) return;
    channel = void 0;
    for (const listener of listeners5) listener();
  };
}
function openImagePicker() {
  channel?.pick();
}
function subscribeImagePicker(onChange) {
  listeners5.add(onChange);
  return () => {
    listeners5.delete(onChange);
  };
}
function hasImagePicker() {
  return channel !== void 0;
}

// src/client/ComposerImages.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");
var THUMB = 56;
function applyOrder(actions, current3, next) {
  if (next.length !== current3.length) return false;
  const currentSet = new Set(current3);
  if (next.some((id) => !currentSet.has(id))) return false;
  for (const id of current3) actions.removeImage(id);
  const accepted = actions.addImages(next);
  if (!accepted) {
    actions.addImages(current3);
    return false;
  }
  return true;
}
function ComposerImages(props) {
  const { attachments, canAcceptDrop, dropLimits, onAddImages, onRemoveImage, input, actions, dragEnabled } = props;
  const t = useT();
  const [dragging, setDragging] = (0, import_react20.useState)(void 0);
  const [over, setOver] = (0, import_react20.useState)(void 0);
  const [fileOver, setFileOver] = (0, import_react20.useState)(false);
  const [notice, setNotice] = (0, import_react20.useState)(void 0);
  const fileInput = (0, import_react20.useRef)(null);
  (0, import_react20.useEffect)(() => {
    if (notice === void 0) return;
    const timer = window.setTimeout(() => {
      setNotice(void 0);
    }, 4e3);
    return () => {
      window.clearTimeout(timer);
    };
  }, [notice]);
  const reorderable = dragEnabled && actions !== void 0 && input?.phase === "plain" && attachments.length > 1;
  const commitMove = (0, import_react20.useCallback)((from2, to) => {
    if (actions === void 0 || input === void 0 || from2 === to) return;
    const ids = [...input.imageIds];
    const fromIndex = ids.indexOf(from2);
    const toIndex = ids.indexOf(to);
    if (fromIndex < 0 || toIndex < 0) return;
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, from2);
    if (!applyOrder(actions, input.imageIds, ids)) setNotice(t("images.busy"));
  }, [actions, input]);
  const nudge = (0, import_react20.useCallback)((id, delta) => {
    if (actions === void 0 || input === void 0) return;
    const ids = [...input.imageIds];
    const index2 = ids.indexOf(id);
    const target = index2 + delta;
    if (index2 < 0 || target < 0 || target >= ids.length) return;
    const moved = ids[index2];
    const displaced = ids[target];
    if (moved === void 0 || displaced === void 0) return;
    ids[index2] = displaced;
    ids[target] = moved;
    if (!applyOrder(actions, input.imageIds, ids)) setNotice(t("images.busy"));
  }, [actions, input]);
  const pick2 = (0, import_react20.useCallback)(() => {
    fileInput.current?.click();
  }, []);
  const insertText = (0, import_react20.useCallback)((text) => {
    if (actions === void 0 || input === void 0) return false;
    if (input.phase !== "plain") return false;
    const current3 = input.draft;
    const separator = current3.length === 0 || /\s$/.test(current3) ? "" : " ";
    actions.setDraft(`${current3}${separator}${text}`);
    return true;
  }, [actions, input]);
  (0, import_react20.useEffect)(() => provideImagePicker({ pick: pick2, insertText }), [pick2, insertText]);
  const onPicked = (0, import_react20.useCallback)(async (files) => {
    if (files === null || files.length === 0) return;
    const picked = [...files];
    if (fileInput.current !== null) fileInput.current.value = "";
    const images = picked.filter((file) => file.type.startsWith("image/"));
    if (images.length > 0) onAddImages(images);
    for (const file of picked) {
      if (file.type.startsWith("image/")) continue;
      const text = await file.text().catch(() => void 0);
      if (text === void 0 || text.includes("\0")) {
        setNotice(t("files.unreadable", { name: file.name }));
        continue;
      }
      const fence = "```";
      insertText(`
${fence} ${file.name}
${text}
${fence}
`);
      setNotice(t("files.notImage", { name: file.name }));
    }
  }, [onAddImages, insertText, t]);
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
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
    "div",
    {
      "data-dsh-plugin": "dsh-ext",
      "data-dsh-part": "composer-images",
      onDragOver: onFileDragOver,
      onDragLeave: () => {
        setFileOver(false);
      },
      onDrop: onFileDrop,
      style: fileOver ? { outline: `2px dashed ${token.accent}`, outlineOffset: 2, borderRadius: 8 } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          "input",
          {
            ref: fileInput,
            type: "file",
            multiple: true,
            hidden: true,
            "aria-hidden": "true",
            tabIndex: -1,
            onChange: (event) => {
              void onPicked(event.currentTarget.files);
            }
          }
        ),
        attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          "div",
          {
            role: "list",
            "aria-label": t("images.rail"),
            style: { display: "flex", flexWrap: "wrap", gap: 8, padding: "6px 0 2px" },
            children: attachments.map((attachment, index2) => {
              const isOver = over === attachment.id && dragging !== attachment.id;
              return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
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
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
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
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { style: { position: "absolute", left: 2, bottom: 2, display: "flex", gap: 2 }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                        "button",
                        {
                          type: "button",
                          "aria-label": `Move ${attachment.file.name} earlier`,
                          disabled: index2 === 0,
                          onClick: () => {
                            nudge(attachment.id, -1);
                          },
                          style: nudgeStyle,
                          children: "\u2039"
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                        "button",
                        {
                          type: "button",
                          "aria-label": `Move ${attachment.file.name} later`,
                          disabled: index2 === attachments.length - 1,
                          onClick: () => {
                            nudge(attachment.id, 1);
                          },
                          style: nudgeStyle,
                          children: "\u203A"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
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
        fileOver && attachments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
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
        notice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { role: "status", style: { fontSize: 11, color: token.textMuted, paddingBottom: 4 }, children: notice })
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
var import_react22 = require("react");

// src/client/use-workspace.ts
var import_react21 = require("react");
function useActiveWorkspace(useWorkspaces) {
  const selected = useWorkspaces?.((state) => {
    const recent = state.recentWorkspaceId;
    const match = recent === void 0 ? void 0 : state.items.find((item) => item.workspaceId === recent);
    const only = state.items.length === 1 ? state.items[0] : void 0;
    return (match ?? only)?.path;
  });
  return selected ?? void 0;
}
var WIDTH_KEY = "dsh-dev-tool-ext:side-panel-width";
var MIN_PANEL_WIDTH = 220;
var MAX_PANEL_WIDTH = 900;
var DEFAULT_PANEL_WIDTH = 340;
function readWidth() {
  try {
    const stored = window.localStorage.getItem(WIDTH_KEY);
    if (stored === null) return DEFAULT_PANEL_WIDTH;
    const parsed = Number(stored);
    if (!Number.isFinite(parsed)) return DEFAULT_PANEL_WIDTH;
    return clampWidth(parsed);
  } catch {
    return DEFAULT_PANEL_WIDTH;
  }
}
function clampWidth(value) {
  return Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, Math.round(value)));
}
var width;
var widthListeners = /* @__PURE__ */ new Set();
function setPanelWidth(next) {
  const clamped = clampWidth(next);
  if (width === clamped) return;
  width = clamped;
  try {
    window.localStorage.setItem(WIDTH_KEY, String(clamped));
  } catch {
  }
  for (const listener of [...widthListeners]) listener();
}
function usePanelWidth() {
  const [, bump] = (0, import_react21.useState)(0);
  if (width === void 0) width = readWidth();
  (0, import_react21.useEffect)(() => {
    const listener = () => {
      bump((n) => n + 1);
    };
    widthListeners.add(listener);
    return () => {
      widthListeners.delete(listener);
    };
  }, []);
  return width;
}

// src/client/SidePanel.tsx
var import_jsx_runtime18 = require("react/jsx-runtime");
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
  const open3 = usePanelOpen(props.defaultOpen);
  const width2 = usePanelWidth();
  const dragging = (0, import_react22.useRef)(false);
  const session = usePanelSession();
  (0, import_react22.useEffect)(() => {
    const centre = centreColumn();
    if (centre === void 0) return;
    const edge = props.side === "right" ? "paddingInlineEnd" : "paddingInlineStart";
    const previous = centre.style[edge];
    centre.style[edge] = open3 ? `${width2}px` : previous;
    const previousTransition = centre.style.transition;
    centre.style.transition = dragging.current ? "none" : "padding var(--ds-transition-duration-slow, 200ms) var(--ds-ease-in-out, ease)";
    return () => {
      centre.style[edge] = previous;
      centre.style.transition = previousTransition;
    };
  }, [open3, props.side, width2]);
  (0, import_react22.useEffect)(() => {
    if (!open3) return;
    const onKey = (event) => {
      if (event.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open3]);
  const onHandleDown = (0, import_react22.useCallback)((event) => {
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = width2;
    dragging.current = true;
    handle.setPointerCapture(event.pointerId);
    const onMove = (move) => {
      const delta = props.side === "right" ? startX - move.clientX : move.clientX - startX;
      setPanelWidth(clampWidth(startWidth + delta));
    };
    const onUp = () => {
      dragging.current = false;
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }, [props.side, width2]);
  if (!open3) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
    "div",
    {
      "data-dsh-plugin": "dsh-ext",
      "data-dsh-part": "side-panel",
      style: {
        position: "absolute",
        top: 0,
        bottom: 0,
        ...props.side === "right" ? { right: 0 } : { left: 0 },
        width: width2,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        padding: 12,
        gap: 8,
        // The host's compact-surface size: its read cards and search blocks set
        // 13px, and a panel that guesses smaller reads as fine print against
        // them. Family stays inherited, so the face is always the shell's own.
        fontSize: 13,
        color: token.text,
        background: token.surfaceBase,
        borderLeft: props.side === "right" ? `1px solid ${token.border}` : "none",
        borderRight: props.side === "left" ? `1px solid ${token.border}` : "none",
        overflow: "hidden",
        // The overlay layer is click-through; this subtree opts back in.
        pointerEvents: "auto"
      },
      "aria-label": t("explorer.title"),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          "div",
          {
            role: "separator",
            "aria-label": t("explorer.resize"),
            "aria-orientation": "vertical",
            "aria-valuenow": width2,
            "aria-valuemin": MIN_PANEL_WIDTH,
            "aria-valuemax": MAX_PANEL_WIDTH,
            onPointerDown: onHandleDown,
            onKeyDown: (event) => {
              const step = event.shiftKey ? 64 : 16;
              if (event.key === "ArrowLeft") setPanelWidth(width2 + (props.side === "right" ? step : -step));
              else if (event.key === "ArrowRight") setPanelWidth(width2 + (props.side === "right" ? -step : step));
              else return;
              event.preventDefault();
            },
            tabIndex: 0,
            style: {
              position: "absolute",
              top: 0,
              bottom: 0,
              ...props.side === "right" ? { left: -3 } : { right: -3 },
              width: 7,
              cursor: "col-resize",
              // Above the panel's own content so the grab area is never stolen by a
              // row that happens to sit against the edge.
              zIndex: 1,
              touchAction: "none"
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(ExplorerPanel, { sessionId: session, workspace: props.workspace })
      ]
    }
  );
}

// src/client/ModelPicker.tsx
var import_react23 = require("react");

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
  const pattern2 = /\.((?:_[A-Za-z0-9]+_)|(?:[A-Za-z0-9]+_))([A-Za-z][A-Za-z0-9]*)\b/g;
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
      for (const match of selector.matchAll(pattern2)) {
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
var import_jsx_runtime19 = require("react/jsx-runtime");
var COLLAPSE_KEY = "dsh-ext:model-groups-collapsed";
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
  const { locked, available, directory, load: load2, select: select2, collapsible } = props;
  const t = useT();
  const host = hostModelClasses();
  const state = (0, import_react23.useSyncExternalStore)(
    (0, import_react23.useCallback)((fn) => directory.subscribe(fn), [directory]),
    (0, import_react23.useCallback)(() => directory.getSnapshot(), [directory])
  );
  const [open3, setOpen] = (0, import_react23.useState)(false);
  const [pane, setPane] = (0, import_react23.useState)("root");
  const [collapsed, setCollapsed] = (0, import_react23.useState)(readCollapsed);
  const [filter, setFilter] = (0, import_react23.useState)("");
  const lastAction = (0, import_react23.useRef)("load");
  const rootRef = (0, import_react23.useRef)(null);
  const triggerRef = (0, import_react23.useRef)(null);
  const itemRefs = (0, import_react23.useRef)([]);
  const id = (0, import_react23.useId)();
  const current3 = state.current;
  const currentModel = (0, import_react23.useMemo)(() => {
    if (current3 === null) return void 0;
    for (const group of state.groups) {
      if (group.id !== current3.provider) continue;
      for (const model of group.models) if (model.id === current3.model) return model;
    }
    return void 0;
  }, [state.groups, current3]);
  const reasoning = currentModel?.reasoning;
  const effectiveEffort = current3?.reasoningEffort ?? reasoning?.defaultEffort;
  const effortLabel = reasoning === void 0 ? void 0 : effectiveEffort === void 0 ? t("picker.providerDefault") : reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort;
  const effortChoices = (0, import_react23.useMemo)(() => {
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
  const providerName = current3 === null ? void 0 : state.groups.find((group) => group.id === current3.provider)?.name;
  const reload = (0, import_react23.useCallback)(() => {
    lastAction.current = "load";
    load2();
  }, [load2]);
  (0, import_react23.useEffect)(() => {
    if (available) reload();
  }, [available, reload]);
  (0, import_react23.useEffect)(() => {
    if (!open3) return;
    const closeOutside = (event) => {
      if (rootRef.current?.contains(event.target) !== true) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
    };
  }, [open3]);
  if (!available) return null;
  const close2 = (restoreFocus = false) => {
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
    if (accepted && rootRef.current !== null) close2(true);
  };
  const choose = (selection) => {
    if (current3?.provider === selection.provider && current3.model === selection.model) {
      close2(true);
      return;
    }
    lastAction.current = "select";
    void select2(selection).then(settle);
  };
  const chooseEffort = (effort) => {
    if (current3 === null) return;
    if (effectiveEffort === effort) {
      close2(true);
      return;
    }
    lastAction.current = "select";
    void select2({
      provider: current3.provider,
      model: current3.model,
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
    if (event.key === "Escape" && open3) {
      event.preventDefault();
      if (pane !== "root") setPane("root");
      else close2(true);
      return;
    }
    if (!open3) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(event.key === "ArrowDown" ? 1 : -1);
    }
  };
  const onBlur = (event) => {
    if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget) === true) return;
    close2();
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
  const visible = (0, import_react23.useMemo)(() => state.groups.map((group) => ({
    group,
    models: needle.length === 0 ? group.models : group.models.filter((model) => model.name.toLowerCase().includes(needle) || model.id.toLowerCase().includes(needle))
  })).filter((entry) => needle.length === 0 || entry.models.length > 0), [state.groups, needle]);
  const cx = (...names) => names.filter(Boolean).join(" ");
  const fb = host === null ? fallback : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
    "div",
    {
      ref: rootRef,
      className: host?.root,
      style: fb?.root,
      onKeyDown: onRootKeyDown,
      onBlur,
      "data-dsh-plugin": "dsh-ext",
      "data-dsh-part": "model-picker",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          "button",
          {
            ref: triggerRef,
            type: "button",
            className: host?.trigger,
            style: fb?.trigger,
            "aria-label": effortLabel === void 0 ? t("picker.triggerAria", { model: modelLabel }) : t("picker.triggerAriaEffort", { model: modelLabel, effort: effortLabel }),
            "aria-haspopup": "menu",
            "aria-expanded": open3,
            "aria-controls": open3 ? `${id}-menu` : void 0,
            title: effortLabel === void 0 ? modelLabel : `${modelLabel} \xB7 ${effortLabel}`,
            disabled: locked,
            onClick: () => {
              if (open3) close2();
              else show();
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: host?.triggerLabel, style: fb?.triggerLabel, children: [
                providerName !== void 0 && providerName.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                  "span",
                  {
                    "aria-hidden": "true",
                    style: {
                      fontWeight: 400,
                      opacity: 0.55,
                      marginRight: 5,
                      fontSize: "0.92em"
                    },
                    children: providerName
                  }
                ),
                modelLabel
              ] }),
              effortLabel !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.triggerEffort, style: fb?.triggerEffort, children: effortLabel }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: cx(host?.chevron, open3 && host?.chevronOpen), style: fb?.chevron, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(ChevronIcon, { open: open3, size: 14 }) })
            ]
          }
        ),
        open3 && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          "div",
          {
            id: `${id}-menu`,
            className: host?.menu,
            style: fb?.menu,
            role: "menu",
            "aria-label": t("picker.menuAria"),
            "aria-busy": state.status === "loading" || busy,
            children: [
              pane === "root" && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
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
                      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.cellLabel, style: fb?.cellLabel, children: t("picker.model") }),
                      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.cellValue, style: fb?.cellValue, children: modelLabel }),
                      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.cellChevron, style: fb?.cellChevron, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(ChevronIcon, { open: false, size: 14 }) })
                    ]
                  }
                ),
                reasoning !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
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
                      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.cellLabel, style: fb?.cellLabel, children: t("picker.effort") }),
                      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.cellValue, style: fb?.cellValue, children: effortLabel }),
                      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.cellChevron, style: fb?.cellChevron, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(ChevronIcon, { open: false, size: 14 }) })
                    ]
                  }
                )
              ] }),
              pane === "model" && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
                state.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: host?.status, style: fb?.status, children: t("picker.loading") }),
                state.error !== null && lastAction.current === "load" && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: host?.error, style: fb?.error, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: t("picker.actionFailed", { message: state.error }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", { type: "button", className: host?.retry, style: fb?.retry, onClick: reload, children: t("picker.reload") })
                ] }),
                state.failures.map((failure) => /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: host?.warning, style: fb?.warning, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: t("picker.groupFailed", { name: failure.name, message: failure.message }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", { type: "button", className: host?.retry, style: fb?.retry, onClick: reload, children: t("picker.reload") })
                ] }, failure.id)),
                collapsible && state.groups.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { style: toolbarStyle, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
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
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", { type: "button", onClick: () => {
                    setAll(true);
                  }, style: miniButtonStyle, children: t("picker.collapseAll") }),
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", { type: "button", onClick: () => {
                    setAll(false);
                  }, style: miniButtonStyle, children: t("picker.expandAll") })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: cx(host?.groups, "scrollable"), style: fb?.groups, children: visible.map(({ group, models }) => {
                  const headingId = `${id}-${group.id}`;
                  const shut = collapsible && collapsed.has(group.id) && needle.length === 0;
                  const holdsCurrent = current3?.provider === group.id;
                  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
                    "section",
                    {
                      role: "group",
                      "aria-labelledby": headingId,
                      className: host?.group,
                      style: fb?.group,
                      children: [
                        collapsible ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
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
                              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(ChevronIcon, { open: !shut, size: 12 }),
                              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { style: groupNameStyle, children: group.name }),
                              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { style: countStyle2, children: models.length }),
                              shut && holdsCurrent && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { style: dotStyle, "aria-hidden": "true", children: "\u25CF" })
                            ]
                          }
                        ) : (
                          // Feature off: a plain heading, exactly as the shipped
                          // selector rendered it. A button that collapses nothing
                          // would still take a tab stop and still look pressable.
                          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { id: headingId, className: host?.groupTitle, style: fb?.groupTitle, children: group.name })
                        ),
                        !shut && models.map((model) => {
                          const selected = current3?.provider === group.id && current3.model === model.id;
                          return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
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
                                /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: host?.optionCopy, style: fb?.optionCopy, children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.modelName, style: fb?.modelName, children: model.name }),
                                  model.description !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.description, style: fb?.description, children: model.description })
                                ] }),
                                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.check, style: fb?.check, children: selected ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(CheckIcon, { size: 16 }) : null })
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
                state.status === "ready" && visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: host?.empty, style: fb?.empty, children: needle.length === 0 ? t("picker.noModels") : t("picker.noMatch") })
              ] }),
              pane === "effort" && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
                state.error !== null && lastAction.current === "load" && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: host?.error, style: fb?.error, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: t("picker.actionFailed", { message: state.error }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", { type: "button", className: host?.retry, style: fb?.retry, onClick: reload, children: t("picker.reload") })
                ] }),
                effortChoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: host?.empty, style: fb?.empty, children: t("picker.noEfforts") }) : effortChoices.map((level) => {
                  const selected = effectiveEffort === level.effort;
                  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
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
                        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: host?.optionCopy, style: fb?.optionCopy, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.modelName, style: fb?.modelName, children: level.label }),
                          level.description !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.description, style: fb?.description, children: level.description })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: host?.check, style: fb?.check, children: selected ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(CheckIcon, { size: 16 }) : null })
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
var countStyle2 = {
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
var import_dsh_client_ui_primitives5 = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime20 = require("react/jsx-runtime");
var name = "dsh-ext-client";
var inject = ["slots"];
var SHADOW_PRIORITY = -10;
function trySlot(label, register2) {
  try {
    register2();
  } catch (error) {
    console.warn(
      `[dsh-ext] the "${label}" surface could not be registered, so that one feature is unavailable. Everything else still loaded.`,
      error
    );
  }
}
function apply(ctx) {
  installLocale(ctx);
  trySlot("settings page", () => {
    ctx.slots.inject("settings.section", () => ctx.slots.register({
      name: "settings.section",
      id: "dsh-ext",
      order: 720,
      label: () => document.documentElement.lang.startsWith("zh") ? "\u5F00\u53D1\u5DE5\u5177" : "Dev Tools"
    }, SettingsPage));
  });
  registerComposerImages(ctx);
  registerToolsGroup(ctx);
  registerModelPicker(ctx);
  registerBalanceBadge(ctx);
  registerAutoReviewMode(ctx);
  registerTurnChangesCards(ctx);
  registerUserEditBubbles(ctx);
  registerSidePanel(ctx);
  registerExplorerToggles(ctx);
  registerOpenEditorLauncher(ctx);
  registerRecycleBin(ctx);
}
function installLocale(ctx) {
  try {
    const locale = ctx.get("locale");
    if (locale === void 0) return;
    if (typeof locale.register === "function") {
      for (const [id, dict] of Object.entries(DICTS)) {
        ctx.effect(() => locale.register(LOCALE_NS, id, dict), `dsh-ext: ${id} dictionary`);
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
    console.warn("[dsh-ext] the locale runtime was unavailable; text stays in English.", error);
  }
}
function registerComposerImages(ctx) {
  trySlot("composer image rail", () => {
    ctx.slots.inject("conversation.input.attachments", () => ctx.slots.register({
      name: "conversation.input.attachments",
      priority: SHADOW_PRIORITY,
      registrant: "dsh-ext"
    }, function DevToolAttachments(props) {
      const config = useClientConfig();
      const input = props.useInput((state) => state);
      if (config?.imageComposer.enabled !== true) return null;
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
  trySlot("composer attach button", () => {
    ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
      name: "conversation.input.left",
      id: "dsh-ext-attach",
      order: 0,
      registrant: "dsh-ext"
    }, function DevToolAttachButton(props) {
      const t = useT();
      const config = useClientConfig();
      const input = props.useInput((state) => state);
      const ready = (0, import_react24.useSyncExternalStore)(subscribeImagePicker, hasImagePicker, () => false);
      if (config?.imageComposer.enabled !== true || !config.imageComposer.pickerButton) return null;
      const busy = input?.phase !== "plain";
      const disabled = !ready || busy;
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        "button",
        {
          type: "button",
          disabled,
          onClick: openImagePicker,
          "aria-label": t("files.attach"),
          title: t("files.attach"),
          "data-dsh-plugin": "dsh-ext",
          "data-dsh-part": "attach-button",
          style: { ...iconButtonStyle, opacity: disabled ? 0.45 : 1, cursor: disabled ? "not-allowed" : "pointer" },
          children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(PaperclipIcon, {})
        }
      );
    }));
  });
}
function registerToolsGroup(ctx) {
  trySlot("slash tools group", () => {
    ctx.inject(["inputTriggers"], (scoped) => {
      const triggers = scoped.inputTriggers;
      if (triggers?.registerSource === void 0) return;
      scoped.effect(() => triggers.registerSource({
        trigger: "/",
        // The slash menu titles a group with `t(source.name)` against the host's
        // own `slash.menu` namespace. Contributing a key there is impossible:
        // `locale.register` throws when a namespace already carries that locale,
        // and ui-input-trigger registers both en and zh at boot. A missing key
        // falls back to the key verbatim, so the source is NAMED with the text it
        // should display — the language is fixed at registration, which is also
        // when the shell picks up the group.
        name: document.documentElement.lang.startsWith("zh") ? "\u5DE5\u5177" : "Tools",
        // The shipped command source registers no order, so it sits at 0.
        order: -10,
        candidates: async (_session, req) => {
          const config = readClientConfig();
          if (config?.imageComposer.enabled !== true || !config.imageComposer.pickerButton) return [];
          if (!hasImagePicker()) return [];
          const label = translate("files.attach");
          const query = req.query.trim().toLowerCase();
          if (query.length > 0 && !label.toLowerCase().includes(query) && !"file".startsWith(query)) return [];
          return [{ name: label, description: translate("files.attachHint") }];
        },
        onPick: () => {
          openImagePicker();
          return "handled";
        }
      }), "dsh-ext: slash tools group");
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
        registrant: "dsh-ext",
        inject: (sessionId2) => {
          const directory = models.directoryFor(sessionId2);
          const available = sessions.subagentAddress(sessionId2) === void 0;
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
        return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
    ctx.inject(["slots", "modelDirectories", "sessions"], (scope) => {
      const models = scope.modelDirectories;
      scope.slots.inject("conversation.input.right", () => scope.slots.register({
        name: "conversation.input.right",
        id: "dsh-ext-balance",
        order: 0,
        registrant: "dsh-ext"
      }, function DevToolBalanceBadge(props) {
        const config = useClientConfig();
        if (config?.deepseekBalance.enabled !== true || !config.deepseekBalance.headerBadge) return null;
        const sessionId2 = props.sessionId;
        if (sessionId2 === void 0 || sessionId2.length === 0) return null;
        const directory = models.directoryFor(sessionId2);
        const state = (0, import_react24.useSyncExternalStore)(
          (0, import_react24.useCallback)((fn) => directory.store.subscribe(fn), [directory]),
          (0, import_react24.useCallback)(() => directory.store.getSnapshot(), [directory])
        );
        const provider = state.current?.provider;
        if (provider === void 0 || !/^deepseek(-official|-api)?$/i.test(provider)) return null;
        return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(BalanceBadge, {});
      }));
    });
  });
}
function registerAutoReviewMode(ctx) {
  trySlot("auto review mode", () => {
    ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
      name: "conversation.input.left",
      id: "dsh-ext-auto-review",
      order: 0,
      registrant: "dsh-ext"
    }, function DevToolAutoReviewMode() {
      const t = useT();
      const { view, busy, setMany } = useConfig();
      if (view === void 0) return null;
      const review = view.value.commandReview;
      if (review.enabled !== true) return null;
      const autoModeActive = review.enabled === true && review.mode === "all" && (review.writeOnly ?? true);
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          type: "button",
          "aria-pressed": autoModeActive,
          title: t("review.autoChip.hint"),
          disabled: busy,
          onClick: () => {
            setMany(autoModeActive ? [
              { path: ["commandReview", "enabled"], value: false },
              { path: ["commandReview", "mode"], value: "rules+llm" }
            ] : [
              { path: ["commandReview", "enabled"], value: true },
              { path: ["commandReview", "mode"], value: "all" },
              { path: ["commandReview", "writeOnly"], value: true },
              { path: ["commandReview", "absoluteDenyDelete"], value: true },
              { path: ["commandReview", "onFailure"], value: "ask" }
            ]);
          },
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            padding: "3px 9px",
            border: `1px solid ${autoModeActive ? token.accent : token.border}`,
            borderRadius: 999,
            background: autoModeActive ? "var(--dsw-alias-interactive-bg-hover, transparent)" : "transparent",
            color: autoModeActive ? token.accent : token.textMuted,
            cursor: "pointer",
            whiteSpace: "nowrap"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(ShieldCheckIcon, { size: 13 }),
            t("review.autoChip")
          ]
        }
      );
    }));
  });
}
function registerUserEditBubbles(ctx) {
  trySlot("user message edit bubble", () => {
    ctx.inject(["slots", "sessions", "workspaces"], (scope) => {
      const sessions = scope.sessions;
      const workspaces = scope.workspaces;
      scope.slots.inject("conversation.chat.node", () => scope.slots.register({
        name: "conversation.chat.node",
        key: "user",
        registrant: "dsh-ext",
        priority: -10,
        inject: (sessionId2) => ({
          sessionId: String(sessionId2),
          hooks: { turnData: () => () => void 0 }
        })
      }, function DevToolUserEditBubble(props) {
        const config = useClientConfig();
        if (config?.checkpoints.enabled !== true) return null;
        if (props.node?.kind !== "user") return null;
        return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          UserEditBubble,
          {
            sessionId: String(props.sessionId),
            sessions,
            workspaces,
            node: props.node.data,
            useWorkspaces: props.useWorkspaces
          }
        );
      }));
    });
  });
}
function registerTurnChangesCards(ctx) {
  trySlot("turn changes card", () => {
    ctx.inject(["slots", "sessions", "workspaces"], (scope) => {
      const sessions = scope.sessions;
      const workspaces = scope.workspaces;
      const lastTurn = /* @__PURE__ */ new Map();
      scope.slots.inject("conversation.chat.turnTail", () => scope.slots.register({
        name: "conversation.chat.turnTail",
        registrant: "dsh-ext",
        // Mount for every turn tail — running ones included, so the file list
        // is live while the agent works. The card hides itself when the turn
        // never mutated a tracked file.
        // STABILITY FIX: keep the last valid turn value per session, so a
        // transient undefined during navigation or session-switch doesn't
        // unmount the card and lose the data store subscription. The elect-one
        // chain re-runs on every owner change; a brief undefined here would
        // return null, unmount this card, and let the host's "产物" card steal
        // the slot — when the turn resolves, the host card stays and this one
        // never re-mounts. Caching the last good value keeps the card mounted.
        select: (owner) => {
          const key = String(owner.seq);
          const turn = owner.turn?.turn;
          const status = owner.turn?.status;
          if (Number.isSafeInteger(turn) && status !== void 0) {
            const value = { turn, status };
            lastTurn.set(key, value);
            return value;
          }
          return lastTurn.get(key) ?? null;
        },
        // The tail is an ELECT-ONE chain: entries are tried in ascending
        // priority and the first non-null select wins — this is not additive.
        // The host's own "产物" entry sits at the default 0 and declines when
        // the turn produced no files, which is why this card appeared only on
        // some turns. A negative priority puts the card first; when it hides
        // itself (select still matches, the component returns null) the host's
        // deliverables row does NOT come back — acceptable, because a turn with
        // file changes usually has that row too, and the card carries the same
        // file list with review affordances.
        priority: -10
      }, function DevToolTurnChangesCard(props) {
        const config = useClientConfig();
        const workspaceItems = props.useWorkspaces?.((state) => state.items);
        if (config === void 0) {
          return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(CardBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            TurnChangesCard,
            {
              sessionId: String(props.sessionId),
              turn: props.matched.turn,
              status: props.matched.status,
              workspaceItems,
              workspaces,
              sessions,
              disabled: true
            }
          ) });
        }
        if (config.checkpoints.enabled !== true) {
          return null;
        }
        return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(CardBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          TurnChangesCard,
          {
            sessionId: String(props.sessionId),
            turn: props.matched.turn,
            status: props.matched.status,
            workspaceItems,
            workspaces,
            sessions
          }
        ) });
      }));
    });
  });
}
function registerSidePanel(ctx) {
  trySlot("project side panel", () => {
    ctx.slots.inject("shell.overlay", () => ctx.slots.register({
      name: "shell.overlay",
      id: "dsh-ext-explorer",
      order: 40,
      registrant: "dsh-ext"
    }, function DevToolSidePanel(props) {
      const config = useClientConfig();
      const workspace = useActiveWorkspace(props.useWorkspaces);
      if (config?.explorer.enabled !== true) return null;
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        SidePanel,
        {
          side: config.explorer.side,
          defaultOpen: config.explorer.defaultOpen,
          workspace
        }
      );
    }));
  });
}
function registerExplorerToggles(ctx) {
  trySlot("explorer toggle", () => {
    ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
      name: "conversation.session.header.utilities",
      id: "dsh-ext-explorer-toggle",
      order: 70,
      registrant: "dsh-ext"
    }, function DevToolExplorerToggle(props) {
      const t = useT();
      const config = useClientConfig();
      const open3 = usePanelOpen(config?.explorer.defaultOpen ?? false);
      (0, import_react24.useEffect)(() => {
        setPanelSession(props.sessionId);
      }, [props.sessionId]);
      if (config?.explorer.enabled !== true) return null;
      const Icon = config.explorer.side === "right" ? PanelRightIcon : PanelLeftIcon;
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        "button",
        {
          type: "button",
          "aria-label": t("explorer.title"),
          "aria-pressed": open3,
          title: t("explorer.title"),
          onClick: () => {
            setPanelOpen(!open3);
          },
          style: {
            ...iconButtonStyle,
            color: open3 ? "var(--dsw-alias-label-primary, currentColor)" : "var(--dsw-alias-label-secondary, currentColor)",
            background: open3 ? "var(--dsw-alias-button-floating-fill, transparent)" : "transparent"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Icon, {})
        }
      );
    }));
  });
}
function registerOpenEditorLauncher(ctx) {
  trySlot("explorer open-editor launcher", () => {
    ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
      name: "conversation.session.header.utilities",
      id: "dsh-ext-open-editor",
      order: 2,
      registrant: "dsh-ext"
    }, function DevToolOpenEditorLauncher(props) {
      const t = useT();
      const config = useClientConfig();
      const [busy, setBusy] = (0, import_react24.useState)(false);
      const [failure, setFailure] = (0, import_react24.useState)(void 0);
      const [editorType, setEditorType] = (0, import_react24.useState)("vscode");
      const [dropdownOpen, setDropdownOpen] = (0, import_react24.useState)(false);
      if (config?.explorer.enabled !== true) return null;
      const open3 = async (editor) => {
        setBusy(true);
        setFailure(void 0);
        setDropdownOpen(false);
        const session = props.sessionId !== void 0 && props.sessionId.length > 0 ? `?session=${encodeURIComponent(props.sessionId)}&editor=${editor}` : `?editor=${editor}`;
        console.log("[DevTool] Opening with editor:", editor, "URL:", `/explorer/open-editor${session}`);
        const result = await callApi(`/explorer/open-editor${session}`);
        console.log("[DevTool] Open result:", result);
        setBusy(false);
        if (!result.ok) {
          setFailure({ text: t("explorer.openEditorFailed", { message: result.message }), seq: Date.now() });
        } else {
          setEditorType(editor);
        }
      };
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { style: { position: "relative", display: "inline-block" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
            "button",
            {
              type: "button",
              "aria-label": t("explorer.openEditor"),
              title: t("explorer.openEditor"),
              disabled: busy,
              onClick: () => {
                setDropdownOpen(!dropdownOpen);
              },
              style: {
                ...iconButtonStyle,
                width: "auto",
                height: 28,
                padding: "0 10px",
                borderRadius: 6,
                gap: 6
              },
              children: [
                editorType === "explorer" ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(FolderIcon2, { size: 16 }) : editorType === "idea" ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(IdeaIcon, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(VscodeIcon, { size: 16 }),
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { style: { fontSize: 13 }, children: t("explorer.openLabel") })
              ]
            }
          ),
          dropdownOpen && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "div",
              {
                style: {
                  position: "fixed",
                  inset: 0,
                  zIndex: 999
                },
                onClick: () => {
                  setDropdownOpen(false);
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "div",
              {
                style: {
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 4,
                  background: "var(--dsw-alias-bg-layer-2, #1a1d24)",
                  border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.1))",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  minWidth: 180,
                  zIndex: 1e3,
                  overflow: "hidden"
                },
                children: [
                  { type: "explorer", icon: FolderIcon2 },
                  { type: "vscode", icon: VscodeIcon },
                  { type: "idea", icon: IdeaIcon }
                ].map(({ type, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
                  "button",
                  {
                    type: "button",
                    disabled: busy,
                    onClick: () => {
                      void open3(type);
                    },
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background: editorType === type ? "var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.08))" : "transparent",
                      color: "var(--dsw-alias-label-primary, #e8eaed)",
                      fontSize: 13,
                      cursor: busy ? "not-allowed" : "pointer",
                      textAlign: "left",
                      opacity: busy ? 0.5 : 1,
                      transition: "background 140ms ease",
                      fontWeight: 500
                    },
                    onMouseEnter: (e) => {
                      if (!busy) e.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.08))";
                    },
                    onMouseLeave: (e) => {
                      if (editorType !== type) e.currentTarget.style.background = "transparent";
                    },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Icon, { size: 16 }),
                      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { style: { flex: 1 }, children: t(`explorer.openWith.${type}`) }),
                      editorType === type && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { style: { fontSize: 14, color: "var(--dsw-alias-brand-primary, #5c9fff)" }, children: "\u2713" })
                    ]
                  },
                  type
                ))
              }
            )
          ] })
        ] }),
        failure !== void 0 && // Keyed by a per-show sequence: re-showing restarts the fade.
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_dsh_client_ui_primitives5.Toast, { text: failure.text, onDone: () => {
          setFailure(void 0);
        } }, failure.seq)
      ] });
    }));
  });
}
function registerRecycleBin(ctx) {
  trySlot("recycle bin", () => {
    ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
      name: "sidebar.footer.action",
      id: "dsh-ext-trash",
      order: 0,
      registrant: "dsh-ext"
    }, function DevToolRecycleBin(props) {
      const t = useT();
      const config = useClientConfig();
      const [open3, setOpen] = (0, import_react24.useState)(false);
      if (config?.sessionAdmin.enabled !== true) return null;
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
          "button",
          {
            type: "button",
            "aria-label": t("sessions.trashButton"),
            title: t("sessions.trashButton"),
            onClick: () => {
              setOpen(true);
            },
            style: {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: props.wide ? "flex-start" : "center",
              gap: 8,
              width: props.wide ? "100%" : 44,
              height: 34,
              padding: props.wide ? "0 10px" : 0,
              border: "none",
              borderRadius: 8,
              background: "transparent",
              color: "var(--dsw-alias-label-secondary, currentColor)",
              cursor: "pointer",
              fontSize: 12,
              whiteSpace: "nowrap",
              flex: "0 0 auto"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.08))";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "transparent";
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(TrashIcon, { size: 16 }),
              props.wide && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { children: t("sessions.trashButton") })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(TrashModal, { open: open3, onClose: () => {
          setOpen(false);
        } })
      ] });
    }));
  });
}
function useLocalToggle(key, fallback2) {
  const read3 = () => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback2 : stored === "1";
    } catch {
      return fallback2;
    }
  };
  const [open3, setOpen] = (0, import_react24.useState)(read3);
  const write = (next) => {
    setOpen(next);
    try {
      window.localStorage.setItem(key, next ? "1" : "0");
    } catch {
    }
  };
  return [open3, write];
}

return module.exports;
	}
});

