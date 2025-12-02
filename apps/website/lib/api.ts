// 服务端渲染时需要完整URL，客户端可以使用相对路径
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  console.log("Fetching:", url); // 调试用
  
  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 60 seconds
    cache: "no-store", // 开发时禁用缓存便于调试
  });

  if (!response.ok) {
    console.error(`API error: ${response.status} for ${url}`);
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Types
export interface MenuItem {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  type: "page" | "category";
  page_content: string | null;
  category_id: number | null;
  sort: number;
  is_visible: boolean;
  children: MenuItem[];
  category_name: string | null;
}

export interface Banner {
  id: number;
  title: string | null;
  image: string;
  link: string | null;
  sort: number;
  is_active: boolean;
}

export interface Article {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  summary: string | null;
  content?: string;
  category_id: number | null;
  category_name?: string | null;
  is_top: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  prev_article?: { id: number; title: string } | null;
  next_article?: { id: number; title: string } | null;
}

export interface CategoryPage {
  category: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };
  items: Article[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PageContent {
  id: number;
  name: string;
  slug: string;
  content: string | null;
}

export interface Settings {
  site_name?: string;
  site_icp?: string;
  site_phone?: string;
  site_address?: string;
  site_email?: string;
  site_copyright?: string;
}

// API Functions
export const api = {
  getMenuTree: () => fetchAPI<MenuItem[]>("/api/menus/tree"),

  getPage: (slug: string) => fetchAPI<PageContent>(`/api/pages/${slug}`),

  getCategory: (slug: string, page = 1, pageSize = 10) =>
    fetchAPI<CategoryPage>(
      `/api/categories/${slug}?page=${page}&page_size=${pageSize}`
    ),

  getArticle: (id: number) => fetchAPI<Article>(`/api/articles/${id}`),

  getLatestArticles: (limit = 10, categoryId?: number) => {
    let url = `/api/articles/latest?limit=${limit}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    return fetchAPI<Article[]>(url);
  },

  getBanners: () => fetchAPI<Banner[]>("/api/banners"),

  getSettings: () => fetchAPI<Settings>("/api/settings"),
};

