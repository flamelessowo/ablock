import React from 'react';
import ReactDOM from 'react-dom';
import SmallCard from './cards/SmallCard';
import { levenshtein, russian_propaganda_keywords } from './levenstein';

enum BlockingStrategy {
  LEVENSHTEIN,
  ML
}

const BLOCKING_STRATEGY = BlockingStrategy.LEVENSHTEIN;

let vocabulary: { [key: string]: number } = {};

export function setVocabulary(vocab: { [key: string]: number }) {
  vocabulary = vocab;
}

function containsCyrillic(text: string): boolean {
  return /[ыъёэ]/i.test(text);
}

// Tokenizer and padding functions
function getTokenizer() {
  return {
    textsToSequences: function(texts: string[]) {
      return texts.map(text => {
        return text.toLowerCase().split(' ').map(word => wordToIndex(word));
      });
    }
  };
}

function padSequences(sequences: number[][], maxLen: number) {
  return sequences.map(seq => {
    if (seq.length > maxLen) {
      return seq.slice(0, maxLen);
    } else {
      return [...seq, ...Array(maxLen - seq.length).fill(0)];
    }
  });
}

function wordToIndex(word: string): number {
  return vocabulary[word] || 0;  // 0 for unknown words
}

function containsSimilarKeyword(text: string, keywords: string[] = russian_propaganda_keywords, threshold: number = 2): boolean {
  for (const keyword of keywords) {
    if (levenshtein(text, keyword) <= threshold) {
      return true;
    }
  }
  return false;
}

function predictUsginLevenshtein(text: string): boolean {
  const words = text.split(' ');
  if (containsCyrillic(text)) {
    return true;
  }
  for (const word of words) {
    if (containsSimilarKeyword(word)) {
      return true;
    }
  }
  return false;
}

async function predictUsingModel(text: string): Promise<boolean> {
  const tf = (window as any).tf;
  const model = (window as any).tfModel;
  if (!tf || !model) {
    throw new Error('TensorFlow.js or model not loaded');
  }

  const sequences = getTokenizer().textsToSequences([text]);

  const paddedSequences = padSequences(sequences, 100);

  const inputTensor = tf.tensor2d(paddedSequences);

  const prediction = model.predict(inputTensor) as any;
  const predictionValue = prediction.dataSync()[0];

  console.log(predictionValue)
  return predictionValue > 0.4;
}

const MutatorCallbacks = {
  TWITTER_COMMENTS: prepareMutatorCallback('article', 'div[dir="auto"] span[style="text-overflow: unset;"]'),
  YOUTUBE_COMMENTS: prepareMutatorCallback('ytd-expander', '#content-text > span'),
  INSTAGRAM_ARTICLE: prepareMutatorCallback('article', 'span._ap3a'),
  INSTAGRAM_COMMENTS: prepareMutatorCallback('span[dir="auto"]'),
  FACEBOOK_ARTICLES: prepareMutatorCallback('blockquote', 'div[style="text-align: start;"]')
};

function prepareMutatorCallback(nodeSelector: string, textSelector: string = '') {
  return (mutations: MutationRecord[]) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(async node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const textNodes = element.querySelectorAll(nodeSelector);
          for (const selectedNode of textNodes) {
            const textNode = selectedNode.querySelector(textSelector);
            const textNodeContent = textNode?.textContent || '';
            // @ts-ignore: Suppress error about incompatible types
            if (BLOCKING_STRATEGY === BlockingStrategy.LEVENSHTEIN) {
              if (predictUsginLevenshtein(textNodeContent)) {
                selectedNode.innerHTML = '';
                const container = document.createElement('div');
                selectedNode.appendChild(container);
                ReactDOM.render(
                  <React.StrictMode>
                    <SmallCard
                      title="Blocked"
                      description="Blocked: Probably Propaganda"
                    />
                  </React.StrictMode>,
                  container
                );
              }
              return;
            }
            if (containsCyrillic(textNodeContent) || await predictUsingModel(textNodeContent)) {
              selectedNode.innerHTML = '';
              const container = document.createElement('div');
              selectedNode.appendChild(container);

              ReactDOM.render(
                <React.StrictMode>
                  <SmallCard
                    title="Blocked"
                    description="Blocked: Probably Propaganda"
                  />
                </React.StrictMode>,
                container
              );
            }
          }
        }
      });
    });
  };
}

export default prepareMutatorCallback;

enum PageType {
  YOUTUBE = 'www.youtube.com',
  TWITTER = 'twitter.com',
  INSTAGRAM = 'www.instagram.com',
  FACEBOOK = 'www.facebook.com',
}

interface Application {
  resolveCurrentPage: () => Adapter;
  adapter: Adapter;
  run: () => void;
}

abstract class Adapter {
  abstract prepareObserver(): MutationObserver;
  observer: MutationObserver;

  constructor() {
    this.observer = this.prepareObserver();
  }

  run() {
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

class YoutubeAdapter extends Adapter {
  constructor() {
    super();
  }

  prepareObserver(): MutationObserver {
    return new MutationObserver(MutatorCallbacks['YOUTUBE_COMMENTS']);
  }
}

class TwitterAdapter extends Adapter {
  constructor() {
    super();
  }

  prepareObserver(): MutationObserver {
    return new MutationObserver(MutatorCallbacks['TWITTER_COMMENTS']);
  }
}

class InstagramAdapter extends Adapter {
  constructor() {
    super();
  }

  prepareObserver(): MutationObserver {
    return new MutationObserver(MutatorCallbacks['INSTAGRAM_COMMENTS']);
  }
}

class FacebookAdapter extends Adapter {
  constructor() {
    super();
  }

  prepareObserver(): MutationObserver {
    return new MutationObserver(MutatorCallbacks['FACEBOOK_ARTICLES']);
  }
}

export class AblockApp implements Application {
  adapter!: Adapter; // Non-null assertion operator

  constructor() {
    this.adapter = this.resolveCurrentPage();
    this.run();
  }

  run() {
    console.log('run');
    this.adapter.prepareObserver();
    this.adapter.run();
  }

  resolveCurrentPage(): Adapter {
    const url = window.location.href;

    if (url.includes(PageType.YOUTUBE)) {
      return new YoutubeAdapter();
    }
    if (url.includes(PageType.TWITTER)) {
      return new TwitterAdapter();
    }
    if (url.includes(PageType.INSTAGRAM)) {
      return new InstagramAdapter();
    }
    if (url.includes(PageType.FACEBOOK)) {
      return new FacebookAdapter()

    }
    return new InstagramAdapter();
  }
}

