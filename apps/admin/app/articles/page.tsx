"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { articleApi, categoryApi } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  summary: string | null;
  category_id: number | null;
  category_name: string | null;
  is_published: boolean;
  is_top: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ArticlesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const loadData = async () => {
    if (!token) return;
    try {
      const params: Record<string, any> = { page, page_size: 20 };
      if (keyword) params.keyword = keyword;
      if (filterCategory) params.category_id = filterCategory;
      if (filterStatus) params.is_published = filterStatus === "published";

      const data = await articleApi.list(token, params);
      setArticles(data.items);
      setTotal(data.total);

      const catData = await categoryApi.list(token);
      setCategories(catData);
    } catch (error) {
      toast({ title: "加载数据失败", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadData();
  }, [token, page]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleDelete = async (article: Article) => {
    if (!token) return;
    if (!confirm(`确定删除文章"${article.title}"吗？`)) return;
    try {
      await articleApi.delete(token, article.id);
      toast({ title: "删除成功" });
      loadData();
    } catch (error: any) {
      toast({ title: "删除失败", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">文章管理</h1>
            <p className="text-muted-foreground">管理所有文章内容</p>
          </div>
          <Button onClick={() => router.push("/articles/new")}>
            <Plus className="mr-2 h-4 w-4" />
            发布文章
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="搜索文章标题..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="全部分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部分类</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>置顶</TableHead>
                  <TableHead>浏览量</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>{article.id}</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>{article.category_name || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          article.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {article.is_published ? "已发布" : "草稿"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {article.is_top ? (
                        <span className="text-orange-500">是</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{article.view_count}</TableCell>
                    <TableCell>
                      {article.published_at
                        ? formatDate(article.published_at)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/articles/${article.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(article)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {articles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      暂无文章
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span className="flex items-center px-4">
              第 {page} 页，共 {Math.ceil(total / 20)} 页
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

