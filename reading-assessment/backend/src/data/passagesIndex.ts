import easy01 from './passages/easy-01-supply-demand.json';
import easy02 from './passages/easy-02-photosynthesis.json';
import easy03 from './passages/easy-03-renewable-energy.json';
import medium01 from './passages/medium-01-black-holes.json';
import medium02 from './passages/medium-02-internet-history.json';
import hard01 from './passages/hard-01-quantum-computing.json';

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
  medium01,
  medium02,
  hard01
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
