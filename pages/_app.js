import React from "react";
import { ThemeProvider } from "next-themes";
import "tailwindcss/tailwind.css";

import { useRouter } from "next/router";
import { appWithTranslation } from "next-i18next";

import { setDisplay, Loading } from "@/components/common/overlay";
import { subscribe } from "@/utils/event";

function MyApp({ Component, pageProps }) {
  const _router = useRouter();
  const _loadingRef = React.useRef();

  React.useEffect(() => {
    const unsubscribes = [
      subscribe("apiRequest", ({ detail }) => {
        setDisplay(_loadingRef, detail.requesting);
        if (detail.error) {
          _router.replace(`/error?message=${detail.error.message}`);
          return;
        }

        return;
      })
    ];

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [_router]);

  return (
    <React.Fragment>
      <ThemeProvider defaultTheme="light">
        <Component {...pageProps} />
        <Loading ref={_loadingRef} />
      </ThemeProvider>
    </React.Fragment>
  );
}

export default appWithTranslation(MyApp);
