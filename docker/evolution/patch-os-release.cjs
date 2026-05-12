// Evolution v2.2.3 uses os.release() verbatim as the third element of the
// Baileys browser tuple ([CLIENT, NAME, VERSION]). On modern Linux kernels
// (e.g. "7.0.0-1-cachyos") WhatsApp's handshake rejects the session, so we
// force a conventional Ubuntu-style release that WhatsApp accepts.
const os = require("os");
const original = os.release;
os.release = function release() {
  return "22.04.4";
};
// Touch original so linters don't warn about unused binding.
void original;
