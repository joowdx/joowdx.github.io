import clockwork from '../assets/clockwork.webp';
import helpdesk from '../assets/helpdesk.webp';

export const projects = [
  {
    title: 'Helpdesk',
    description: 'A helpdesk system for managing support tickets and user requests, built for internal use in a government agency.',
    image: { src: helpdesk, alt: 'Helpdesk landing page screenshot', width: 400, height: 1274 },
    technologies: ['PHP', 'Laravel', 'Livewire', 'Filament', 'MySQL'],
    url: 'https://helpdesk.davaodelsur.gov.ph',
  },
  {
    title: 'Clockwork',
    description: 'A time tracking tool for monitoring productivity and managing work hours, built for internal use in a government agency.',
    image: { src: clockwork, alt: 'Clockwork landing page screenshot', width: 400, height: 769 },
    technologies: ['PHP', 'Python', 'Laravel', 'Livewire', 'Filament', 'PostgreSQL', 'Puppeteer'],
    url: 'https://clockwork.davaodelsur.gov.ph',
  },
  {
    title: 'School Attendance Monitoring System',
    description:
      'A fully functional prototype for tracking student and faculty attendance, with an interactive real-time map that highlights classroom activity across the campus.',
    technologies: ['PHP', 'Laravel', 'MySQL', 'Websockets'],
    source: 'https://github.com/joowdx/sams',
    year: 2020,
    kind: 'capstone project',
  },
  {
    title: 'Pageant Scoring and Tabulation System',
    description:
      'Real-time pageant scoring and tabulation designed for speed, accuracy, and transparency. It streamlines scoring and eliminates manual computation delays.',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Shadcn UI'],
    source: 'https://github.com/joowdx/xpts',
    year: 2019,
    kind: 'side project',
  },
];
