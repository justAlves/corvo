"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { getMySubscription, isSubscriptionActive } from "@/lib/billing";
import { getOnboardingState } from "@/lib/onboarding";

const BILLING_PATH = "/dashboard/billing";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [onboarding, subscription] = await Promise.all([
          getOnboardingState(),
          getMySubscription(),
        ]);
        if (cancelled) return;

        if (!onboarding.completed) {
          router.replace("/onboarding");
          return;
        }

        if (!isSubscriptionActive(subscription.status) && pathname !== BILLING_PATH) {
          router.replace(BILLING_PATH);
          return;
        }

        setReady(true);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (!ready) return null;

  return <>{children}</>;
}
