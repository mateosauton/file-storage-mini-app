import { ReactNode, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize MiniKit when component mounts
    MiniKit.install();

    // Check if we're running inside World App
    const isInWorldApp = MiniKit.isInstalled();
    console.log("Running in World App:", isInWorldApp);
  }, []);

  return <>{children}</>;
}
