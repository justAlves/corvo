import { Button } from "@/components/ui/button";

const providers = {
  google: {
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <path
          fill="#4285F4"
          d="M22 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.6c-.3 1.3-1 2.4-2.2 3.1v2.6h3.6c2.1-2 3-4.8 3-7.5z"
        />
        <path
          fill="#34A853"
          d="M12 22c3 0 5.5-1 7.3-2.7l-3.6-2.6c-1 .7-2.3 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.5H2.2v2.7C4 19.6 7.7 22 12 22z"
        />
        <path
          fill="#FBBC05"
          d="M5.9 13.3c-.2-.7-.4-1.4-.4-2.3s.1-1.6.4-2.3V6H2.2C1.4 7.5 1 9.2 1 11s.4 3.5 1.2 5l3.7-2.7z"
        />
        <path
          fill="#EA4335"
          d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.5 2 15 1 12 1 7.7 1 4 3.4 2.2 6.9l3.7 2.7C6.8 7.3 9.2 5.4 12 5.4z"
        />
      </svg>
    ),
  },
  apple: {
    label: "Apple",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="currentColor"
        aria-hidden
      >
        <path d="M17.05 12.5c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.5 1.3-.1 1.8-.9 3.4-.9s2 .9 3.4.9c1.4 0 2.3-1.2 3.1-2.5.6-.8 1.1-1.8 1.4-2.8-1.6-.6-3.3-2.1-3.3-4.3zm-2.7-7.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.5-.6.8-1.2 2-1.1 3.2 1.2.1 2.3-.6 3-1.4z" />
      </svg>
    ),
  },
} as const;

interface OAuthButtonProps {
  provider: keyof typeof providers;
}

export function OAuthButton({ provider }: OAuthButtonProps) {
  const p = providers[provider];
  return (
    <Button type="button" variant="outline" className="w-full gap-2">
      {p.icon}
      <span>Continuar com {p.label}</span>
    </Button>
  );
}
