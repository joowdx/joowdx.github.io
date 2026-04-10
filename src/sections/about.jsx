import Joowd from '@/assets/joowd.webp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { links } from '@/config/socials';
import { cn } from '@/lib/utils';

const About = () => {
  return (
    <section id="about" className="relative px-6 py-20">
      <div className="mx-auto max-w-screen-md">
        <div className="flex flex-col gap-12 md:flex-row-reverse">
          <ProfileImage className="hidden md:block" />

          <div className="flex-1 md:text-left">
            <Badge variant="secondary" className="mb-4">
              About Me
            </Badge>
            <ProfileImage className="mb-8 mt-3 block md:hidden" />
            <h2 className="mb-4 text-4xl font-bold tracking-tight">Passionate about creating impactful web experiences</h2>
            <p className="text-muted-foreground mb-6 text-justify">
              With over 5 years of experience in full-stack development, I specialize in building scalable web applications using modern technologies.
              My expertise includes PHP, Laravel, and cloud architecture. I&apos;m passionate about creating elegant solutions to complex problems and
              sharing knowledge with the developer community.
            </p>
            <div className="flex flex-wrap justify-start gap-4">
              <Button asChild className="rounded-full">
                <a href={links.github.url} target="_blank">
                  <links.github.icon />
                  Github
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProfileImage = ({ className, ...props }) => (
  <div className={cn('mt-10 h-48 w-48 md:h-64 md:w-64', className)} {...props}>
    <div className="bg-accent group relative h-full w-full overflow-hidden rounded-2xl">
      <img src={Joowd} alt="joowd" className="h-full w-full object-cover grayscale transition-all duration-300 ease-in-out group-hover:grayscale-0" />
    </div>
  </div>
);

export default About;
