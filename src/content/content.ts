console.log('content script running');

// Function to block articles
function blockArticles() {
  document.querySelectorAll('article').forEach((article) => {
    (article as Element).innerHTML = "BLOCKED";
  });
}

// Select the parent element of the articles (if exists)
const parentElement = document.querySelector('article')?.parentElement as Element | null;

// Create a MutationObserver
const observer = new MutationObserver((mutations) => {
  console.log(mutations);

  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // Check if the added node is an article or contains articles
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

// Start observing the body for changes in its child list and subtree
const targetElement = document.body;

if (targetElement) {
  observer.observe(targetElement, { childList: true, subtree: true });
} else {
  console.warn('No target element found to observe.');
}

// Initial blocking of already existing articles
blockArticles();
