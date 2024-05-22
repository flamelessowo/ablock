import { levenshtein, russian_propaganda_keywords } from "./levenstein";
console.log('content script running');

function containsSimilarKeyword(text: string, keywords: string[] = russian_propaganda_keywords, threshold: number = 2): boolean {
  for (const keyword of keywords) {
    if (levenshtein(text, keyword) <= threshold) {
      return true;
    }
  }
  return false;
}

// INST
function blockArticles() {
  document.querySelectorAll('article').forEach((article) => {
    const description = article.querySelector('._ap3a');
    if (description?.innerHTML) {
      if (containsSimilarKeyword(description.innerHTML)) {
        (article as Element).innerHTML = "BLOCKED";
      }
    }
  });
}

// Twitter
function blockArticlesTwitter() {
  document.querySelectorAll('article').forEach((article) => {
    const span = article?.firstChild?.firstChild?.childNodes[1]?.childNodes[1]?.childNodes[1]?.firstChild?.firstChild; // I LOVE TWITTER

    if (span) {
      // If span is not null or undefined, proceed with your logic
      const spanElement = span as HTMLSpanElement;
      const spanText = spanElement.innerText;
      if (spanText) {
        console.log(spanText);
        // Your logic to check for propaganda and replace text
        spanElement.innerHTML = "Russian Pig";
      }
    } else {
      console.log('The span element is null or undefined');
    }

  });
}
blockArticlesTwitter()

const parentElement = document.querySelector('article')?.parentElement as Element | null;

const observer = new MutationObserver((mutations) => {
  console.log(mutations);

  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.matches('article')) {
          element.innerHTML = "BLOCKED";
        }
        element.querySelectorAll('article').forEach((article: Element) => {
          article.innerHTML = "BLOCKED";
        });
      }
    });
  });
});

const targetElement = document.body;

if (targetElement) {
  observer.observe(targetElement, { childList: true, subtree: true });
} else {
  console.warn('No target element found to observe.');
}

blockArticles();

// YT
function blockVideos() {
  document.querySelectorAll('ytd-rich-item-renderer').forEach(item => {
    item.querySelectorAll('img').forEach(stuff => {
      (stuff as HTMLImageElement).src = 'http://chechenews.com/wp-content/uploads/2019/05/Russian-Pig-2.jpg'
    })
  })
}
blockVideos()

//YT comments
function blockVideoContents() {
  document.querySelectorAll('.ytd-comment-view-model') // TODO SWAP ON MY
  document.querySelectorAll('.replies') // TODO CHECK REPLIES probably would work with observer
  document.querySelectorAll('#content-text > span').forEach(span => {
    console.log(span);
    const spanElement = span as HTMLSpanElement;
    const spanText = spanElement.innerText;
    if (spanText) {
      console.log(spanText);
      for (const word of spanText.split(' ')) {
        if (containsSimilarKeyword(word)) {
          spanElement.innerHTML = "Russian Pig";
        }
      }
    }
  });
}

// Initial blocking of already existing content
blockVideoContents();
