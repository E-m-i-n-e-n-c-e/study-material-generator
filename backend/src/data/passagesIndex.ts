import easy01 from './passages/easy-01-supply-demand.json';
import easy02 from './passages/easy-02-photosynthesis.json';
import easy03 from './passages/easy-03-renewable-energy.json';
import easy04 from './passages/easy-04-solar-system.json';
import easy05 from './passages/easy-05-programming-intro.json';
import medium01 from './passages/medium-01-black-holes.json';
import medium02 from './passages/medium-02-internet-history.json';
import medium03 from './passages/medium-03-market-competition.json';
import medium04 from './passages/medium-04-ecosystems.json';
import hard01 from './passages/hard-01-quantum-computing.json';
import hard02 from './passages/hard-02-behavioral-economics.json';
import hard03 from './passages/hard-03-crispr-technology.json';
import hard04 from './passages/hard-04-quantum-mechanics.json';
import { getModuleById } from './modules';

export interface Question {
  id: string;
  stem: string;
  options: string[];
  answer: string;
}

export interface Passage {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  wordCount: number;
  idealWPM: number;
  estimatedReadingTime: number;
  questions: Question[];
}

export const passages: Passage[] = [
  easy01,
  easy02,
  easy03,
  easy04,
  easy05,
  medium01,
  medium02,
  medium03,
  medium04,
  hard01,
  hard02,
  hard03,
  hard04
] as Passage[];

export const getPassageById = (id: string): Passage | undefined => {
  return passages.find(p => p.id === id);
};

export const getPassagesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): Passage[] => {
  return passages.filter(p => p.difficulty === difficulty);
};

export const getPassagesByCategory = (category: string): Passage[] => {
  return passages.filter(p => p.category.toLowerCase() === category.toLowerCase());
};

export const getRandomPassage = (difficulty?: 'easy' | 'medium' | 'hard'): Passage => {
  const pool = difficulty ? getPassagesByDifficulty(difficulty) : passages;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

export const getPassageByModuleAndDifficulty = (
  moduleId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Passage | null => {
  const module = getModuleById(moduleId);

  if (!module) {
    return null;
  }

  // Check if the module has the requested difficulty
  if (!module.difficulties.includes(difficulty)) {
    return null;
  }

  // Filter passages that belong to this module and match the difficulty
  const matchingPassages = passages.filter(
    p => module.passageIds.includes(p.id) && p.difficulty === difficulty
  );

  if (matchingPassages.length === 0) {
    return null;
  }

  // Return random passage from matching set
  const randomIndex = Math.floor(Math.random() * matchingPassages.length);
  return matchingPassages[randomIndex];
};
