import clockwork from '@/assets/clockwork.webp';
import helpdesk from '@/assets/helpdesk.webp';
import placeholder from '@/assets/placeholder.svg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

const useUrlStatus = (url) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!url) {
      setStatus('offline');
      return;
    }

    const checkUrl = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setStatus('online');
      } catch (error) {
        const img = new Image();
        img.onload = () => setStatus('online');
        img.onerror = () => {
          const favicon = new Image();
          favicon.onload = () => setStatus('online');
          favicon.onerror = () => setStatus('offline');
          favicon.src = `${url}/favicon.ico`;
        };

        try {
          const domain = new URL(url).origin;
          img.src = `${domain}/favicon.ico`;
        } catch {
          setStatus('offline');
        }
      }
    };

    checkUrl();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkUrl();
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [url]);

  return status;
};

const ProjectCard = ({ title, description, image, technologies, url, source, year }) => {
  const status = useUrlStatus(url);

  return (
    <div className="border-accent hover:border-primary/50 group relative flex flex-col overflow-hidden rounded-xl border transition-all">
      <div className="relative aspect-square h-64 w-full">
        {image ? (
          <img
            src={image}
            alt={title}
            className="object-cover object-top grayscale transition-all duration-1000 ease-in-out group-hover:object-bottom group-hover:grayscale-0"
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              color: 'transparent',
            }}
          />
        ) : (
          <img
            src={placeholder}
            alt={title}
            className="group-hover:scale-120 object-cover object-center transition-transform duration-300"
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              color: 'transparent',
            }}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="-mt-1 mb-2 italic">{year}</p>
        <p className="text-muted-foreground mb-4">{description}</p>

        <div className="mb-6 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="rounded-full">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex gap-3">
          {url && (
            <div className="flex items-center gap-2">
              <Button variant="default" className="rounded-full" asChild={status === 'online'} disabled={status !== 'online'}>
                {status === 'online' ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Live
                  </a>
                ) : (
                  <>
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Down
                  </>
                )}
              </Button>
              {status === 'online' && (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                </div>
              )}
              {status === 'offline' && (
                <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              )}
              {status === 'checking' && (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
                </div>
              )}
            </div>
          )}
          {source && (
            <Button variant="outline" className="rounded-full shadow-none" asChild>
              <a href={source} target="_blank" rel="noopener noreferrer">
                <SiGithub className="mr-1 h-4 w-4" />
                Source
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const projects = [
    {
      title: 'Helpdesk',
      description: 'A helpdesk system for managing support tickets and user requests for internal use in a government agency.',
      image: helpdesk,
      technologies: ['PHP', 'Laravel', 'Livewire', 'Filament', 'MySQL'],
      url: 'https://helpdesk.davaodelsur.gov.ph',
    },
    {
      title: 'Clockwork',
      description: 'A time tracking tool for monitoring productivity and managing work hours for internal use in a government agency.',
      image: clockwork,
      technologies: ['PHP', 'Python', 'Laravel', 'Livewire', 'Filament', 'PostgreSQL', 'Puppeteer'],
      url: 'https://clockwork.davaodelsur.gov.ph',
    },
    {
      title: 'School Attendance Monitoring System',
      description:
        'A capstone project featuring a fully functional prototype for tracking student and faculty attendance, with an interactive real-time map that visually highlights classroom activity across the campus.',
      technologies: ['PHP', 'Laravel', 'MySQL', 'Websockets'],
      source: 'https://github.com/joowdx/sams',
      year: 2020,
    },
    {
      title: 'Pageant Scoring and Tabulation System',
      description:
        'A side project for real-time pageant scoring and tabulation which is designed for speed, accuracy, and transparency, it streamlines the scoring process and eliminates manual computation delays.',
      technologies: ['React', 'Next.js', 'Tailwind CSS', 'Shadcn UI'],
      source: 'https://github.com/joowdx/xpts',
      year: 2019,
    },
  ];

  return (
    <section id="projects" className="relative px-6 py-20">
      <div className="mx-auto max-w-screen-md">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            Projects
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Featured Work</h2>
          <p className="text-muted-foreground mt-2 text-lg sm:mt-4">Showcasing some of my best projects and technical achievements</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
