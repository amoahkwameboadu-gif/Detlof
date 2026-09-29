// Detlof Preparatory School — shared SVG icon set.
// Solid, 2px-weight glyphs drawn on a 24x24 grid so headings read clearly at a
// glance. Referenced by both portals: <svg class="icon" viewBox="0 0 24 24">
//   <path fill="currentColor" d="..."/></svg>
const DETLOF_ICONS = {
  dashboard: "M3 12l9-8 9 8v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8z",
  results: "M4 19h16v2H4v-2zM6 10h3v7H6v-7zm5 0h3v7h-3v-7zm5-4h3v11h-3V6z",
  timetable: "M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 8v9H5v-9h14z",
  profile: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5z",
  bills: "M4 2h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm2 4v2h12V6H6zm0 4v2h12v-2H6zm0 4v2h8v-2H6z",
  announcement: "M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z",
  login: "M10 17l5-5-5-5v3H3v4h7v3zm9-15h-8v2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H11v2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",
  shield: "M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm-1 13l5-5-1.4-1.4L11 12.2 9.4 10.6 8 12l3 3z",
  lock: "M12 2a5 5 0 0 0-5 5v2H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9z",
  users: "M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-3.31 0-6 1.79-6 4v2h12v-2c0-2.21-2.69-4-6-4zm8.5-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm.5 2c-.7 0-1.36.1-2 .27 1.24.9 2 2.2 2 3.73V20h6v-2c0-2.21-2.69-4-6-4z",
  graduation: "M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z",
  upload: "M12 3l5 5h-3v6h-4V8H7l5-5zM4 17h2v2h12v-2h2v4H4v-4z",
  download: "M12 16l-5-5h3V5h4v6h3l-5 5zM4 18h2v2h12v-2h2v4H4v-4z",
  phone: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.58 3.6a1 1 0 0 1-.25 1l-2.23 2.2z",
  // A filled chat bubble with three dots: reads as a message at 18px and stays
  // comfortably inside the 24x24 grid.
  whatsapp: "M12 3C6.48 3 2 7.03 2 12c0 2.4 1 4.6 2.7 6.2L3 21l3-1.6A8.9 8.9 0 0 0 12 21c5.52 0 10-4.03 10-9S17.52 3 12 3zM8 10.4a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zm4 0a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zm4 0a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z",
  sms: "M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 9h10v2H7V9zm6 5H7v-2h6v2zm4-6H7V6h10v2z",
  receipt: "M4 2h16v20l-3-2-3 2-3-2-3 2V2zm3 4v2h10V6H7zm0 4v2h10v-2H7zm0 4v2h7v-2H7z",
  check: "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
  warning: "M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z",
  refresh: "M17.65 6.35A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.76-4.24L13 11h8V3l-3.35 3.35z",
  camera: "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 3L7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  home: "M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11h-5v-2h3V6h2v7z",
  chart: "M4 20h16v2H2V2h2v18zm3-3V10h2v7H7zm4 0V6h2v11h-2zm4 0v-4h2v4h-2z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z",
  search: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
  plus: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z",
  trash: "M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  key: "M12.65 10A6 6 0 0 0 7 6a6 6 0 1 0 4.65 10H13l2 2h2v2h2v-2h2v-2h-2v-2h-6.35A6 6 0 0 0 12.65 10zM7 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z",
  list: "M3 5h2v2H3V5zm4 0h14v2H7V5zM3 11h2v2H3v-2zm4 0h14v2H7v-2zm-4 6h2v2H3v-2zm4 0h14v2H7v-2z",
  calendar: "M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 18H5V10h14v10zM5 8V6h14v2H5z",
  book: "M4 3h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h5a4 4 0 0 1 2 1 4 4 0 0 1 2-1h5V5h-5a3 3 0 0 0-2 1 3 3 0 0 0-2-1H5z",
};

function detlofIcon(name, extraClass) {
  const path = DETLOF_ICONS[name] || DETLOF_ICONS.dashboard;
  return '<svg class="icon ' + (extraClass || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + path + '"/></svg>';
}
