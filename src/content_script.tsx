import { levenshtein } from "./levenstein";
console.log('content script running');

function blockArticles() {
  document.querySelectorAll('article').forEach((article) => {
    (article as Element).innerHTML = "BLOCKED";
  });
}

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
