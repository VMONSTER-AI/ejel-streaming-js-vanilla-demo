import Room from "ejel-chat-js";

const room = new Room({
  // Please set agentId, apiKey, and serverUrl values in the .env file
  agentId: import.meta.env.VITE_AGENT_ID,
  apiKey: import.meta.env.VITE_API_KEY,
  serverUrl: import.meta.env.VITE_SERVER_URL,
});

let sttResult = "";

const videoStyle = {
  borderRadius: "20px",
  width: "100%",
  height: "100%",
  backgroundColor: "none",
  objectFit: "cover",
};

function logClient(text) {
  console.log(`[Client] - ${text}`);
}

function updateJoinStatus(isJoined) {
  document.getElementById("joinStatus").textContent = isJoined
    ? "Joined!"
    : "Not Joined..";
}

function updateSpeakingStatus(isAgentSpeaking) {
  document.getElementById("speakingStatus").textContent = isAgentSpeaking
    ? "Agent is Speaking!"
    : "Agent is not Speaking..";
}

function setupEventListeners() {
  room.on("joined", () => {
    updateJoinStatus(true);
    updateSpeakingStatus(false);
  });

  room.on("agent-message", (msg) => {
    logClient(msg);
  });

  room.on("agent-start-speaking", () => {
    updateSpeakingStatus(true);
  });

  room.on("agent-stop-speaking", () => {
    updateSpeakingStatus(false);
  });

  room.on("left", () => {
    logClient("connection closed");
    updateJoinStatus(false);
    updateSpeakingStatus(false);
    document.getElementById("chatInput").value = "";
    document.getElementById("sttResult").style.display = "none";
    sttResult = "";
  });
}

document.getElementById("joinBtn").addEventListener("click", async () => {
  // To add a video with a specific style, call room.addVideo(style) before join()
  room.addVideo(videoStyle);

  setupEventListeners();
  try {
    await room.join();
  } catch (error) {
    logClient("join error..");
    console.error(error);
  }
});

document.getElementById("chatBtn").addEventListener("click", async () => {
  const text = document.getElementById("chatInput").value;
  try {
    await room.chat(text);
    document.getElementById("chatInput").value = "";
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("leaveBtn").addEventListener("click", () => {
  room.leave();
});

document.getElementById("addVideoBtn").addEventListener("click", () => {
  room.addVideo(videoStyle);
});

document.getElementById("removeVideoBtn").addEventListener("click", () => {
  room.removeVideo();
});

document.getElementById("startRecordBtn").addEventListener("click", () => {
  room.startRecordingAudio();
});

document.getElementById("stopRecordBtn").addEventListener("click", async () => {
  try {
    const blob = await room.stopRecordingAudio();
    const text = await room.stt(blob, "ko");
    sttResult = text;
    if (sttResult.trim() !== "") {
      document.getElementById("sttText").textContent = text;
      document.getElementById("sttResult").style.display = "block";
    }
  } catch (error) {
    console.error(error);
  }
});

document
  .getElementById("sendChatWithSttResultBtn")
  .addEventListener("click", async () => {
    logClient(sttResult);
    try {
      await room.chat(sttResult);
      document.getElementById("sttResult").style.display = "none";
      sttResult = "";
    } catch (error) {
      console.error("[Client] - " + error);
    }
  });
