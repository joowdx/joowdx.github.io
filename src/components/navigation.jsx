import { Button } from '@/components/ui/button';
import { NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenu as UINavMenu } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { links } from '@/config/socials';
import { cn } from '@/lib/utils';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu } from 'lucide-react';
import Logo from './logo';

const NavigationMenu = ({ className, ...props }) => (
  <UINavMenu className={cn('data-[orientation=vertical]:items-start', className)} {...props}>
    <NavigationMenuList className="gap-1 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <a href="#about">About</a>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <a href="#contributions">Contributions</a>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <a href="#experience">Experience</a>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <a href="#projects">Projects</a>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </UINavMenu>
);

const NavigationSheet = () => (
  <Sheet>
    <VisuallyHidden>
      <DialogTitle>Menu</DialogTitle>
      <DialogDescription>Navigation menu</DialogDescription>
    </VisuallyHidden>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="rounded-full">
        <Menu />
      </Button>
    </SheetTrigger>
    <SheetContent className="px-6 pt-3">
      <Logo />
      <NavigationMenu orientation="vertical" className="mt-12" />
    </SheetContent>
  </Sheet>
);

export default function () {
  return (
    <nav className="bg-background fixed inset-x-4 top-6 z-10 mx-auto h-14 max-w-screen-md rounded-full border dark:border-slate-700/70">
      <div className="mx-auto flex h-full items-center justify-between px-3">
        <div className="px-2">
          <Logo />
        </div>

        <NavigationMenu className="hidden md:block" />

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-full shadow-none" size="icon">
            <a href={links.github.url} target="_blank">
              <links.github.icon className="h-5! w-5!" />
            </a>
          </Button>

          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
}
