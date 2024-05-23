import { AblockApp, setVocabulary } from "./core";
import * as tf from '@tensorflow/tfjs';

// Load the vocabulary JSON file
fetch(chrome.runtime.getURL('vocabulary.json'))
  .then(response => response.json())
  .then(data => {
    setVocabulary(data);
    // Initialize TensorFlow.js and load the model
    initTensorFlow();
  });

function initTensorFlow() {
  tf.ready().then(() => {
    loadModel().then(() => {
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
  });
}

async function loadModel() {
  const modelUrl = chrome.runtime.getURL('model.json');
  const model = await tf.loadLayersModel(modelUrl);
  (window as any).tfModel = model;
}

