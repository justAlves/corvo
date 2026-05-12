#!/bin/bash
# Evolution API v2.2.3 rejects sendMessage to @lid JIDs because whatsappNumber()
# returns exists:false for Linked-ID identifiers. This patches the gate so @lid
# is accepted (treated like @s.whatsapp.net / @broadcast).
set -e

TARGET="/evolution/dist/api/integrations/channel/whatsapp/whatsapp.baileys.service.js"

if [ ! -f "$TARGET" ]; then
  echo "[lid-patch] target not found: $TARGET — skipping"
else
  if grep -q '!n.jid.includes("@broadcast")&&!n.jid.includes("@lid")' "$TARGET"; then
    echo "[lid-patch] already applied"
  else
    sed -i 's|!n\.jid\.includes("@broadcast"))throw new f(n)|!n.jid.includes("@broadcast")\&\&!n.jid.includes("@lid"))throw new f(n)|g' "$TARGET"
    sed -i 's|!s\.jid\.includes("@broadcast"))throw new f(s)|!s.jid.includes("@broadcast")\&\&!s.jid.includes("@lid"))throw new f(s)|g' "$TARGET"
    echo "[lid-patch] applied to whatsapp.baileys.service.js"
  fi
fi

# Hand control back to original entrypoint.
exec /bin/bash -c '. ./Docker/scripts/deploy_database.sh && npm run start:prod'
