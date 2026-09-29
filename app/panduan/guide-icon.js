export default function GuideIcon({ name, ...props }) {
  const paths = {
    compass: <><circle cx="12" cy="12" r="9" /><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5" /></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4m-4-11 3 3 5-5" /></>,
    key: <><circle cx="8" cy="8" r="5" /><path d="m12 12 9 9m-3-3 3-3m-6 0 3-3" /></>,
    lifebuoy: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m6 6 3 3m6 6 3 3M6 18l3-3m6-6 3-3" /></>,
    book: <><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chat: <path d="M21 11a9 9 0 0 1-9 9c-1.5 0-3-.4-4-1l-5 2 1-5a9 9 0 1 1 17-5Z" />,
  };
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.book}</svg>;
}
