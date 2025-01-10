import ejelRoom from "ejel-streaming-js";

let room = null;
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
  room.on("joining", () => {
    logClient("joining...");
  });
  room.on("joined", () => {
    // add video with a specific style when joined
    room.addVideo(videoStyle);

    updateJoinStatus(true);
    updateSpeakingStatus(false);
  });
  room.on("join-timeout", () => {
    logClient("join-timeout");
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
    room.removeVideo();
    updateJoinStatus(false);
    updateSpeakingStatus(false);
    document.getElementById("textInput").value = "";
    document.getElementById("sttResult").style.display = "none";
    sttResult = "";
  });
}

document.getElementById("joinBtn").addEventListener("click", async () => {
  room = new ejelRoom({
    // Please set agentId, apiKey, and serverUrl values in the .env file
    agentId: import.meta.env.VITE_AGENT_ID,
    apiKey: import.meta.env.VITE_API_KEY,
    serverUrl: import.meta.env.VITE_SERVER_URL,
    background: background,
    position_x: positionXInput || null,
    position_y: positionYInput || null,
    scale: scaleInput || null,
  });

  setupEventListeners();
  try {
    await room.join();
  } catch (error) {
    logClient("join error..");
    console.error(error);
  }
});

document.getElementById("speakBtn").addEventListener("click", async () => {
  const text = document.getElementById("textInput").value;
  try {
    await room.speak(text);
    document.getElementById("textInput").value = "";
  } catch (error) {
    console.error(error);
  }
});
document
  .getElementById("stopSpeakingBtn")
  .addEventListener("click", async () => {
    try {
      await room.stopSpeaking();
    } catch (error) {
      console.error(error);
    }
  });

document.getElementById("leaveBtn").addEventListener("click", () => {
  room.leave();
  document.getElementById("settings").style.display = "block";
});

document.getElementById("addVideoBtn").addEventListener("click", () => {
  room.addVideo(videoStyle);
});

document.getElementById("removeVideoBtn").addEventListener("click", () => {
  room.removeVideo();
});

document.getElementById("logAgentStateBtn").addEventListener("click", () => {
  logClient(room.agentState());
});

document.getElementById("logRoomStateBtn").addEventListener("click", () => {
  logClient(room.roomState());
});
