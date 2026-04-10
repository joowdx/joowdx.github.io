import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { links } from '@/config/socials';
import { SiGithub } from '@icons-pack/react-simple-icons';

const getGithubUsername = () => {
  try {
    const parts = links.github.url.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'joowdx';
  } catch {
    return 'joowdx';
  }
};

const Contributions = () => {
  const username = getGithubUsername();

  return (
    <section id="contributions" className="relative px-6 py-20">
      <div className="mx-auto max-w-screen-md">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            Contributions
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Github Contributions</h2>
          <p className="text-muted-foreground mt-2 text-lg sm:mt-4">Recent GitHub contribution activity</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="mx-auto w-full max-w-screen-md overflow-clip rounded-xl border p-4">
            <img
              src={`https://ghchart.rshah.org/${username}`}
              alt={`${username} GitHub activity graph`}
              className="w-full origin-center rounded-xl border-none grayscale transition-all duration-300 ease-in-out hover:grayscale-0"
              loading="lazy"
            />
          </div>

          <div className="mx-auto w-full max-w-screen-md overflow-clip rounded-xl border">
            <img
              src={`https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=github-compact&radius=8&area=true&hide_border=true`}
              alt={`${username} GitHub activity graph`}
              className="w-full origin-center rounded-xl border-0 grayscale transition-all duration-300 ease-in-out hover:grayscale-0"
              loading="lazy"
            />
          </div>

          <div className="mx-auto w-full max-w-screen-md overflow-clip rounded-xl border">
            <img
              src={`https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${username}&theme=github_dark`}
              alt={`${username} GitHub activity graph`}
              className="w-full origin-center scale-[103.5%] rounded-xl grayscale transition-all duration-300 ease-in-out hover:grayscale-0"
              loading="lazy"
            />
          </div>

          <Button asChild className="rounded-full">
            <a href={links.github.url} target="_blank" rel="noopener noreferrer">
              <SiGithub />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Contributions;
