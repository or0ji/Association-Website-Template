import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";

interface PageProps {
  params: { slug: string };
}

async function getPageData(slug: string) {
  try {
    const page = await api.getPage(slug);
    return page;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const page = await getPageData(params.slug);
  if (!page) return { title: "页面未找到" };

  return {
    title: `${page.name} - 山西省电力工程企业协会`,
    description: page.name,
  };
}

export default async function SinglePage({ params }: PageProps) {
  const page = await getPageData(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">{page.name}</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4">
        <Breadcrumb items={[{ label: page.name }]} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: page.content || "" }}
          />
        </div>
      </div>
    </div>
  );
}

