import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, BatteryFull, Bell, Check, ExternalLink, FileAudio,
  Files, Home, Image, Images, Mail, MessageSquareText, Music2, PhoneCall,
  PlaySquare, Plus, Send, Signal, Video, X,
} from "lucide-react";
import {
  PHONE_AUDIO_FILES, PHONE_CONTACT, PHONE_GALLERY_IMAGES, PHONE_MESSAGES,
  PHONE_NOTIFICATIONS, PHONE_SOCIAL_LINKS, PHONE_VIDEO_FILES,
} from "../data/phoneConfig";

type PhoneApp = "home" | "phone" | "messages" | "gallery" | "files" | "player";
type StoredMedia = { id: string; name: string; type: string; size: number; createdAt: number; blob: Blob };
type PlayableMedia = { id: string; name: string; type: string; src: string; size?: number; poster?: string };

const DB_NAME = "zynx-phone-media";
const DB_VERSION = 1;
const STORE_NAME = "media";
const MAX_MEDIA_SIZE = 75 * 1024 * 1024;

type BrandGlyphProps = { size?: number; strokeWidth?: number };
const InstagramGlyph: React.FC<BrandGlyphProps> = ({ size = 23, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="17.6" cy="6.5" r="1" fill="currentColor" />
  </svg>
);
const FacebookGlyph: React.FC<BrandGlyphProps> = ({ size = 23 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.65 21v-8.2h2.76l.41-3.2h-3.17V7.56c0-.93.26-1.56 1.59-1.56h1.69V3.14A22.4 22.4 0 0 0 14.47 3c-2.44 0-4.11 1.49-4.11 4.23V9.6H7.6v3.2h2.76V21h3.29Z" />
  </svg>
);
const YoutubeGlyph: React.FC<BrandGlyphProps> = ({ size = 23 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21.58 7.19a2.9 2.9 0 0 0-2.04-2.05C17.74 4.65 12 4.65 12 4.65s-5.74 0-7.54.49a2.9 2.9 0 0 0-2.04 2.05A30 30 0 0 0 1.93 12c0 1.63.16 3.24.49 4.81a2.9 2.9 0 0 0 2.04 2.05c1.8.49 7.54.49 7.54.49s5.74 0 7.54-.49a2.9 2.9 0 0 0 2.04-2.05c.33-1.57.49-3.18.49-4.81s-.16-3.24-.49-4.81Z" fill="currentColor" />
    <path d="m10 15.5 5.2-3.5L10 8.5v7Z" fill="#e31837" />
  </svg>
);

const openMediaDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  if (!("indexedDB" in window)) {
    reject(new Error("Local media storage is not available in this browser."));
    return;
  }
  const request = window.indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(STORE_NAME)) {
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error("Could not open local media storage."));
});

const readStoredMedia = async () => {
  const db = await openMediaDb();
  return new Promise<StoredMedia[]>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      db.close();
      resolve((request.result as StoredMedia[]).sort((a, b) => b.createdAt - a.createdAt));
    };
    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error("Could not read saved media."));
    };
  });
};

const prettySize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const PhoneExperience: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [app, setApp] = useState<PhoneApp>("home");
  const [storedMedia, setStoredMedia] = useState<StoredMedia[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PlayableMedia | null>(null);
  const [playerReturnTo, setPlayerReturnTo] = useState<"gallery" | "files">("gallery");
  const [messageDraft, setMessageDraft] = useState(PHONE_CONTACT.messageDraft);
  const [notice, setNotice] = useState("");
  const [clock, setClock] = useState(() => new Date());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    readStoredMedia().then(items => {
      if (!cancelled) setStoredMedia(items);
    }).catch(() => {
      if (!cancelled) setNotice("Local media storage is unavailable in this browser.");
    });
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const next: Record<string, string> = {};
    storedMedia.forEach(item => { next[item.id] = URL.createObjectURL(item.blob); });
    setMediaUrls(next);
    return () => Object.values(next).forEach(url => URL.revokeObjectURL(url));
  }, [storedMedia]);

  useEffect(() => () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      if (preview) {
        setPreview(null);
        setApp(app === "player" ? playerReturnTo : app);
      } else if (app !== "home") {
        setApp("home");
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [app, onClose, playerReturnTo, preview]);

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(""), 2600);
  };

  const refreshFiles = async () => {
    try {
      setStoredMedia(await readStoredMedia());
    } catch {
      showNotice("Could not update this device's media library.");
    }
  };

  const saveFiles = async (files: File[]) => {
    const accepted = files.filter(file => file.type.startsWith("image/") || file.type.startsWith("audio/") || file.type.startsWith("video/"));
    const tooLarge = accepted.filter(file => file.size > MAX_MEDIA_SIZE);
    const smallEnough = accepted.filter(file => file.size <= MAX_MEDIA_SIZE);
    if (tooLarge.length) showNotice("Each file must be 75 MB or smaller.");
    if (!accepted.length) {
      showNotice("Choose an image, audio, or video file.");
      return;
    }
    try {
      const db = await openMediaDb();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        smallEnough.forEach((file, index) => {
          const id = `${Date.now()}-${index}-${crypto.randomUUID?.() ?? file.name}`;
          transaction.objectStore(STORE_NAME).put({
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            createdAt: Date.now(),
            blob: file,
          } satisfies StoredMedia);
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error("Could not save media."));
        transaction.onabort = () => reject(transaction.error ?? new Error("Media save was cancelled."));
      });
      db.close();
      await refreshFiles();
      if (smallEnough.length) showNotice(`${smallEnough.length} file${smallEnough.length === 1 ? "" : "s"} saved on this device.`);
    } catch {
      showNotice("This browser could not save the selected media.");
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const db = await openMediaDb();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error("Could not remove file."));
      });
      db.close();
      await refreshFiles();
      showNotice("File removed from this device.");
    } catch {
      showNotice("Could not remove that file.");
    }
  };

  const openMedia = (item: PlayableMedia) => {
    setPlayerReturnTo(app === "files" ? "files" : "gallery");
    setPreview(item);
    setApp("player");
  };

  const uploadedMedia: PlayableMedia[] = storedMedia.flatMap(item => {
    const src = mediaUrls[item.id];
    return src ? [{ id: item.id, name: item.name, type: item.type, src, size: item.size }] : [];
  });
  const imageItems = [
    ...PHONE_GALLERY_IMAGES.map(item => ({ ...item, type: "image/jpeg", size: undefined })),
    ...uploadedMedia.filter(item => item.type.startsWith("image/")),
  ];
  const videoItems = uploadedMedia.filter(item => item.type.startsWith("video/"));
  const bundledVideos: PlayableMedia[] = PHONE_VIDEO_FILES.map(item => ({ ...item, size: undefined }));
  const allVideoItems = [...bundledVideos, ...videoItems];
  const audioItems: PlayableMedia[] = [
    ...PHONE_AUDIO_FILES.map(item => ({ ...item, size: undefined })),
    ...uploadedMedia.filter(item => item.type.startsWith("audio/")),
  ];

  const phoneApps = [
    { id: "phone" as const, label: "Phone", Icon: PhoneCall, color: "from-emerald-400 to-teal-600", onClick: () => setApp("phone") },
    { id: "messages" as const, label: "Messages", Icon: MessageSquareText, color: "from-sky-400 to-blue-600", badge: PHONE_MESSAGES.length, onClick: () => setApp("messages") },
    { id: "instagram", label: "@7osh___", Icon: InstagramGlyph, color: "from-fuchsia-500 via-rose-500 to-amber-400", href: PHONE_SOCIAL_LINKS.instagram },
    { id: "producer", label: "@7ynx777", Icon: InstagramGlyph, color: "from-violet-500 via-fuchsia-500 to-rose-400", href: PHONE_SOCIAL_LINKS.instagramProducer },
    { id: "facebook", label: "Zynx Z", Icon: FacebookGlyph, color: "from-blue-500 to-blue-700", href: PHONE_SOCIAL_LINKS.facebook },
    { id: "youtube", label: "YouTube", Icon: YoutubeGlyph, color: "from-red-500 to-red-700", href: PHONE_SOCIAL_LINKS.youtube },
    { id: "gallery" as const, label: "Gallery", Icon: Images, color: "from-violet-400 to-indigo-600", onClick: () => setApp("gallery") },
    { id: "files" as const, label: "Files", Icon: Files, color: "from-amber-300 to-orange-500", onClick: () => setApp("files") },
  ];

  const pageTitle: Record<PhoneApp, string> = {
    home: "",
    phone: "Phone",
    messages: "Messages",
    gallery: "Gallery",
    files: "Files",
    player: preview?.name ?? "Media",
  };

  const openSmsLink = `sms:${PHONE_CONTACT.phone.replace(/[^+\d]/g, "")}?body=${encodeURIComponent(messageDraft)}`;
  const openWhatsAppLink = `${PHONE_CONTACT.whatsapp}${PHONE_CONTACT.whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(messageDraft)}`;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-2 backdrop-blur-md sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Interactive mobile phone"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="relative h-[min(850px,calc(100dvh-1rem))] w-[min(410px,calc(100vw-1rem))] overflow-hidden rounded-[3rem] border border-white/20 bg-[#05070c] p-[7px] shadow-[0_30px_120px_rgba(0,0,0,.75)] ring-1 ring-black">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[2.55rem] border border-white/10 bg-[#0b101b] text-white">
          <div className="relative flex h-12 shrink-0 items-center justify-between px-6 pt-1 text-[10px] font-semibold text-white/85">
            <span>{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <div className="absolute left-1/2 top-2 h-5 w-[4.75rem] -translate-x-1/2 rounded-full border border-white/5 bg-black" />
            <span className="flex items-center gap-1.5 tracking-[0.08em]"><Signal size={12} /><span>5G</span><BatteryFull size={15} /></span>
          </div>

          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
            {app === "home" ? (
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-100/75">
                <img src="/images/z7x-logo.svg" alt="Z7X" className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(34,211,238,.55)]" />
                Z7X
              </div>
            ) : (
              <button onClick={() => { setApp(app === "player" ? playerReturnTo : "home"); setPreview(null); }} className="flex items-center gap-1 text-sm text-white/75 hover:text-white" aria-label={`Back to ${app === "player" ? playerReturnTo : "phone home"}`}>
                <ArrowLeft size={17} /> <span className="font-medium">{pageTitle[app]}</span>
              </button>
            )}
            <div className="flex items-center gap-1">
              {app !== "home" && app !== "player" && (
                <button onClick={() => setApp("home")} className="grid h-8 w-8 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white" aria-label="Phone home">
                  <Home size={16} />
                </button>
              )}
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white" aria-label="Close phone view">
                <X size={17} />
              </button>
            </div>
          </div>

          <div className="phone-screen-scroll relative min-h-0 flex-1 overflow-y-auto">
            {app === "home" && (
              <div className="min-h-full bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,.26),transparent_45%),radial-gradient(ellipse_at_100%_80%,rgba(168,85,247,.15),transparent_40%)] px-5 pb-6 pt-5">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] text-cyan-100/60">{clock.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</div>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">Hey, I’m ZYNX.</h2>
                    <p className="mt-1 text-xs text-white/55">A small window into my digital world.</p>
                  </div>
                  <button onClick={() => showNotice(`${PHONE_NOTIFICATIONS.length} phone notification${PHONE_NOTIFICATIONS.length === 1 ? "" : "s"}`)} className="relative mb-1 grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/10" aria-label="Show notifications">
                    <Bell size={17} />
                    {PHONE_NOTIFICATIONS.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400" />}
                  </button>
                </div>

                <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-xl backdrop-blur-xl">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-white/45"><Bell size={12} /> Notifications</div>
                  <div className="space-y-3">
                    {PHONE_NOTIFICATIONS.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200"><Home size={15} /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-2 text-[11px]"><span className="font-semibold">{item.app}</span><span className="shrink-0 text-white/35">{item.time}</span></div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-white/55">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                  {phoneApps.map(({ id, label, Icon, color, badge, onClick, href }) => {
                    const content = (
                      <>
                        <span className={`relative grid h-[3.55rem] w-[3.55rem] place-items-center rounded-[1.2rem] bg-gradient-to-br ${color} text-white shadow-lg shadow-black/35 transition group-hover:-translate-y-0.5 group-hover:brightness-110 group-hover:shadow-[0_0_24px_rgba(102,220,255,.28)] group-hover:ring-1 group-hover:ring-white/45`}>
                          <Icon size={23} strokeWidth={1.8} />
                          {badge ? <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold">{badge}</span> : null}
                        </span>
                        <span className="mt-1.5 text-[10px] text-white/75">{label}</span>
                      </>
                    );
                    if (href) return (
                      <a key={id} href={href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-center" title={`Open ${label}`}>
                        {content}
                      </a>
                    );
                    return (
                      <button key={id} onClick={onClick} className="group flex flex-col items-center text-center">
                        {content}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-center justify-center gap-1.5 text-[9px] text-white/30"><span className="h-1 w-1 rounded-full bg-white/40" /><span className="h-1 w-1 rounded-full bg-white/15" /><span className="h-1 w-1 rounded-full bg-white/15" /></div>
              </div>
            )}

            {app === "phone" && (
              <div className="flex min-h-full flex-col items-center px-6 pb-8 pt-10 text-center">
                <div className="grid h-24 w-24 place-items-center rounded-full border border-emerald-200/20 bg-gradient-to-br from-emerald-300/20 to-cyan-400/10 text-emerald-100 shadow-[0_0_50px_rgba(52,211,153,.12)]"><PhoneCall size={35} /></div>
                <h2 className="mt-5 text-xl font-semibold">{PHONE_CONTACT.name}</h2>
                <p className="mt-1 text-xs text-white/45">Portfolio contact</p>
                <a href={`tel:${PHONE_CONTACT.phone.replace(/[^+\d]/g, "")}`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-[#06251b] transition hover:bg-emerald-400">
                  <PhoneCall size={17} /> Call {PHONE_CONTACT.name}
                </a>
                <button onClick={() => setApp("messages")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3 text-sm text-white/80 hover:bg-white/10">
                  <MessageSquareText size={17} /> Send a message
                </button>
                <p className="mt-4 text-[10px] leading-relaxed text-white/35">The call button opens your device’s phone app when one is available.</p>
              </div>
            )}

            {app === "messages" && (
              <div className="space-y-4 p-4 pb-8">
                <div className="rounded-2xl border border-sky-300/15 bg-sky-400/[0.08] p-3 text-[10px] leading-relaxed text-sky-50/65">
                  Messages and notifications are editable in <code className="text-sky-100">src/data/phoneConfig.ts</code>.
                </div>
                {PHONE_MESSAGES.map(item => (
                  <div key={item.id} className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.07] p-3">
                    <div className="mb-1 flex items-center justify-between gap-3 text-[10px]"><span className="font-semibold text-sky-200">{item.sender}</span><span className="text-white/30">{item.time}</span></div>
                    <p className="text-xs leading-relaxed text-white/75">{item.text}</p>
                  </div>
                ))}
                <div className="border-t border-white/[0.08] pt-4">
                  <label htmlFor="phone-message" className="mb-2 block text-[10px] font-mono uppercase tracking-[0.12em] text-white/45">Write a message</label>
                  <textarea id="phone-message" value={messageDraft} onChange={event => setMessageDraft(event.target.value)} rows={4} className="w-full resize-none select-text rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-white outline-none focus:border-sky-300/40" placeholder="Write a message to ZYNX…" />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <a href={openSmsLink} className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-400 py-2.5 text-[11px] font-semibold text-slate-950 hover:bg-sky-300"><Send size={13} /> SMS</a>
                    <a href={openWhatsAppLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-400/10 py-2.5 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-400/15"><MessageSquareText size={13} /> WhatsApp</a>
                  </div>
                  <a href={`mailto:${PHONE_CONTACT.email}?subject=${encodeURIComponent("Message from the portfolio phone")}&body=${encodeURIComponent(messageDraft)}`} className="mt-2 flex items-center justify-center gap-1.5 py-2 text-[10px] text-white/45 hover:text-white/80"><Mail size={12} /> or send by email</a>
                </div>
              </div>
            )}

            {app === "gallery" && (
              <div className="p-4 pb-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div><h2 className="text-sm font-semibold">Moments & media</h2><p className="mt-1 text-[10px] text-white/40">Tap an image or clip to open it.</p></div>
                  <button onClick={() => setApp("files")} className="flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1.5 text-[10px] text-white/65 hover:bg-white/10"><Plus size={12} /> Add media</button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {imageItems.map(item => (
                    <button key={item.id} onClick={() => openMedia(item)} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left">
                      <img src={item.src} alt={item.name} loading="lazy" className="aspect-[1.12] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                      <span className="block truncate px-2.5 py-2 text-[10px] text-white/70">{item.name}</span>
                    </button>
                  ))}
                  {allVideoItems.map(item => (
                    <button key={item.id} onClick={() => openMedia(item)} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black text-left">
                      <div className="relative grid aspect-[1.12] place-items-center overflow-hidden bg-gradient-to-br from-violet-950 to-slate-900 text-violet-100">
                        {item.poster && <img src={item.poster} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />}
                        <span className="relative grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/35 shadow-lg backdrop-blur-sm"><Video size={21} /></span>
                        <span className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 text-[9px]">{item.id === "nebula-drift-4k" ? "4K · VIDEO" : "VIDEO"}</span>
                      </div>
                      <span className="block truncate px-2.5 py-2 text-[10px] text-white/70">{item.name}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-center text-[10px] text-white/30">Your uploaded gallery media stays in this browser on this device.</p>
              </div>
            )}

            {app === "files" && (
              <div className="p-4 pb-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div><h2 className="text-sm font-semibold">On this phone</h2><p className="mt-1 text-[10px] text-white/40">Portfolio samples and your saved media.</p></div>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-2 text-[10px] font-semibold text-[#281b07] hover:bg-amber-200"><Plus size={13} /> Add files</button>
                  <input ref={fileInputRef} type="file" accept="image/*,audio/*,video/*" multiple className="hidden" onChange={event => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) void saveFiles(files);
                    event.target.value = "";
                  }} />
                </div>
                <div className="mb-3 rounded-2xl border border-amber-200/10 bg-amber-300/[0.06] p-3 text-[10px] leading-relaxed text-amber-50/55">Add images, audio, or small videos up to 75 MB each. Uploaded files are stored locally in this browser and are not sent to a server.</div>
                <div className="space-y-2">
                  {audioItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fuchsia-400/15 text-fuchsia-200"><FileAudio size={18} /></span>
                      <button onClick={() => openMedia(item)} className="min-w-0 flex-1 text-left"><span className="block truncate text-xs font-medium">{item.name}</span><span className="mt-1 block text-[9px] text-white/35">Audio · {item.size ? prettySize(item.size) : "Portfolio file"}</span></button>
                      <button onClick={() => openMedia(item)} className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10" aria-label={`Play ${item.name}`}><PlaySquare size={16} /></button>
                    </div>
                  ))}
                  {allVideoItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/15 text-violet-200"><Video size={18} /></span>
                      <button onClick={() => openMedia(item)} className="min-w-0 flex-1 text-left"><span className="block truncate text-xs font-medium">{item.name}</span><span className="mt-1 block text-[9px] text-white/35">Video · {item.size ? prettySize(item.size) : "Bundled media"}</span></button>
                      {item.size && <button onClick={() => void deleteFile(item.id)} className="grid h-8 w-8 place-items-center rounded-full text-white/35 hover:bg-rose-400/10 hover:text-rose-200" aria-label={`Remove ${item.name}`}><X size={15} /></button>}
                    </div>
                  ))}
                  {uploadedMedia.filter(item => item.type.startsWith("image/")).map(item => {
                    const Icon = item.type.startsWith("video/") ? Video : Image;
                    return (
                      <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200"><Icon size={18} /></span>
                        <button onClick={() => openMedia(item)} className="min-w-0 flex-1 text-left"><span className="block truncate text-xs font-medium">{item.name}</span><span className="mt-1 block text-[9px] text-white/35">{item.type.startsWith("video/") ? "Video" : "Image"} · {item.size ? prettySize(item.size) : "Saved"}</span></button>
                        <button onClick={() => void deleteFile(item.id)} className="grid h-8 w-8 place-items-center rounded-full text-white/35 hover:bg-rose-400/10 hover:text-rose-200" aria-label={`Remove ${item.name}`}><X size={15} /></button>
                      </div>
                    );
                  })}
                  {!audioItems.length && !allVideoItems.length && !uploadedMedia.some(item => item.type.startsWith("image/")) && <div className="rounded-2xl border border-dashed border-white/10 px-4 py-7 text-center"><Files size={22} className="mx-auto text-white/25" /><p className="mt-2 text-xs text-white/55">No personal files yet</p><p className="mt-1 text-[10px] text-white/30">Add audio, images, or a small video from your device.</p></div>}
                </div>
              </div>
            )}

            {app === "player" && preview && (
              <div className="flex min-h-full flex-col p-4 pb-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{preview.name}</h2><p className="mt-1 text-[10px] text-white/40">{preview.size ? prettySize(preview.size) : "Portfolio media"}</p></div>
                  <a href={preview.src} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white" aria-label="Open media separately"><ExternalLink size={15} /></a>
                </div>
                <div className="grid min-h-[16rem] flex-1 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  {preview.type.startsWith("image/") ? <img src={preview.src} alt={preview.name} className="max-h-full max-w-full object-contain" /> : null}
                  {preview.type.startsWith("video/") ? <video key={preview.src} src={preview.src} poster={preview.poster} controls playsInline className="max-h-full max-w-full" /> : null}
                  {preview.type.startsWith("audio/") ? <div className="w-full px-5 text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-fuchsia-400/15 text-fuchsia-200"><Music2 size={34} /></span><audio key={preview.src} src={preview.src} controls className="mt-7 w-full" /></div> : null}
                  {!preview.type.startsWith("image/") && !preview.type.startsWith("video/") && !preview.type.startsWith("audio/") && <p className="p-5 text-center text-xs text-white/50">This file type can be opened in a separate tab.</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex h-7 shrink-0 items-center justify-center bg-[#0b101b]">
            <button onClick={() => { setApp("home"); setPreview(null); }} className="h-1 w-24 rounded-full bg-white/45" aria-label="Return to phone home" />
          </div>
          {notice && <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#151c29]/95 px-3 py-2 text-[10px] text-white shadow-xl"><Check size={13} className="text-emerald-300" />{notice}</div>}
        </div>
      </div>
    </div>
  );
};

export default PhoneExperience;
