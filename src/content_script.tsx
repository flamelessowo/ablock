// import { AblockApp } from "./core";
// 
// const app = new AblockApp()
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if (request.message === 'hello!') {
//       console.log('update')
//       app.resolveCurrentPage()
//       app.run()
//     }
//   });
import { AblockApp } from "./core";

// Load TensorFlow.js via CDN
const tfScript = document.createElement('script');
tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs';
tfScript.onload = () => {
  // Once TensorFlow.js is loaded, run the application
  const app = new AblockApp();
  app.run();

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === 'hello!') {
        console.log('update')
        app.resolveCurrentPage()
        app.run()
      }
    });
};
(document.head || document.documentElement).appendChild(tfScript);

