import { useState } from 'react';
import About from './sections/about';
import Contributions from './sections/contributions';
import Experience from './sections/experience';
import Hero from './sections/hero';
import Projects from './sections/projects';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-10 sm:space-y-16">
      <Hero />
      <About />
      <Contributions />
      <Experience />
      <Projects />
    </div>
  );
}

export default App;
