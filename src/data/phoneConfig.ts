import profileData from "./profile.json";

// Edit these records to customize the interactive Z7X phone.
export const PHONE_MESSAGES = [
  {
    id: "welcome",
    sender: "ZYNX",
    time: "Pinned",
    text: "Thanks for visiting my room. For a project or collaboration, send me a message anytime.",
  },
];

export const PHONE_NOTIFICATIONS = [
  {
    id: "portfolio",
    app: "Z7X Studio",
    time: "Just now",
    text: "Room tour ready — explore the desk, studio, and gallery.",
  },
];

// Keep social destinations here so every phone icon points to the right profile.
export const PHONE_SOCIAL_LINKS = {
  instagram: "https://instagram.com/7osh___",
  instagramProducer: "https://instagram.com/7ynx777",
  // Replace this with the direct Facebook profile URL whenever you're ready.
  facebook: "https://www.facebook.com/",
  youtube: "https://www.youtube.com/channel/UCGbYqMWOA_isZwyrhRdC1dg",
  github: profileData.basics.profiles.github,
  linkedin: profileData.basics.profiles.linkedin,
};

// Add or edit entries for public media stored under public/.
export const PHONE_AUDIO_FILES = [
  { id: "lofi-study", name: "Lofi Study", src: "/music/lofi-study.mp3", type: "audio/mpeg" },
  { id: "regardless", name: "Regardless", src: "/music/Regardless.mp3", type: "audio/mpeg" },
];

// Add videos here to show them in both the Gallery and Files apps.
// Place each media file under public/ and use its public URL as `src`.
export const PHONE_VIDEO_FILES = [
  {
    id: "nebula-drift-4k",
    name: "Nebula Drift · 4K",
    src: "/videos/z7x-nebula-drift-4k.mp4",
    type: "video/mp4",
    poster: "/images/phone/z7x-nebula-drift-poster.jpg",
  },
];

export const PHONE_GALLERY_IMAGES = [
  { id: "anime-moon", name: "Anime Moonlight", src: "/images/gallery/anime-moon-landscape.jpg" },
  { id: "samurai-rain", name: "Rain Bridge", src: "/images/gallery/samurai-woman-bridge-rain.jpg" },
  { id: "lofi-study", name: "Lofi Study", src: "/images/ambient/lofi-study-night.jpg" },
  { id: "cosmic-stars", name: "Cosmic Stars", src: "/images/space/cosmic-stars-4k.jpg" },
  { id: "winter-village", name: "Winter Village", src: "/images/gallery/winter-evening-japanese-village.jpg" },
  { id: "studio", name: "Bedroom Studio", src: "/images/projects/lofi-bedroom.jpg" },
];

export const PHONE_CONTACT = {
  name: "ZYNX",
  phone: profileData.basics.phone,
  email: profileData.basics.email,
  whatsapp: profileData.basics.profiles.whatsapp,
  messageDraft: "Hi ZYNX, I saw your portfolio and would like to connect.",
};
