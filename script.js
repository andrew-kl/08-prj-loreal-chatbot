/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

/* Messages array for storing system prompt (AI-generated) and conversation history */
let messages = [
  {
    role: "system",
    content:
      "You are a L’Oréal Product & Routine Assistant. Only answer questions about L’Oréal products, L’Oréal-owned brands, beauty routines, and recommendations (skincare, haircare, makeup). Politely refuse and redirect if the user asks about unrelated topics (including non-L’Oréal brands and products) or non-beauty subjects. Do not recommend non–L’Oréal brands; suggest L’Oréal alternatives instead. Ask brief clarifying questions when needed. Keep responses short, practical, and routine-focused. Do not invent product details or guarantee results. Respond with context (conversation) awareness where appropriate.",
  },
];

/* Cloudflare Worker URL */
const workerUrl = "https://gca-loreal-worker.andrewkalazin.workers.dev/";

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  chatWindow.textContent = "⏳ Processing your request...";

  // Store user input in messages array
  const userMessage = userInput.value.trim();
  if (userMessage) messages.push({ role: "user", content: userMessage });

  // Send a POST request to the Cloudflare Worker
  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    // Throw an error if the response is not 200
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    // Parse Cloudflare Worker JSON response
    const result = await response.json();
    const assistantMsg = result.choices[0].message.content;

    // Store assistant response in messages array
    messages.push({ role: "assistant", content: assistantMsg });

    // Display user prompt & assistant response in chat window
    chatWindow.innerHTML = `<b>You:</b> ${userMessage}<br><br>${assistantMsg}`;
  } catch (error) {
    console.error("Error connecting to the API:", error);
    chatWindow.textContent =
      "❌ Failed to connect to the API. Please try again.";
    return;
  }

  // Clear user input
  userInput.value = "";
});
