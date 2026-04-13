/**
 * VelseAI Popup Logic
 */

document.addEventListener("DOMContentLoaded", async () => {
  const displayTitle = document.getElementById("displayTitle");
  const displayCompany = document.getElementById("displayCompany");
  const noJob = document.getElementById("noJob");
  const jobFound = document.getElementById("jobFound");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");
  const errorDiv = document.getElementById("error");

  let currentJobData = null;

  // 1. Trigger extraction from content script
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && (tab.url.includes("linkedin.com") || tab.url.includes("indeed.com"))) {
      chrome.tabs.sendMessage(tab.id, { action: "extract" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          console.warn("Extraction failed or script not ready");
          return;
        }

        currentJobData = response;
        noJob.style.display = "none";
        jobFound.style.display = "block";
        displayTitle.innerText = response.title || "Unknown Title";
        displayCompany.innerText = response.company || "Unknown Company";
        saveBtn.disabled = !response.title;
        status.innerText = "READY TO CAPTURE";
      });
    }
  } catch (err) {
    console.error("Popup initialization error", err);
  }

  // 2. Handle Save
  saveBtn.addEventListener("click", async () => {
    if (!currentJobData) return;

    saveBtn.disabled = true;
    document.getElementById("btnText").style.display = "none";
    document.getElementById("loading").style.display = "inline";
    errorDiv.style.display = "none";

    chrome.runtime.sendMessage({ action: "saveJob", data: currentJobData }, (response) => {
      document.getElementById("btnText").style.display = "inline";
      document.getElementById("loading").style.display = "none";

      if (response && response.success) {
        status.innerText = "SYNCED TO DASHBOARD";
        saveBtn.innerText = "View in Dashboard";
        saveBtn.disabled = false;
        saveBtn.style.background = "#059669";
        saveBtn.removeEventListener("click", null); // Simplification
        saveBtn.onclick = () => {
          chrome.tabs.create({ url: "https://velseai.com/dashboard/jobs" });
        };
      } else {
        saveBtn.disabled = false;
        errorDiv.innerText = response?.error || "Connection error. Are you logged in?";
        errorDiv.style.display = "block";
      }
    });
  });
});
