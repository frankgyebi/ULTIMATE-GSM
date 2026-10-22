"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { quickReplies, replyTo } from "@/lib/chat";
import { site, whatsappUrl } from "@/lib/site";

type Role = "bot" | "user";
type Message = { id: string; role: Role; text: string; links?: { href: string; label: string }[]; handoff?: boolean };

const greeting: Message = {
  id: "greet",
  role: "bot",
  text: "Hi, I am the Ultimate GSM desk chat. Ask about a repair, or tap a quick reply. If I cannot help, I will hand you to WhatsApp with this chat included.",
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function ChatWidget() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const ready = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ugsm-chat");
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {
      /* keep greeting */
    }
    ready.current = true;
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    sessionStorage.setItem("ugsm-chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    function onAsk(event: Event) {
      const product = (event as CustomEvent<{ product?: string }>).detail?.product;
      if (!product) return;
      setOpen(true);
      setDraft(`Do you have the ${product} in stock?`);
      setLive(`Chat opened. Asking about ${product}.`);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
    window.addEventListener("ugsm-chat", onAsk);
    return () => window.removeEventListener("ugsm-chat", onAsk);
  }, []);

  function pushBot(text: string, extra?: Partial<Message>) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      const reply = replyTo(text);
      const message: Message = {
        id: uid(),
        role: "bot",
        text: extra?.text ?? reply.text,
        links: extra?.links ?? reply.links,
        handoff: extra?.handoff ?? reply.handoff,
      };
      setMessages((current) => [...current, message]);
      setLive(message.text);
    }, reduced ? 0 : 420);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { id: uid(), role: "user", text: trimmed }]);
    setDraft("");
    setLive(`You said: ${trimmed}`);
    pushBot(trimmed);
  }

  function handoffHref() {
    const transcript = messages
      .map((message) => `${message.role === "user" ? "Customer" : "Chat"}: ${message.text}`)
      .join("\n");
    return whatsappUrl(`Hello Ultimate GSM, continuing from the website chat:\n\n${transcript}`);
  }

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="chat-fab ripple"
        aria-expanded={open}
        aria-controls="ugsm-chat-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ping" aria-hidden="true" />
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" aria-hidden="true">
          <path d="M5 17.5 3 21l3.6-1.6A9 9 0 1 0 5 17.5Z" />
        </svg>
        <span className="sr-only">{open ? "Close chat" : "Open chat"}</span>
      </button>
      {open ? (
        <section
          id="ugsm-chat-panel"
          className="chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          <div className="chat-head">
            <div>
              <strong id={titleId}>Ultimate GSM</strong>
              <p className="faint" style={{ margin: 0, fontSize: "0.8rem" }}>
                Desk chat · WhatsApp {site.whatsappLink}
              </p>
            </div>
            <button type="button" className="text-btn" onClick={close}>
              Close
            </button>
          </div>
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {live}
          </div>
          <div className="chat-log" ref={logRef}>
            {messages.map((message) => (
              <div key={message.id} className={`bubble ${message.role}`}>
                <p style={{ margin: 0 }}>{message.text}</p>
                {message.links?.length ? (
                  <p style={{ margin: "8px 0 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {message.links.map((link) => (
                      <Link key={link.href} href={link.href} onClick={close}>
                        {link.label}
                      </Link>
                    ))}
                  </p>
                ) : null}
                {message.handoff ? (
                  <p style={{ margin: "8px 0 0" }}>
                    <a href={handoffHref()} target="_blank" rel="noopener noreferrer">
                      Send via WhatsApp
                    </a>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="quick" aria-label="Quick replies">
            {quickReplies.map((reply) => (
              <button key={reply.id} type="button" onClick={() => send(reply.message)}>
                {reply.label}
              </button>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <label className="sr-only" htmlFor="chat-input">
              Message
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={draft}
              maxLength={500}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a question"
              onKeyDown={(event) => {
                if (event.key === "Escape") close();
              }}
            />
            <button type="submit" className="btn btn-blue ripple">
              Send
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
