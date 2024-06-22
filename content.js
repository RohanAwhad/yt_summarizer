function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clickShowTranscriptButton() {
  // Selecting the button based on its class and aria-label
  var buttons = document.querySelectorAll(
    "button.yt-spec-button-shape-next.yt-spec-button-shape-next--outline.yt-spec-button-shape-next--call-to-action.yt-spec-button-shape-next--size-m"
  );

  // Filtering buttons to find the one with the "Show transcript" aria-label
  var showTranscriptButton = Array.from(buttons).find(
    (button) => button.getAttribute("aria-label") === "Show transcript"
  );

  if (showTranscriptButton) {
    showTranscriptButton.click();
  } else {
    console.log("Show transcript button not found");
  }
}
// JavaScript code to get the video title without using the id attribute
function getVideoTitle() {
  // Selects the <yt-formatted-string> element that is a child of an <h1> tag with class "style-scope ytd-watch-metadata"
  const titleElement = document.querySelector(
    "h1.style-scope.ytd-watch-metadata > yt-formatted-string.style-scope.ytd-watch-metadata"
  );

  // Returns the text content of the title element, if found
  return titleElement ? titleElement.textContent : "Title not found";
}

function getTranscriptSegments() {
// Function to get the text content of transcript segments as a file
  const transcriptCollection = document.querySelectorAll(
    "ytd-transcript-renderer ytd-transcript-segment-list-renderer yt-formatted-string.segment-text"
  );

  // Concatenate all segments into a single string
  let transcriptText = "";
  transcriptCollection.forEach((segment) => {
    transcriptText += segment.innerText + "\n\n";
  });

  return transcriptText;
}

function downloadTranscriptSegments(transcriptText) {
  // Create a blob with the transcript text
  const transcriptBlob = new Blob([transcriptText], { type: "text/plain" });

  // Create an anchor element for the download
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(transcriptBlob);
  downloadLink.download = getVideoTitle() + ".txt"; // Name of the file to be downloaded

  // Append the anchor to the body, trigger the download, and then remove the anchor
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

async function main() {
  try {
    document
      .getElementById("description-inner")
      .getElementsByTagName("tp-yt-paper-button")[2]
      .click();
    await sleep(1000);
    clickShowTranscriptButton();
    await sleep(1000);
    const transcriptText = getTranscriptSegments();
    return transcriptText;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "downloadTranscript") {
    main().then(function(transcriptText) {
      if (transcriptText) {
        downloadTranscriptSegments(transcriptText);
      }
      sendResponse({ success: true });
    }).catch(function(error) {
      console.error("An error occurred:", error);
      sendResponse({ success: false });
    });
  } else if (request.action === "getTranscript") {
    main().then(function(transcriptText) {
      console.log("Sending transcript text ...");
      sendResponse({ transcriptText: transcriptText });
    }).catch(function(error) {
      console.error("An error occurred:", error);
      sendResponse({ transcriptText: null });
    });
  }
  return true; // Keep the message channel open for async sendResponse
});