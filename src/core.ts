export const russian_propaganda_keywords = [
  "Kremlin",
  "Putin",
  "Russia",
  "Russian",
  "moscow",
  "Soviet",
  "USSR",
  "KGB",
  "FSB",
  "GRU",
  "Oligarch",
  "DNR",
  "LNR",
  "Donbass",
  "Novorossiya",
  "Crimea",
]

export function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) {
    return bn;
  }
  if (bn === 0) {
    return an;
  }
  const matrix = Array.from({ length: an + 1 }, (_, i) => [i]);
  for (let j = 1; j <= bn; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  return matrix[an][bn];
}


enum PageType {
  YOUTUBE = 'www.youtube.com',
  TWITTER = 'twitter.com',
  INSTAGRAM = 'www.instagram.com',
}

enum BlockStrategy {
  LEVENSTEIN,
  ML
}

interface Application {
  resolveCurrentPage: () => Adapter;
  adapter: Adapter;
  run: () => void;
}

abstract class Adapter {
  abstract selectors: AdapterSelectors;
  abstract prepareObserver(): MutationObserver;
  observer: MutationObserver;
  abstract run(): void;

  constructor() {
    this.observer = this.prepareObserver();
  }

  containsSimilarKeyword(text: string, keywords: string[] = russian_propaganda_keywords, threshold: number = 2): boolean {
    for (const keyword of keywords) {
      if (levenshtein(text, keyword) <= threshold) {
        return true;
      }
    }
    return false;
  }
}

interface AdapterSelectors {
  article: string | null;
  articleComment: string | null;
  videoImage: string | null;
  videoComment: string | null;
}

class YoutubeAdapter extends Adapter {
  selectors: AdapterSelectors;

  constructor() {
    super();
    this.selectors = {
      article: 'ytd-app',
      articleComment: 'ytd-comment-thread-renderer',
      videoImage: 'ytd-thumbnail',
      videoComment: 'ytd-comment-renderer',
    };
  }

  prepareObserver(): MutationObserver {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.matches('yt-formatted-string')) {
              element.innerHTML = 'Pig'
            }
          }
        });
      });
    });
    return observer;
  }

  run() {
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

class TwitterAdapter extends Adapter {
  selectors: AdapterSelectors;

  constructor() {
    super();
    this.selectors = {
      article: 'article',
      articleComment: 'article',
      videoImage: 'img',
      videoComment: 'article',
    };
  }

  prepareObserver(): MutationObserver {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        // Your logic for handling mutations
      });
    });
    return observer;
  }

  run() {

  }
}

class InstagramAdapter extends Adapter {
  selectors: AdapterSelectors;

  constructor() {
    super();
    this.selectors = {
      article: 'article',
      articleComment: 'article',
      videoImage: 'img',
      videoComment: 'article',
    };
  }

  prepareObserver(): MutationObserver {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        // Your logic for handling mutations
      });
    });
    return observer;
  }
  run() {

  }
}

export class AblockApp implements Application {
  adapter: Adapter;

  constructor() {
    this.adapter = this.resolveCurrentPage();
    this.run()
  }

  run() {
    console.log('run');
    this.adapter.prepareObserver()
    this.adapter.run()
  }

  resolveCurrentPage(): Adapter {
    const url = window.location.href;

    if (url.includes(PageType.YOUTUBE)) {
      return new YoutubeAdapter();
    }
    if (url.includes(PageType.TWITTER)) {
      return new TwitterAdapter();
    }
    return new InstagramAdapter();
  }
}
