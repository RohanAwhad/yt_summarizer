window.addEventListener("DOMContentLoaded", () => {
  const apiKey = localStorage.getItem("openaiApiKey");
  if (apiKey) {
    document.getElementById("openaiApiKey").value = apiKey;
  }
});
document.getElementById("openaiApiKey").addEventListener("change", () => {
  const apiKey = document.getElementById("openaiApiKey").value;
  localStorage.setItem("openaiApiKey", apiKey);
});

document
  .getElementById("downloadButton")
  .addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "downloadTranscript" });
    });
  });

document.getElementById("copyButton").addEventListener("click", function () {
  if (finalSummary) {
    navigator.clipboard
      .writeText(finalSummary)
      .then(() => {
        console.log("Summary copied to clipboard");
      })
      .catch((error) => {
        console.error("Error copying summary to clipboard:", error);
      });
  }
});

// ===
// Summary generation
// ===
let finalSummary = undefined;

const convertToHtml = (summary) => {
  const converter = new showdown.Converter();
  const htmlSummary = converter.makeHtml(summary);
  return htmlSummary;
};

const updateUI = (summary) => {
  finalSummary = summary;
  document.getElementById("copyButton").classList.remove("hidden");
  const htmlSummary = convertToHtml(summary);
  document.getElementById("summaryOutput").innerHTML = htmlSummary;
};

document
  .getElementById("philosophicalButton")
  .addEventListener("click", () =>
    getPodcastSummary(SummaryType.PHILOSOPHICAL_ANALYSIS)
  );
document
  .getElementById("technicalButton")
  .addEventListener("click", () =>
    getPodcastSummary(SummaryType.TECHNICAL_PRACTICAL)
  );
document
  .getElementById("strategicButton")
  .addEventListener("click", () =>
    getPodcastSummary(SummaryType.STRATEGIC_BUSINESS)
  );
document
  .getElementById("innovativeButton")
  .addEventListener("click", () =>
    getPodcastSummary(SummaryType.INNOVATIVE_VISIONARY)
  );
document
  .getElementById("comprehensiveButton")
  .addEventListener("click", () =>
    getPodcastSummary(SummaryType.COMPREHENSIVE_GENERAL)
  );

const getPodcastSummary = (summaryType) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getTranscript" },
      async function (response) {
        const transcriptText = response.transcriptText;
        const prompt = getPodcastSummaryPrompt(summaryType);
        const apiKey = document.getElementById("openaiApiKey").value;
        try {
          const result = await generateSummary(
            prompt,
            transcriptText,
            apiKey,
            updateUI
          );
          if (!result) {
            finalSummary = `Summary Type: ${summaryType}`;
            document.getElementById("copyButton").classList.remove("hidden");
            document.getElementById("summaryOutput").innerHTML = `
              <p>Couldn't generate summary. Please click on the above copy button to copy a prompt for my custom ChatGPT, 
              download the transcript by clicking the first button and then now head over to 
              <a href="https://chatgpt.com/g/g-kTrXwn9yK-transcript-summarizer">my custom GPT</a>
              here to summarize the content.</p>
            `;
          }
        } catch (error) {
          console.error("Error generating summary:", error);
        }
      }
    );
  });
};
