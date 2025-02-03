import ejelRoom from "ejel-streaming-js";

let room = null;

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
  });
}

document.getElementById("joinBtn").addEventListener("click", async () => {
  const backgroundInput = document.getElementById("backgroundInput");
  const positionXInput = document.getElementById("positionXInput").value;
  const positionYInput = document.getElementById("positionYInput").value;
  const scaleInput = document.getElementById("scaleInput").value;

  let background = null;
  if (backgroundInput.files.length > 0) {
    const file = backgroundInput.files[0];
    const useAsBlob = confirm("Treat as Blob? Cancel for File.");

    if (useAsBlob) {
      const newBlob = new Blob([file], { type: file.type });
      console.log(`New Blob size: ${newBlob.size}`);
      console.log(`New Blob type: ${newBlob.type}`);
      background = newBlob;
    } else {
      console.log(`File name: ${file.name}`);
      console.log(`File type: ${file.type}`);
      console.log(`File size: ${file.size}`);
      background = file;
    }
  }

  room = new ejelRoom({
    // Please set agentId, apiKey, and serverUrl values in the .env file
    agentId: import.meta.env.VITE_AGENT_ID,
    apiKey: import.meta.env.VITE_API_KEY,
    serverUrl: import.meta.env.VITE_SERVER_URL,
    background: background || null,
    positionX: positionXInput || null,
    positionY: positionYInput || null,
    scale: scaleInput || null,
  });

  setupEventListeners();
  try {
    await room.join();
    // document.getElementById("settings").style.display = "none";
    document.getElementById("backgroundInput").value = null;
    document.getElementById("positionXInput").value = null;
    document.getElementById("positionYInput").value = null;
    document.getElementById("scaleInput").value = null;
  } catch (error) {
    logClient("join error..");
    console.error(error);
  }
});

document.getElementById("speakBtn").addEventListener("click", async () => {
  const text = document.getElementById("textInput").value;
  const backgroundInput = document.getElementById("backgroundInput");
  const positionXInput = document.getElementById("positionXInput").value;
  const positionYInput = document.getElementById("positionYInput").value;
  const scaleInput = document.getElementById("scaleInput").value;

  let background = null;
  if (backgroundInput.files.length > 0) {
    const file = backgroundInput.files[0];
    const useAsBlob = confirm("Treat as Blob? Cancel for File.");

    if (useAsBlob) {
      const newBlob = new Blob([file], { type: file.type });
      console.log(`New Blob size: ${newBlob.size}`);
      console.log(`New Blob type: ${newBlob.type}`);
      background = newBlob;
    } else {
      // Use the file directly
      console.log(`File name: ${file.name}`);
      console.log(`File type: ${file.type}`);
      console.log(`File size: ${file.size}`);
      background = file;
    }
  }

  try {
    await room.speak({
      text: text,
      background: background || null,
      positionX: positionXInput || null,
      positionY: positionYInput || null,
      scale: scaleInput || null,
    });
    document.getElementById("textInput").value = "";
    document.getElementById("backgroundInput").value = null;
    document.getElementById("positionXInput").value = null;
    document.getElementById("positionYInput").value = null;
    document.getElementById("scaleInput").value = null;
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
  // document.getElementById("settings").style.display = "block";
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
