import { Separator } from '@/components/ui/separator';
import { links } from '@/config/socials';

const Footer = () => {
  return (
    <footer className="mt-20">
      <div className="mx-auto max-w-screen-md">
        <div className="flex flex-col items-center justify-start py-12">
          <ul className="mt-6 flex flex-wrap items-center gap-4">
            {Object.values(links).map(({ name, url }) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Separator />
        <div className="flex flex-col-reverse items-center justify-between gap-x-2 gap-y-5 px-6 py-6 sm:flex-row xl:px-0">
          <span className="text-muted-foreground">&copy; {new Date().getFullYear()} Joowd. All rights reserved.</span>

          <div className="text-muted-foreground flex items-center gap-5">
            {Object.values(links).map(({ name, url, icon: Icon }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
