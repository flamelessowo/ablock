import { levenshtein, russian_propaganda_keywords } from "./levenstein";

const MutatorCallbacks = {
  TWITTER_ARTICLE: prepareMutatorCallback('article'),
  TWITTER_COMMENTS: prepareMutatorCallback('div[dir="auto"] span[style="text-overflow: unset;"]'),
  YOUTUBE_VIDEO: prepareMutatorCallback('ytd-rich-item-renderer'),
  YOUTUBE_COMMENTS: prepareMutatorCallback('#content-text > span'),
  INSTAGRAM_ARTICLE: prepareMutatorCallback('article'),
  INSTAGRAM_COMMENTS: prepareMutatorCallback('span[dir="auto"]'),
};

function prepareMutatorCallback(nodeSelector: string) {
  return (mutations: MutationRecord[]) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          element.querySelectorAll(nodeSelector).forEach(selectedNode => {
            console.log('wtf')
            selectedNode.innerHTML = 'Blocked'; // ADD BLOCK HANDLER
          });
        }
      });
    });
  }
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

  containsSimilarKeyword(text: string, keywords: string[] = russian_propaganda_keywords, threshold: number = 2): boolean {
    for (const keyword of keywords) {
      if (levenshtein(text, keyword) <= threshold) {
        return true;
      }
    }
    return false;
  }
}


class YoutubeAdapter extends Adapter {

  constructor() {
    super();
  }

  prepareObserver(): MutationObserver {
    if (window.location.pathname.includes('/watch')) {
      return new MutationObserver(MutatorCallbacks['YOUTUBE_COMMENTS']);
    }
    return new MutationObserver(MutatorCallbacks['YOUTUBE_VIDEO']);
  }
}

class TwitterAdapter extends Adapter {

  constructor() {
    super();
  }

  prepareObserver(): MutationObserver {
    if (window.location.pathname.includes('/status/')) {
      return new MutationObserver(MutatorCallbacks['TWITTER_COMMENTS'])
    }
    return new MutationObserver(MutatorCallbacks['TWITTER_ARTICLE'])
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
    if (url.includes(PageType.INSTAGRAM)) {
      return new InstagramAdapter();
    }
    return new InstagramAdapter();
  }
}
