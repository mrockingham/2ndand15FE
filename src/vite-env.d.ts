/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_PASSWORD_RECOVERY_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
