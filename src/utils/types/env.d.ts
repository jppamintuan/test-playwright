export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BROWSER: "chrome" | "firefox" | "webkit",
            ENV: "uat" | "prod" | "sit",
            HEAD: "true" | "false",
            SCHEME: "QLD" | "WA" | "VIC",
        }
    }
}