/**
 * Utilities for RSVP (Rapid Serial Visual Presentation) speed reading
 */

export interface RSVPWord {
  word: string;
  index: number;
  isLastInSentence: boolean;
  isPunctuation: boolean;
}

/**
 * Parse text into individual words for RSVP display
 */
export function parseTextToWords(text: string): RSVPWord[] {
  // Split by whitespace while preserving sentence structure
  const words: RSVPWord[] = [];
  const tokens = text.split(/\s+/).filter(w => w.length > 0);

  tokens.forEach((token, index) => {
    // Check if this word ends a sentence
    const isLastInSentence = /[.!?]$/.test(token);

    // Check if it's just punctuation
    const isPunctuation = /^[.,;:!?()"-]+$/.test(token);

    words.push({
      word: token,
      index,
      isLastInSentence,
      isPunctuation,
    });
  });

  return words;
}

/**
 * Calculate optimal reading position (ORP) for a word
 * The ORP is usually slightly left of center for better recognition
 */
export function getOptimalReadingPosition(word: string): number {
  const length = word.length;

  if (length === 1) return 0;
  if (length <= 5) return Math.floor(length / 2);
  if (length <= 9) return Math.floor(length * 0.4);
  return Math.floor(length * 0.35);
}

/**
 * Calculate the delay for a word based on its characteristics
 * @param baseWPM - The target words per minute
 * @param word - The RSVPWord to calculate delay for
 * @returns delay in milliseconds
 */
export function calculateWordDelay(baseWPM: number, word: RSVPWord): number {
  // Base delay from WPM
  const baseDelay = (60 * 1000) / baseWPM;

  let multiplier = 1.0;

  // Longer words need more time
  if (word.word.length > 8) multiplier += 0.3;
  else if (word.word.length > 12) multiplier += 0.5;

  // Sentence endings need a pause
  if (word.isLastInSentence) multiplier += 0.5;

  // Punctuation gets less time
  if (word.isPunctuation) multiplier = 0.5;

  return Math.round(baseDelay * multiplier);
}

/**
 * Split word into parts based on ORP for highlighting
 */
export interface WordParts {
  before: string;
  focus: string;
  after: string;
}

export function splitWordAtORP(word: string): WordParts {
  const orp = getOptimalReadingPosition(word);

  return {
    before: word.slice(0, orp),
    focus: word[orp] || '',
    after: word.slice(orp + 1),
  };
}

/**
 * RSVP Reader Controller
 */
export class RSVPController {
  private words: RSVPWord[];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private timeoutId: number | null = null;
  private baseWPM: number;
  private onWordChange?: (word: RSVPWord, index: number, total: number) => void;
  private onComplete?: () => void;
  private onPlayStateChange?: (isPlaying: boolean) => void;

  constructor(
    text: string,
    wpm: number,
    callbacks?: {
      onWordChange?: (word: RSVPWord, index: number, total: number) => void;
      onComplete?: () => void;
      onPlayStateChange?: (isPlaying: boolean) => void;
    }
  ) {
    this.words = parseTextToWords(text);
    this.baseWPM = wpm;
    this.onWordChange = callbacks?.onWordChange;
    this.onComplete = callbacks?.onComplete;
    this.onPlayStateChange = callbacks?.onPlayStateChange;
  }

  start(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.onPlayStateChange?.(true);
    this.showNextWord();
  }

  pause(): void {
    if (!this.isPlaying) return;

    this.isPaused = true;
    this.isPlaying = false;

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.onPlayStateChange?.(false);
  }

  resume(): void {
    if (this.isPlaying || !this.isPaused) return;

    this.isPaused = false;
    this.isPlaying = true;
    this.onPlayStateChange?.(true);
    this.showNextWord();
  }

  stop(): void {
    this.pause();
    this.currentIndex = 0;
    this.isPaused = false;
  }

  setSpeed(wpm: number): void {
    this.baseWPM = wpm;
  }

  getProgress(): number {
    if (this.words.length === 0) return 0;
    return (this.currentIndex / this.words.length) * 100;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTotalWords(): number {
    return this.words.length;
  }

  isRunning(): boolean {
    return this.isPlaying;
  }

  private showNextWord(): void {
    if (this.currentIndex >= this.words.length) {
      this.isPlaying = false;
      this.isPaused = false;
      this.onPlayStateChange?.(false);
      this.onComplete?.();
      return;
    }

    const word = this.words[this.currentIndex];
    this.onWordChange?.(word, this.currentIndex, this.words.length);

    const delay = calculateWordDelay(this.baseWPM, word);

    this.currentIndex++;

    this.timeoutId = window.setTimeout(() => {
      if (this.isPlaying) {
        this.showNextWord();
      }
    }, delay);
  }
}
