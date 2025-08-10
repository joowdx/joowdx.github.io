import { Badge } from '@/components/ui/badge';
import { Building2, Calendar } from 'lucide-react';

const ExperienceItem = ({ title, company, period, description, technologies }) => {
  return (
    <div className="not-last:pb-12 relative pl-8">
      {/* Timeline line */}
      <div className="bg-muted absolute left-0 top-2.5 h-full w-[2px] group-first:top-6 group-first:h-[calc(100%-24px)]">
        <div className="border-primary bg-background absolute -left-[5px] top-0 h-3 w-3 rounded-full border-2" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="bg-accent flex size-9 flex-shrink-0 items-center justify-center rounded-full">
            <Building2 className="text-muted-foreground size-5" />
          </div>
          <span className="text-lg font-semibold">{company}</span>
        </div>
        <div>
          <h3 className="text-xl font-medium">{title}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <Calendar className="size-4" />
            <span>{period}</span>
          </div>
        </div>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="rounded-full">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

const Experience = () => {
  const experiences = [
    {
      title: 'Information System Developer',
      company: 'Provincial Government of Davao del Sur',
      period: '2021 - Present',
      description:
        'Developed and maintained various internal applications, focusing on user experience and performance. Utilized modern frameworks and technologies to deliver high-quality software solutions.',
      technologies: [
        'PHP',
        'JavaScript',
        'Laravel',
        'Livewire',
        'Filament',
        'Vue',
        'React',
        'MySQL',
        'PostgreSQL',
        'Redis',
        'Docker',
        'Ubuntu',
        'Azure',
      ],
    },
    {
      title: 'Full Stack Developer',
      company: 'Digos Water District',
      period: '2020 - 2021',
      description: 'Created and maintained web applications, ensuring optimal performance and user experience.',
      technologies: ['PHP', 'Laravel', 'Livewire', 'PostgreSQL'],
    },
  ];

  return (
    <section id="experience" className="relative px-6 py-20">
      <div className="mx-auto max-w-screen-md">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            Experience
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Professional Journey</h2>
          <p className="text-muted-foreground mt-2 text-lg sm:mt-4">A timeline of my professional growth and key achievements</p>
        </div>

        <div className="relative">
          {experiences.map((experience, index) => (
            <ExperienceItem key={index} {...experience} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
