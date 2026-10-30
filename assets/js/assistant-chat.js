import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PROFILE_DATA } from "./data.js";

const h = React.createElement;
const PROMPTS = [
  ["Projects", "Tell me about Fardin's projects."],
  ["Education", "What is Fardin's educational background?"],
  ["Experience", "Tell me about Fardin's work experience."]
];
const isPreview = () => document.documentElement.dataset.inspectionPreview === "true";

// Only real, completed conversation enters context. Append the current question
// after truncation, so every request ends with user and contains at most 8 turns.
function requestMessages(history, question) {
  const outgoing = [...history.filter((m) =>
    (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()
  ).slice(-7).map(({ role, content }) => ({ role, content: content.trim().slice(0, 1000) })),
  { role: "user", content: question }];
  while (outgoing.length > 1 && new TextEncoder().encode(JSON.stringify({ messages: outgoing })).length > 16 * 1024) outgoing.shift();
  return outgoing;
}

function RobotIcon() {
  return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", "aria-hidden": true },
    h("path", { d: "M12 3v3M10 3h4M3 11H1m22 0h-2M8 20v-2m8 2v-2" }),
    h("rect", { x: 3, y: 6, width: 18, height: 12, rx: 4 }),
    h("path", { d: "M8 10v2m8-2v2m-7 3h6" }));
}

/**
 * Controlled, persistent child: <PortfolioAssistant open={open}
 *   onClose={() => setOpen(false)} returnFocusRef={lastLauncherRef} />.
 * Keep mounted when closed to retain draft/recent conversation in memory only.
 * Parent owns launchers/open state and loads assistant-chat.css. No storage,
 * keys, provider SDKs, greeting in request context, or replacement of other dialogs.
 * GET /api/assistant-status -> {configured:boolean}; POST /api/chat -> {reply:string}
 * or {error:{code:string,message:string}}. Configuration is not a connection test.
 * Outbound assistant context is capped at 1000 chars/turn to match server limits;
 * replies remain fully visible. Failed/aborted pending turns return to the draft.
 */
export function PortfolioAssistant({ open, onClose, returnFocusRef }) {
  const uid = useId();
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const callbacks = useRef({ onClose, returnFocusRef });
  callbacks.current = { onClose, returnFocusRef };
  const activeRef = useRef(false);
  const closingRef = useRef(false);
  const pendingRef = useRef(null);
  const statusRequestRef = useRef(null);
  const historyRef = useRef([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");

  function abortChat() {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    window.clearTimeout(pending.timer);
    pending.controller.abort();
    historyRef.current = pending.history;
    setMessages(pending.history);
    setDraft(pending.question);
    setBusy(false);
  }

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    activeRef.current = false;
    statusRequestRef.current?.abort();
    abortChat();
    if (dialogRef.current?.open) dialogRef.current.close();
    callbacks.current.onClose?.();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previousFocus = document.activeElement;
    activeRef.current = true;
    closingRef.current = false;
    setDialogError("");
    setError("");
    // Native modal top layer provides inert background and the browser's focus
    // containment. Never close or mutate any other dialog on the page.
    try {
      if (!dialog.open) dialog.showModal();
      inputRef.current?.focus({ preventScroll: true });
    } catch (_error) {
      setDialogError("This browser could not open the chat dialog. Please use Fardin's contact links.");
      activeRef.current = false;
      callbacks.current.onClose?.();
      return;
    }

    let live = true;
    let timer;
    const controller = new AbortController();
    statusRequestRef.current = controller;
    if (isPreview()) {
      setStatus("preview");
    } else {
      setStatus("checking");
      timer = window.setTimeout(() => controller.abort(), 6000);
      (async () => {
        try {
          const response = await fetch("/api/assistant-status", {
            method: "GET", signal: controller.signal, headers: { Accept: "application/json" }, cache: "no-store"
          });
          if (!response.ok) throw new Error("status");
          const data = await response.json();
          if (typeof data.configured !== "boolean") throw new Error("status");
          if (live && activeRef.current) setStatus(data.configured ? "configured" : "unconfigured");
        } catch (_error) {
          if (live && activeRef.current) setStatus("unavailable");
        } finally {
          window.clearTimeout(timer);
        }
      })();
    }
    return () => {
      live = false;
      activeRef.current = false;
      window.clearTimeout(timer);
      controller.abort();
      if (statusRequestRef.current === controller) statusRequestRef.current = null;
      abortChat();
      if (dialog.open) dialog.close();
      const target = callbacks.current.returnFocusRef?.current || previousFocus;
      if (target?.isConnected && typeof target.focus === "function") target.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    // Scroll only this panel, never scrollIntoView (which can move the page).
    if (open && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy, open]);

  async function send(event) {
    event?.preventDefault();
    const question = draft.trim();
    if (!open || !activeRef.current || isPreview() || status !== "configured" || pendingRef.current || !question || question.length > 1000) return;
    const history = historyRef.current;
    const controller = new AbortController();
    const pending = { controller, history, question, timer: null, timedOut: false };
    pendingRef.current = pending;
    const outgoing = requestMessages(history, question);
    setDraft("");
    setError("");
    setMessages([...history, { role: "user", content: question }]);
    setBusy(true);
    pending.timer = window.setTimeout(() => { pending.timedOut = true; controller.abort(); }, 20000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ messages: outgoing })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        const failure = new Error("provider");
        failure.code = data.error?.code;
        throw failure;
      }
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("response");
      if (pendingRef.current !== pending || !activeRef.current) return;
      const next = [...history, { role: "user", content: question }, { role: "assistant", content: data.reply.trim() }].slice(-8);
      historyRef.current = next;
      setMessages(next);
    } catch (failure) {
      if (pendingRef.current !== pending || !activeRef.current) return;
      // Remove the failed optimistic turn, restore the exact question to the
      // composer, and retry through ordinary Send. No duplicate user context.
      setMessages(history);
      setDraft(question);
      if (["AI_NOT_CONFIGURED", "NOT_CONFIGURED", "not_configured"].includes(failure.code)) setStatus("unconfigured");
      setError(pending.timedOut
        ? "The request timed out. Your question is back in the box; you can try again."
        : failure.code === "RATE_LIMITED" ? "Too many requests. Wait a minute before trying again. Your question has been kept."
          : "No reply was received. Your question is back in the box; try again or contact Fardin.");
    } finally {
      window.clearTimeout(pending.timer);
      if (pendingRef.current === pending) {
        pendingRef.current = null;
        setBusy(false);
        if (activeRef.current) inputRef.current?.focus({ preventScroll: true });
      }
    }
  }

  function trapTab(event) {
    if (event.key !== "Tab") return;
    const elements = [...dialogRef.current.querySelectorAll('button:not(:disabled), a[href], textarea:not(:disabled), [tabindex="0"]')]
      .filter((element) => element.getClientRects().length > 0);
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  }

  const statusText = {
    idle: "Not connected yet.", checking: "Checking server configuration…",
    configured: "Server configured · connection not verified",
    unconfigured: "Not configured · not connected yet",
    unavailable: "Server status unavailable · chat cannot send",
    preview: "Inspection preview: run local Node server for chat"
  }[status];
  const canSend = status === "configured" && !busy && draft.trim().length > 0 && draft.trim().length <= 1000;
  const content = h("dialog", {
    ref: dialogRef, className: "pc-dialog", "aria-labelledby": `${uid}-title`,
    "aria-describedby": `${uid}-intro`, "aria-modal": true, "data-lenis-prevent": "",
    onCancel: (event) => { event.preventDefault(); close(); },
    onClose: () => { if (activeRef.current && !dialogRef.current?.open) close(); },
    onKeyDown: trapTab
  },
  h("header", { className: "pc-header" },
    h("span", { className: "pc-robot" }, h(RobotIcon)),
    h("div", { className: "pc-heading" },
      h("h2", { id: `${uid}-title`, className: "pc-title" }, "Fardin's assistant"),
      h("p", { className: "pc-eyebrow" }, "PORTFOLIO / ASK & EXPLORE")),
    h("button", { type: "button", className: "pc-close", onClick: close, "aria-label": "Close assistant" },
      h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, "aria-hidden": true }, h("path", { d: "m6 6 12 12M6 18 18 6" })))),
  h("p", { className: "pc-status", role: "status", "aria-live": "polite" }, statusText),
  h("div", { className: "pc-log", ref: logRef, role: "log", "aria-label": "Conversation", "aria-live": "polite", "aria-relevant": "additions text", tabIndex: 0, "data-lenis-prevent": "" },
    h("div", { className: "pc-welcome" },
      h("p", { className: "pc-welcome-title" }, "A little context, a better conversation."),
      h("p", { id: `${uid}-intro` }, "Ask about Fardin's projects, education, or experience. When connected, replies use the portfolio context available to the server and may be incomplete. This is not Fardin speaking.")),
    ...messages.map((message, index) => h("article", { className: `pc-message pc-message-${message.role}`, key: index },
      h("span", { className: "pc-speaker" }, message.role === "user" ? "You" : "Assistant"),
      h("p", { className: "pc-message-text" }, message.content))),
    busy ? h("p", { className: "pc-pending", role: "status" }, "Waiting for a server reply…") : null),
  h("div", { className: "pc-composer" },
    h("div", { className: "pc-prompts", "aria-label": "Question starters" }, ...PROMPTS.map(([label, question]) => h("button", {
      key: label, type: "button", className: "pc-chip", disabled: busy,
      onClick: () => { setDraft(question); inputRef.current?.focus({ preventScroll: true }); }
    }, label))),
    status !== "configured" ? h("p", { className: "pc-help", id: `${uid}-availability` },
      status === "checking" ? "You can draft a question while configuration is checked."
        : status === "preview" ? "Chat requests are disabled in this static preview."
          : "Not connected yet. You can still draft a question or use the contact links below.") : null,
    h("p", { className: "pc-error", role: "alert", id: `${uid}-error`, hidden: !error && !dialogError }, error || dialogError),
    h("form", { className: "pc-form", onSubmit: send },
      h("label", { className: "pc-sr-only", htmlFor: `${uid}-input` }, "Your question"),
      h("textarea", {
        id: `${uid}-input`, className: "pc-input", ref: inputRef, value: draft, maxLength: 1000, rows: 2,
        placeholder: "Ask about Fardin…", readOnly: busy, enterKeyHint: "send",
        "aria-describedby": `${uid}-hint${status !== "configured" ? ` ${uid}-availability` : ""}${error ? ` ${uid}-error` : ""}`,
        onChange: (event) => setDraft(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
            event.preventDefault(); send();
          }
        }
      }),
      h("button", { className: "pc-send", type: "submit", disabled: !canSend, "aria-label": "Send question" }, "Send", h("span", { "aria-hidden": true }, " ↗"))),
    h("div", { className: "pc-footer" },
      h("span", { className: "pc-hint", id: `${uid}-hint` }, `${draft.length}/1000 · Shift+Enter for a new line`),
      h("a", { className: "pc-contact", href: `mailto:${PROFILE_DATA.email}` }, "Email Fardin")),
    h("p", { className: "pc-privacy" }, "Recent messages stay in this tab's memory. Sending shares them with the chat server. Avoid sensitive information.")));
  return typeof document === "undefined" ? null : createPortal(content, document.body);
}

export default PortfolioAssistant;
