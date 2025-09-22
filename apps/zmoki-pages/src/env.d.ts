/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
  readonly PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY: string;
  readonly PUBLIC_BREVO_ACCOUNT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
