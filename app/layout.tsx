import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { TeamCrestResolverProvider } from "@/components/assets/TeamCrestResolverProvider";
import { SeasonProvider } from "@/components/season/SeasonProvider";
import { HomeLayoutProvider } from "@/components/home/HomeLayoutProvider";
import { MediaRaiSectionsProvider } from "@/components/media-rai/MediaRaiSectionsProvider";
import { EditorBottomSpacer } from "@/components/inline-editing/EditorBottomSpacer";
import {
  InlineEditingProvider,
  InlineEditingToolbar,
} from "@/components/inline-editing/InlineEditingProvider";
import { AppDialogProvider } from "@/components/AppDialogProvider";
import { InlineEditingMarketEditShell } from "@/components/inline-editing/InlineEditingMarketEditShell";
import { fetchHomeGlobalInlineOverridesServer, fetchInlineOverridesServer, fetchMediaRaiInlineOverridesServer } from "@/lib/cms/inline-overrides-server";
import { fetchDefaultSeasonIdServer } from "@/lib/cms/seasons-server";
import type { CompetitionSeasonId } from "@/data/mock";
import { bebasNeue, kalam, spaceMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "RAI1903 | Real Avilés Industrial",
  description: "Plataforma no oficial blanquiazul sobre el Real Avilés Industrial.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/logo.png",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const defaultSeasonId = (await fetchDefaultSeasonIdServer()) as CompetitionSeasonId;
  const [seasonOverrides, mediaRaiOverrides, homeGlobalOverrides] = await Promise.all([
    fetchInlineOverridesServer(defaultSeasonId),
    fetchMediaRaiInlineOverridesServer(),
    fetchHomeGlobalInlineOverridesServer(),
  ]);
  const initialOverrides = { ...seasonOverrides, ...mediaRaiOverrides, ...homeGlobalOverrides };

  return (
    <html lang="es">
      <body className={`${bebasNeue.variable} ${kalam.variable} ${spaceMono.variable}`}>
        <AppDialogProvider>
          <SeasonProvider defaultSeasonId={defaultSeasonId}>
            <InlineEditingProvider initialOverrides={initialOverrides}>
              <InlineEditingMarketEditShell>
                <HomeLayoutProvider>
                  <MediaRaiSectionsProvider>
                    <TeamCrestResolverProvider>
                      <div className="min-h-screen athletic-shell">
                        <Header />
                        <main className="mx-auto max-w-[1480px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
                          {children}
                          <EditorBottomSpacer />
                        </main>
                      </div>
                    </TeamCrestResolverProvider>
                    <InlineEditingToolbar />
                  </MediaRaiSectionsProvider>
                </HomeLayoutProvider>
              </InlineEditingMarketEditShell>
            </InlineEditingProvider>
          </SeasonProvider>
        </AppDialogProvider>
      </body>
    </html>
  );
}
