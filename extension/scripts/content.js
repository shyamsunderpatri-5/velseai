/**
 * VelseAI content script
 * Responsible for extracting Job Data from the current page.
 */

function extractJobData() {
  const url = window.location.href;
  let data = {
    title: "",
    company: "",
    location: "",
    description: "",
    url: url,
    source: "other"
  };

  if (url.includes("linkedin.com")) {
    data.source = "linkedin";
    // LinkedIn Selectors (Unified Top Card)
    data.title = document.querySelector(".jobs-unified-top-card__job-title")?.innerText.trim() || "";
    data.company = document.querySelector(".jobs-unified-top-card__company-name")?.innerText.trim() || "";
    data.location = document.querySelector(".jobs-unified-top-card__bullet")?.innerText.trim() || "";
    data.description = document.querySelector(".jobs-description__container")?.innerText.trim() || 
                      document.querySelector("#job-details")?.innerText.trim() || "";
  } else if (url.includes("indeed.com")) {
    data.source = "indeed";
    data.title = document.querySelector(".jobsearch-JobInfoHeader-title")?.innerText.trim() || "";
    data.company = document.querySelector(".jobsearch-CompanyReview--primary")?.innerText.trim() || 
                  document.querySelector("[data-company-name]")?.innerText.trim() || "";
    data.description = document.querySelector("#jobDescriptionText")?.innerText.trim() || "";
  }

  return data;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract") {
    const jobData = extractJobData();
    sendResponse(jobData);
  }
});
