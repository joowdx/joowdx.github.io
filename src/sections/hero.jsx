import AnimatedGridPattern from '@/components/ui/animated-grid-pattern';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CircleArrowDown, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-6">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        className={cn('[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]', 'inset-x-0 h-full skew-y-12')}
      />
      <div className="relative z-[1] max-w-screen-md text-center">
        <Badge className="rounded-full border-none">
          <Zap className="fill-current" />
          Fullstack Web Developer
        </Badge>
        <h1 className="mt-6 text-4xl font-bold !leading-[1.2] tracking-tight sm:text-5xl md:text-6xl">Scalable Web Solutions, Built to Last</h1>
        <p className="mt-6 text-[17px] md:text-lg">
          I&apos;m a Full Stack Developer specializing in scalable, high-performance web applications. With expertise in creating intuitive frontends
          and engineering robust backends, I deliver clean code, efficient architecture, and exceptional user experiences. Let&apos;s build something
          remarkable. 🚀
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <a href="#about">
            <Button asChild size="lg">
              <div className="rounded-full text-base">
                See What I Do <CircleArrowDown className="!h-5.5 !w-5.5 ml-2" />
              </div>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
