import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react";
import { defaultEnvironment } from "./utils";

export const authClient = createAuthClient({
    baseURL: defaultEnvironment,
    plugins: [ adminClient() ]
})