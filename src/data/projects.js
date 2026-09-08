import clockwork from '../assets/clockwork.webp';
import helpdesk from '../assets/helpdesk.webp';

/**
 * `image` gives a screenshot card, `source` a repo card; `url` adds a live/offline badge.
 * `earlier: true` moves a project into the compact "Earlier work" list under the main grid.
 */
export const projects = [
  {
    title: 'Helpdesk',
    description:
      'Ticketing for the Provincial Government of Davao del Sur. Offices of the provincial government file support requests into one queue, and the support team triages, assigns and resolves them with the full history kept. Shipped during my time there and still running.',
    image: { src: helpdesk, alt: 'Helpdesk landing page screenshot', width: 400, height: 1274 },
    technologies: ['PHP', 'Laravel', 'Livewire', 'Filament', 'MySQL'],
    url: 'https://helpdesk.davaodelsur.gov.ph',
  },
  {
    title: 'Clockwork',
    description:
      'Timekeeping for the same provincial government. It records attendance and work hours for employees and turns them into the time records offices submit each cutoff, so nobody tallies logs by hand. Still running.',
    image: { src: clockwork, alt: 'Clockwork landing page screenshot', width: 400, height: 769 },
    technologies: ['PHP', 'Python', 'Laravel', 'Livewire', 'Filament', 'PostgreSQL', 'Puppeteer'],
    url: 'https://clockwork.davaodelsur.gov.ph',
  },
  {
    title: 'This site',
    description:
      'The page you are on. A procedurally built calico cat with IK legs and a simulated tail, looping ollies through a night city in Three.js. No framework underneath: Vite, plain modules and CSS.',
    technologies: ['Three.js', 'JavaScript', 'CSS', 'Vite'],
    source: 'https://github.com/joowdx/joowdx.github.io',
    year: 2026,
    kind: 'this site',
  },
  {
    title: 'School Attendance Monitoring System',
    description: 'Attendance tracking for students and faculty, with a live campus map that lights up classrooms as people check in.',
    technologies: ['PHP', 'Laravel', 'MySQL', 'Websockets'],
    source: 'https://github.com/joowdx/sams',
    year: 2020,
    kind: 'capstone project',
    earlier: true,
  },
  {
    title: 'Pageant Scoring and Tabulation System',
    description: 'Real-time scoring and tabulation for pageants, built so results are ready the moment the last judge submits.',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Shadcn UI'],
    source: 'https://github.com/joowdx/xpts',
    year: 2019,
    kind: 'side project',
    earlier: true,
  },
];
