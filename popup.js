function download_transcript () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "downloadTranscript" });
  });
};


window.addEventListener("DOMContentLoaded", () => {

  /*updateUI(`# Summary of PiSpark and Apache Spark Course

## 1. Technical Insights
- **PiSpark**: An interface for Apache Spark specifically designed for Python, facilitating large-scale data processing and machine learning tasks.
- Discussed features like **Spark DataFrames**, ability to handle distributed data processing, machine learning with **spark.ml**, and integration with cloud services such as AWS and DataBricks.
- Importance of **preprocessing** and how PiSpark simplifies data manipulation with functionalities similar to **Pandas**, but on a distributed scale.

## 2. Practical Applications
- Use cases for PiSpark include machine learning tasks like regression, classification, and clustering.
- Applications range from handling heavy datasets that exceed local machine capabilities to running Spark jobs in cloud environments for big data analytics.

## 3. Problem-Solving Approaches
- Introduced a structured approach to preliminary Spark operations:
- Start Spark sessions for both local and cloud setups.
- Reading CSV files into DataFrames.
- Applying machine learning models using the Spark MLlib.

## 4. Key Learnings and Hacks
- The importance of creating a new environment when installing PiSpark to avoid dependency issues.
- Tips on reading DataFrames effectively by setting the right options (e.g., headers, schema inference).
- Guide to handling missing values efficiently through convenience methods in PiSpark.

## 5. Innovative Thinking
- Emphasized the effectiveness of **distributed computing** offered by Apache Spark for tasks that require immense processing power, eliminating the limits of local memory.
- The use of cloud services for scalable data processing promotes flexibility and resource optimization.

## 6. Personal Experiences and Anecdotes
- The instructor shared experiences of setting up PiSpark environments and common errors encountered during installations and configurations, contributing to a better understanding of potential pitfalls.

## 7. Critical and Skeptical Views
- Critical examination of traditional methods (like MapReduce), highlighting Apache Spark's 100x speed advantage for big data processing tasks.
- Encouraged skepticism toward reliance on single-system configurations for large datasets.

## 8. Dynamic and Fast-Paced Nature
- The conversation was fast-paced, keeping viewers engaged with continuous examples, coding demonstrations, and practical challenges throughout the video.
- Regular reiteration of essential concepts while progressively introducing complex functionalities maintained the dynamic engagement of the training.`)*/


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
