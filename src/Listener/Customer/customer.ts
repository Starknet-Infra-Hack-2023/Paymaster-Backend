import BlockListener from "../../service/listener";

(async () => {
  const blockListener = new BlockListener();
  blockListener.startPolling();
})();
