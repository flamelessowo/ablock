// import { levenshtein, russian_propaganda_keywords } from "./levenstein";
// 
// import React from 'react';
// import ReactDOM from 'react-dom';
// import SmallCard from './cards/SmallCard';
// 
// function containsCyrillic(text: string): boolean {
//   return /[А-Яа-яЁё]/.test(text);
// }
// 
// function containsSimilarKeyword(text: string, keywords: string[] = russian_propaganda_keywords, threshold: number = 2.5): boolean {
//   for (const keyword of keywords) {
//     if (containsCyrillic(text)) {
//       return true;
//     }
//     if (levenshtein(text, keyword) <= threshold) {
//       return true;
//     }
//   }
//   return false;
// }
// 
// const MutatorCallbacks = {
//   TWITTER_COMMENTS: prepareMutatorCallback('article', 'div[dir="auto"] span[style="text-overflow: unset;"]'),
//   YOUTUBE_VIDEO: prepareMutatorCallback('ytd-rich-item-renderer'),
//   YOUTUBE_COMMENTS: prepareMutatorCallback('ytd-expander', '#content-text > span'),
//   INSTAGRAM_ARTICLE: prepareMutatorCallback('article'),
//   INSTAGRAM_COMMENTS: prepareMutatorCallback('span[dir="auto"]'),
// };
// 
// function prepareMutatorCallback(nodeSelector: string, textSelector: string = '') {
//   return (mutations: MutationRecord[]) => {
//     mutations.forEach(mutation => {
//       mutation.addedNodes.forEach(node => {
//         if (node.nodeType === Node.ELEMENT_NODE) {
//           const element = node as Element;
//           element.querySelectorAll(nodeSelector).forEach(selectedNode => {
//             const textNode = selectedNode.querySelector(textSelector);
//             const textNodeContent = textNode?.textContent || '';
//             console.log(textNodeContent)
//             for (const word of textNodeContent.split(' ')) {
//               if (containsSimilarKeyword(word)) {
//                 selectedNode.innerHTML = '';
//                 const container = document.createElement('div');
//                 selectedNode.appendChild(container);
// 
//                 ReactDOM.render(
//                   <React.StrictMode>
//                     <SmallCard
//                       title="Blocked"
//                       description="Blocked: Probably Propaganda"
//                     />
//                   </React.StrictMode>,
//                   container
//                 );
//               }
//             }
//           });
//         }
//       });
//     });
//   };
// }
// 
// export default prepareMutatorCallback;
// 
// 
// 
// enum PageType {
//   YOUTUBE = 'www.youtube.com',
//   TWITTER = 'twitter.com',
//   INSTAGRAM = 'www.instagram.com',
// }
// 
// enum BlockStrategy {
//   LEVENSTEIN,
//   ML
// }
// 
// interface Application {
//   resolveCurrentPage: () => Adapter;
//   adapter: Adapter;
//   run: () => void;
// }
// 
// abstract class Adapter {
//   abstract prepareObserver(): MutationObserver;
//   observer: MutationObserver;
// 
//   constructor() {
//     this.observer = this.prepareObserver();
//   }
// 
//   run() {
//     this.observer.observe(document.body, {
//       childList: true,
//       subtree: true,
//     });
//   }
// }
// 
// 
// class YoutubeAdapter extends Adapter {
// 
//   constructor() {
//     super();
//   }
// 
//   prepareObserver(): MutationObserver {
//     console.log(window.location.href);
//     return new MutationObserver(MutatorCallbacks['YOUTUBE_COMMENTS']);
//   }
// }
// 
// class TwitterAdapter extends Adapter {
// 
//   constructor() {
//     super();
//   }
// 
//   prepareObserver(): MutationObserver {
//     return new MutationObserver(MutatorCallbacks['TWITTER_COMMENTS'])
//   }
// }
// 
// class InstagramAdapter extends Adapter {
// 
//   constructor() {
//     super();
//   }
// 
//   prepareObserver(): MutationObserver {
//     return new MutationObserver(MutatorCallbacks['INSTAGRAM_COMMENTS'])
//   }
// }
// 
// export class AblockApp implements Application {
//   adapter: Adapter;
// 
//   constructor() {
//     this.adapter = this.resolveCurrentPage();
//     this.run()
//   }
// 
//   run() {
//     console.log('run');
//     this.adapter.prepareObserver()
//     this.adapter.run()
//   }
// 
//   resolveCurrentPage(): Adapter {
//     const url = window.location.href;
// 
//     if (url.includes(PageType.YOUTUBE)) {
//       return new YoutubeAdapter();
//     }
//     if (url.includes(PageType.TWITTER)) {
//       return new TwitterAdapter();
//     }
//     if (url.includes(PageType.INSTAGRAM)) {
//       return new InstagramAdapter();
//     }
//     return new InstagramAdapter();
//   }
// }
import { russian_propaganda_keywords } from "./levenstein";
import React from 'react';
import ReactDOM from 'react-dom';
import SmallCard from './cards/SmallCard';

function containsCyrillic(text: string): boolean {
  return /[А-Яа-яЁё]/.test(text);
}

// Define the vocabulary interface and object
interface Vocabulary {
  [key: string]: number;
}

const vocabulary: Vocabulary = { 'example': 1, 'word': 2 };  // Example vocabulary

// Tokenizer and padding functions
function getTokenizer() {
  return {
    textsToSequences: function(texts: string[]) {
      return texts.map(text => {
        return text.split(' ').map(word => wordToIndex(word));
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

let model: any;

// Load the TensorFlow.js model
async function loadModel() {
  const tf = (window as any).tf;
  model = await tf.loadLayersModel(chrome.runtime.getURL('tfjs_model/model.json'));
}

function predictUsingModel(text: string): boolean {
  const tf = (window as any).tf;
  const sequences = getTokenizer().textsToSequences([text]);
  const paddedSequences = padSequences(sequences, 100); // Use appropriate maxLen
  const inputTensor = tf.tensor2d(paddedSequences);
  const prediction = model.predict(inputTensor) as any;
  const predictionValue = prediction.dataSync()[0];
  return predictionValue > 0.5; // Assuming 0.5 as the threshold for blocking
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
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          element.querySelectorAll(nodeSelector).forEach(selectedNode => {
            const textNode = selectedNode.querySelector(textSelector);
            const textNodeContent = textNode?.textContent || '';
            if (containsCyrillic(textNodeContent) || predictUsingModel(textNodeContent)) {
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
          });
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
    return new MutationObserver(MutatorCallbacks['TWITTER_COMMENTS'])
  }
}

class InstagramAdapter extends Adapter {
  constructor() {
    super();
  }

  prepareObserver(): MutationObserver {
    return new MutationObserver(MutatorCallbacks['INSTAGRAM_COMMENTS'])
  }
}

export class AblockApp implements Application {
  adapter!: Adapter; // Non-null assertion operator

  constructor() {
    loadModel().then(() => {
      this.adapter = this.resolveCurrentPage();
      this.run();
    });
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

