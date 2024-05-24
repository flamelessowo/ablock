import { AblockApp, setVocabulary } from "./core";
import * as tf from '@tensorflow/tfjs';

fetch(chrome.runtime.getURL('vocabulary5000.json'))
  .then(response => response.json())
  .then(data => {
    setVocabulary(data);
    console.log(data.length)
    initTensorFlow();
  });

function initTensorFlow() {
  tf.ready().then(() => {
    loadModel().then(() => {
      const app = new AblockApp();
      app.run();
    });
  });
}

async function loadModel() {
  const modelUrl = chrome.runtime.getURL('web_model5000/model.json');
  const model = await tf.loadLayersModel(modelUrl);
  (window as any).tfModel = model;
}

