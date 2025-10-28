"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return <>{children}</>;
}


