import React from 'react';
import ReactDOM from 'react-dom';
import SmallCard from './cards/SmallCard';

let vocabulary: { [key: string]: number } = {};

export function setVocabulary(vocab: { [key: string]: number }) {
  vocabulary = vocab;
}

function containsCyrillic(text: string): boolean {
  return /[А-Яа-яЁё]/.test(text);
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

async function predictUsingModel(text: string): Promise<boolean> {
  const tf = (window as any).tf;
  const model = (window as any).tfModel;
  if (!tf || !model) {
    throw new Error('TensorFlow.js or model not loaded');
  }

  //console.log(`Text for prediction: ${text}`);

  const sequences = getTokenizer().textsToSequences([text]);
  //console.log(`Tokenized sequences: ${JSON.stringify(sequences)}`);

  const paddedSequences = padSequences(sequences, 100); // Use appropriate maxLen
  //console.log(`Padded sequences: ${JSON.stringify(paddedSequences)}`);

  const inputTensor = tf.tensor2d(paddedSequences);
  //console.log(`Input tensor: ${inputTensor}`);

  const prediction = model.predict(inputTensor) as any;
  const predictionValue = prediction.dataSync()[0];
  //console.log(`Prediction value: ${predictionValue}`);

  console.log(predictionValue)
  return predictionValue > 0.4; // Assuming 0.5 as the threshold for blocking
}

const MutatorCallbacks = {
  TWITTER_COMMENTS: prepareMutatorCallback('article', 'div[dir="auto"] span[style="text-overflow: unset;"]'),
  YOUTUBE_VIDEO: prepareMutatorCallback('ytd-rich-item-renderer'),
  YOUTUBE_COMMENTS: prepareMutatorCallback('ytd-expander', '#content-text > span'),
  INSTAGRAM_ARTICLE: prepareMutatorCallback('article'),
  INSTAGRAM_COMMENTS: prepareMutatorCallback('span[dir="auto"]'),
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
    return new InstagramAdapter();
  }
}

