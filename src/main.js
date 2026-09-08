import './styles.css';
import { startScene } from './scene/index.js';
import { renderCapabilities } from './sections/capabilities.js';
import { renderExperience } from './sections/experience.js';
import { renderProjects } from './sections/projects.js';
import { initPage } from './ui/page.js';
import { watchStatuses } from './ui/status.js';

// content lists come from src/data; render them before the reveal observer looks for .reveal nodes
renderCapabilities(document.getElementById('cap-grid'));
renderExperience(document.getElementById('xp-list'));
renderProjects(document.getElementById('proj-grid'));

initPage();
watchStatuses();

startScene({
  hero: document.getElementById('hero'),
  canvas: document.getElementById('stage'),
  hint: document.querySelector('#hint span'),
});
