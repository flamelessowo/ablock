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

// Initialize TensorFlow.js with WASM backend
const tfScript = document.createElement('script');
tfScript.src = chrome.runtime.getURL('tf.min.js');
tfScript.onload = () => {
  const wasmScript = document.createElement('script');
  wasmScript.src = chrome.runtime.getURL('tf-backend-wasm.js');
  wasmScript.onload = () => {
    const tf = (window as any).tf;
    tf.setBackend('wasm').then(() => {
      // Load the WASM binary file
      tf.env().set('WASM_PATH', chrome.runtime.getURL('tf-backend-wasm.wasm'));

      // Once TensorFlow.js is loaded and the backend is set, run the application
      const app = new AblockApp();
      app.run();

      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if (request.message === 'hello!') {
            console.log('update');
            app.resolveCurrentPage();
            app.run();
          }
        });
    });
  };
  (document.head || document.documentElement).appendChild(wasmScript);
};
(document.head || document.documentElement).appendChild(tfScript);

