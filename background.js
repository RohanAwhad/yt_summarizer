chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("youtube.com/watch")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: main
    });
  }
});
