import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";
import { Pagination } from "@/components/pagination";
import { formatDate } from "@/lib/utils";
import { Pin } from "lucide-react";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

async function getCategoryData(slug: string, page: number) {
  try {
    const data = await api.getCategory(slug, page, 15);
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const data = await getCategoryData(params.slug, 1);
  if (!data) return { title: "分类未找到" };

  return {
    title: `${data.category.name} - 山西省电力工程企业协会`,
    description: data.category.description || data.category.name,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const page = parseInt(searchParams.page || "1");
  const data = await getCategoryData(params.slug, page);

  if (!data) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">{data.category.name}</h1>
          {data.category.description && (
            <p className="mt-2 text-white/80">{data.category.description}</p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4">
        <Breadcrumb items={[{ label: data.category.name }]} />
      </div>

      {/* Article List */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-sm">
          {data.items.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-100">
                {data.items.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/article/${article.id}`}
                      className="group flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors"
                    >
                      {/* Cover Image */}
                      {article.cover && (
                        <div className="w-48 h-32 flex-shrink-0 rounded overflow-hidden hidden md:block">
                          <img
                            src={article.cover}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-medium text-gray-800 group-hover:text-primary transition-colors mb-2">
                          {article.is_top && (
                            <span className="inline-flex items-center gap-1 text-sm bg-red-500 text-white px-2 py-0.5 rounded mr-2">
                              <Pin className="h-3 w-3" />
                              置顶
                            </span>
                          )}
                          {article.title}
                        </h2>
                        {article.summary && (
                          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                            {article.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{formatDate(article.published_at)}</span>
                          <span>阅读 {article.view_count}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <div className="p-6 border-t border-gray-100">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.total_pages}
                  baseUrl={`/category/${params.slug}`}
                />
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">
              暂无文章
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

