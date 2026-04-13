/**
 * VelseAI Background Service Worker
 * Handles API communication with the main dashboard.
 */

const API_BASE = "https://velseai.com/api"; // Or localhost:3000 for dev

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveJob") {
    saveJobToDashboard(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async
  }
});

async function saveJobToDashboard(jobData) {
  // 1. In a real world scenario, we'd check for a session token in storage
  // or use the domain cookies.
  
  const response = await fetch(`${API_BASE}/extension/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(jobData)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to sync with dashboard");
  }

  return await response.json();
}
