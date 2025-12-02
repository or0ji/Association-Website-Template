"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => `${baseUrl}?page=${page}`;

  // Generate page numbers to show
  const pages: (number | string)[] = [];
  const showEllipsis = totalPages > 7;

  if (!showEllipsis) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-4 w-4" />
          上一页
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          上一页
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(page as number)}
            className={cn(
              "px-3 py-2 text-sm rounded min-w-[40px] text-center",
              currentPage === page
                ? "bg-primary text-white"
                : "text-gray-600 hover:text-primary hover:bg-gray-100"
            )}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-100 rounded"
        >
          下一页
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
          下一页
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

