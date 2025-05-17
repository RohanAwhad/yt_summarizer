function download_transcript () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "downloadTranscript" });
  });
};


window.addEventListener("DOMContentLoaded", () => {


  const apiKey = localStorage.getItem("openaiApiKey");
  if (apiKey) {
    document.getElementById("openaiApiKey").value = apiKey;
  } else {
      const inputField = document.getElementById('openaiApiKey');
      if (!inputField.classList.contains('visible')) {
        inputField.classList.remove('invisible');
        inputField.classList.add('visible');
      }
  }

  document.getElementById("key-icon").addEventListener("click", () => {
    const inputField = document.getElementById('openaiApiKey');

    if (inputField) {
      if (inputField.classList.contains('visible')) {
        inputField.classList.remove('visible');
        inputField.classList.add('invisible');
      } else {
        inputField.classList.remove('invisible');
        inputField.classList.add('visible');
      }
    }

  });


  document.getElementById("openaiApiKey").addEventListener("change", () => {
    const apiKey = document.getElementById("openaiApiKey").value;
    localStorage.setItem("openaiApiKey", apiKey);
  });

  document
    .getElementById("summarize-button")
    .addEventListener("click", function () {

      const selection = document.getElementById("selection").value
      if (selection === 'download') { download_transcript() }
      else if (selection === 'philosophical') { getPodcastSummary(SummaryType.PHILOSOPHICAL_ANALYSIS) }
      else if (selection === 'technical') { getPodcastSummary(SummaryType.TECHNICAL_PRACTICAL) }
      else if (selection === 'strategic') { getPodcastSummary(SummaryType.STRATEGIC_BUSINESS) }
      else if (selection === 'innovative') { getPodcastSummary(SummaryType.INNOVATIVE_VISIONARY) }
      else if (selection === 'comprehensive') { getPodcastSummary(SummaryType.COMPREHENSIVE_GENERAL) }
    });



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
  //document.getElementById("copyButton").classList.remove("hidden");
  const copy_button = `<button id="copyButton" class="hover:scale-105 active:scale-95 absolute top-2 right-2 pr-1 py-1"><svg class='w-6 h-6' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z"/></svg></button>`

  const htmlSummary = copy_button + "<div class='p-4 pr-6 pt-8'>" + convertToHtml(summary) + "</div>"
  
  document.getElementById("summaryOutput").innerHTML = htmlSummary;
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
};



/*
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
*/

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
            document.getElementById("summaryOutput").innerHTML = `
              <button id="copyButton" class="hover:scale-105 active:scale-95 absolute top-2 right-2 pr-1 py-1"><svg class='w-6 h-6' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z"/></svg></button>
              <p>Couldn't generate summary. Please click on the above copy button to copy a prompt for my custom ChatGPT, 
              download the transcript by clicking the first button and then now head over to 
              <a href="https://chatgpt.com/g/g-kTrXwn9yK-transcript-summarizer">my custom GPT</a>
              here to summarize the content.</p>
            `;

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
          }
        } catch (error) {
          console.error("Error generating summary:", error);
        }
      }
    );
  });
};
