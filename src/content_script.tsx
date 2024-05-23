import { AblockApp } from "./core";

const app = new AblockApp()
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'hello!') {
      console.log('update')
      app.resolveCurrentPage()
      app.run()
    }
  });
