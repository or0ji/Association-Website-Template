import { api } from "@/lib/api";
import { BannerCarousel } from "@/components/banner-carousel";
import { QuickLinks } from "@/components/quick-links";
import { TabbedNewsList, NewsList } from "@/components/news-list";

async function getHomeData() {
  try {
    const [banners, latestNews, settings] = await Promise.all([
      api.getBanners(),
      api.getLatestArticles(20),
      api.getSettings(),
    ]);

    // Group articles by category
    const industryNews = latestNews.filter(
      (a) => a.category_name === "行业新闻"
    );
    const associationNews = latestNews.filter(
      (a) => a.category_name === "协会动态"
    );
    const notices = latestNews.filter(
      (a) => a.category_name === "通知公告"
    );

    return {
      banners,
      latestNews,
      industryNews,
      associationNews,
      notices,
      settings,
    };
  } catch (error) {
    console.error("Failed to load home data:", error);
    return {
      banners: [],
      latestNews: [],
      industryNews: [],
      associationNews: [],
      notices: [],
      settings: {},
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  const tabs = [
    {
      id: "notice",
      title: "通知公告",
      articles: data.notices,
      moreLink: "/category/notice",
    },
    {
      id: "industry",
      title: "行业新闻",
      articles: data.industryNews,
      moreLink: "/category/news-industry",
    },
    {
      id: "association",
      title: "协会动态",
      articles: data.associationNews,
      moreLink: "/category/news-association",
    },
  ];

  return (
    <>
      {/* Banner Carousel */}
      <BannerCarousel banners={data.banners} />

      {/* Quick Links */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <QuickLinks />
        </div>
      </section>

      {/* News Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Tabbed News (left side) */}
            <div className="lg:col-span-2">
              <TabbedNewsList tabs={tabs} />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Featured Articles */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4">
                  热门文章
                </h3>
                <ul className="space-y-3">
                  {data.latestNews.slice(0, 5).map((article, index) => (
                    <li key={article.id}>
                      <a
                        href={`/article/${article.id}`}
                        className="group flex items-start gap-3"
                      >
                        <span
                          className={`w-6 h-6 flex-shrink-0 rounded flex items-center justify-center text-sm font-bold ${
                            index < 3
                              ? "bg-primary text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700 group-hover:text-primary line-clamp-2">
                          {article.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div className="bg-primary text-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">联系我们</h3>
                <div className="space-y-3 text-sm">
                  {data.settings.site_phone && (
                    <p>
                      <span className="opacity-70">电话：</span>
                      {data.settings.site_phone}
                    </p>
                  )}
                  {data.settings.site_email && (
                    <p>
                      <span className="opacity-70">邮箱：</span>
                      {data.settings.site_email}
                    </p>
                  )}
                  {data.settings.site_address && (
                    <p>
                      <span className="opacity-70">地址：</span>
                      {data.settings.site_address}
                    </p>
                  )}
                </div>
                <a
                  href="/page/contact"
                  className="inline-block mt-4 px-4 py-2 bg-white text-primary rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  查看详情
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Cards */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <NewsList
            articles={data.latestNews.slice(0, 8)}
            title="最新动态"
            showMore={true}
            moreLink="/category/news-industry"
            layout="card"
          />
        </div>
      </section>
    </>
  );
}

