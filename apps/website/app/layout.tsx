import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChatAssistant } from "@/components/chat-assistant";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "山西省电力工程企业协会",
  description: "山西省电力工程企业协会官方网站",
};

async function getLayoutData() {
  try {
    const [menus, settings] = await Promise.all([
      api.getMenuTree(),
      api.getSettings(),
    ]);
    return { menus, settings };
  } catch (error) {
    console.error("Failed to load layout data:", error);
    return { menus: [], settings: {} };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { menus, settings } = await getLayoutData();

  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header menus={menus} settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} menus={menus} />
        <ChatAssistant />
      </body>
    </html>
  );
}

