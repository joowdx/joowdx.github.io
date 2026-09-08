// Icons are 24x24 stroke paths; `pathLength="1"` lets the CSS draw them in on reveal.
export const capabilities = [
  {
    title: 'Frontend',
    lead: 'Interfaces people actually enjoy using.',
    body: 'Component-driven UIs with sensible state, fast first paint, and motion that explains rather than decorates.',
    tags: ['React', 'Vue', 'Next.js', 'Livewire', 'Filament', 'Tailwind CSS'],
    icon: '<rect x="3" y="4" width="18" height="15" rx="3" pathLength="1"/><path d="M3 9h18" pathLength="1"/><path d="M6 6.5h.01M8.5 6.5h.01" pathLength="1"/><path d="M11 12l6 2.4-2.6 1-1 2.6z" pathLength="1"/>',
  },
  {
    title: 'Backend',
    lead: 'Services that hold up under real traffic.',
    body: 'Clean domain logic, well-shaped APIs, background jobs and realtime where it matters.',
    tags: ['PHP', 'Laravel', 'Python', 'FastAPI', 'WebSockets'],
    icon: '<rect x="3" y="3.5" width="18" height="5" rx="1.6" pathLength="1"/><rect x="3" y="10" width="18" height="5" rx="1.6" pathLength="1"/><rect x="3" y="16.5" width="18" height="4" rx="1.6" pathLength="1"/><path d="M6.5 6h.01M6.5 12.5h.01M6.5 18.5h.01" pathLength="1"/>',
  },
  {
    title: 'Data & infra',
    lead: 'Boring, reliable plumbing.',
    body: 'Schemas that stay sane, caching where it pays off, containers and cloud setups that deploy the same way every time.',
    tags: ['PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Google Cloud', 'Azure', 'Ubuntu'],
    icon: '<ellipse cx="12" cy="6" rx="8" ry="3" pathLength="1"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" pathLength="1"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" pathLength="1"/>',
  },
  {
    title: 'AI integration',
    lead: 'LLMs where they earn their keep.',
    body: 'Structured extraction from messy documents, model orchestration, and async pipelines that keep the rest of the system honest.',
    tags: ['OpenAI', 'Gemini', 'Pub/Sub', 'Firebase'],
    icon: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" pathLength="1"/><circle cx="19" cy="18.5" r="1.6" pathLength="1"/><path d="M4.5 19.5h.01" pathLength="1"/>',
  },
];
