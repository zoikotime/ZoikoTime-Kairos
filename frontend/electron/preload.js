import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("zoikoDesktop", {
  session: {
    get: () => ipcRenderer.invoke("session:get"),
    save: (payload) => ipcRenderer.invoke("session:save", payload),
    clear: () => ipcRenderer.invoke("session:clear"),
  },
});
