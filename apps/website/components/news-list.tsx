"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pin } from "lucide-react";
import type { Article } from "@/lib/api";
import { formatDate, formatDateShort, truncate, cn } from "@/lib/utils";

interface NewsListProps {
  articles: Article[];
  title?: string;
  showMore?: boolean;
  moreLink?: string;
  layout?: "list" | "card";
}

export function NewsList({
  articles,
  title,
  showMore = true,
  moreLink = "/category/news",
  layout = "list",
}: NewsListProps) {
  if (layout === "card") {
    return (
      <div className="space-y-4">
        {title && (
          <div className="flex items-center justify-between border-b-2 border-primary pb-2">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {showMore && (
              <Link
                href={moreLink}
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
              >
                更多 <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {articles.slice(0, 4).map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {article.cover && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.cover}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 group-hover:text-primary line-clamp-2 mb-2">
                  {article.is_top && (
                    <Pin className="inline h-4 w-4 text-red-500 mr-1" />
                  )}
                  {article.title}
                </h3>
                {article.summary && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {article.summary}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {formatDate(article.published_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between border-b-2 border-primary pb-2">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {showMore && (
            <Link
              href={moreLink}
              className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
            >
              更多 <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/article/${article.id}`}
              className="group flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              <span className="flex-1 text-gray-700 group-hover:text-primary transition-colors line-clamp-1">
                {article.is_top && (
                  <span className="inline-block bg-red-500 text-white text-xs px-1.5 py-0.5 rounded mr-2">
                    置顶
                  </span>
                )}
                {article.title}
              </span>
              <span className="text-sm text-gray-400 whitespace-nowrap">
                {formatDate(article.published_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Tab-based news list for homepage
interface TabbedNewsListProps {
  tabs: {
    id: string;
    title: string;
    articles: Article[];
    moreLink: string;
  }[];
}

export function TabbedNewsList({ tabs }: TabbedNewsListProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  if (!tabs || tabs.length === 0) return null;

  const activeTabData = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 px-4 text-center font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-primary bg-primary/5"
                : "text-gray-600 hover:text-primary"
            )}
          >
            {tab.title}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        <ul className="space-y-2">
          {activeTabData.articles.slice(0, 8).map((article) => (
            <li key={article.id}>
              <Link
                href={`/article/${article.id}`}
                className="group flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
              >
                <span className="w-16 text-center text-sm bg-gray-100 text-gray-500 py-1 rounded">
                  {formatDateShort(article.published_at)}
                </span>
                <span className="flex-1 text-gray-700 group-hover:text-primary transition-colors truncate">
                  {article.is_top && (
                    <Pin className="inline h-3 w-3 text-red-500 mr-1" />
                  )}
                  {article.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-center">
          <Link
            href={activeTabData.moreLink}
            className="text-sm text-primary hover:underline"
          >
            查看更多 →
          </Link>
        </div>
      </div>
    </div>
  );
}

