import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

enum BlockStrategy {
  LEVENSHTEIN = "Levenshtein Algorithm",
  ML = "Machine Learning"
}

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  const [strategy, setStrategy] = useState<BlockStrategy>(BlockStrategy.LEVENSHTEIN);

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() });
  }, [count]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  const handleStrategyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStrategy(event.target.value as BlockStrategy);
  };

  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">Agressor Block</h1>
      <ul className="mb-4">
        <li><strong>Current URL:</strong> {currentURL}</li>
        <li><strong>Current Time:</strong> {new Date().toLocaleTimeString()}</li>
      </ul>
      <div className="mb-4">
        <label htmlFor="strategy" className="mr-2">Blocking Strategy:</label>
        <select
          id="strategy"
          value={strategy}
          onChange={handleStrategyChange}
          className="border rounded p-1"
        >
          <option value={BlockStrategy.LEVENSHTEIN}>{BlockStrategy.LEVENSHTEIN}</option>
          <option value={BlockStrategy.ML}>{BlockStrategy.ML}</option>
        </select>
      </div>
      <button
        onClick={() => setCount(count + 1)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Count up
      </button>
      <div className="mt-4">
        <strong>Count:</strong> {count}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

