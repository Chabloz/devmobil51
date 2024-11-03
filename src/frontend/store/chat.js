import { ref } from "vue";
import WSClient from "../../websocket/WSClient.js";

export const wsClient = new WSClient(import.meta.env.VITE_WS_URL);
export const isConnecting = ref(true);
export const hasConnectionFailed = ref(false);
wsClient.on('close', () => {
  hasConnectionFailed.value = true;
  isConnecting.value = false;
});

wsClient
  .connect()
  .then(() => {
    isConnecting.value = false;
  })
  .catch(() => {
    hasConnectionFailed.value = true;
    isConnecting.value = false;
  });