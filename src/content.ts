console.log('content')
const articles = document.querySelector('article')?.parentElement

const observer = new MutationObserver((mutations) => {
  console.log(mutations)
});
if (articles != null) {
  observer.observe(articles, { childList: true, subtree: true })
}
