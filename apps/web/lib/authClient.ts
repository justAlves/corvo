import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "https://ps2ohczlyfc2mf8afwzby9lr.72.60.157.197.sslip.io",
    plugins: [ adminClient() ]
})