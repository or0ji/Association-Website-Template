import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";
import { formatDate } from "@/lib/utils";
import { Eye, Calendar, ArrowLeft, ArrowRight } from "lucide-react";

interface ArticlePageProps {
  params: { id: string };
}

async function getArticleData(id: number) {
  try {
    const article = await api.getArticle(id);
    return article;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getArticleData(parseInt(params.id));
  if (!article) return { title: "文章未找到" };

  return {
    title: `${article.title} - 山西省电力工程企业协会`,
    description: article.summary || article.title,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleData(parseInt(params.id));

  if (!article) {
    notFound();
  }

  const breadcrumbItems = [];
  if (article.category_name) {
    breadcrumbItems.push({
      label: article.category_name,
      // We don't have the slug here, so we'll just show the name
    });
  }
  breadcrumbItems.push({ label: article.title });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 mt-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              阅读 {article.view_count}
            </span>
            {article.category_name && (
              <span className="bg-white/20 px-2 py-0.5 rounded">
                {article.category_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover Image */}
          {article.cover && (
            <div className="aspect-video max-h-96 overflow-hidden">
              <img
                src={article.cover}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {article.summary && (
              <div className="bg-gray-50 border-l-4 border-primary p-4 mb-8 text-gray-600">
                <strong>摘要：</strong>
                {article.summary}
              </div>
            )}

            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {article.prev_article ? (
                <Link
                  href={`/article/${article.prev_article.id}`}
                  className="group flex items-center gap-2 text-gray-600 hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-400">上一篇</span>
                    <p className="truncate group-hover:text-primary">
                      {article.prev_article.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <span className="text-gray-400 text-sm">没有上一篇了</span>
              )}

              {article.next_article ? (
                <Link
                  href={`/article/${article.next_article.id}`}
                  className="group flex items-center gap-2 text-gray-600 hover:text-primary text-right"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-gray-400">下一篇</span>
                    <p className="truncate group-hover:text-primary">
                      {article.next_article.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="text-gray-400 text-sm text-right">
                  没有下一篇了
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

