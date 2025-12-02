"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderTree, Menu, Image } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { statsApi } from "@/lib/api";

interface Stats {
  total_articles: number;
  published_articles: number;
  total_categories: number;
  total_menus: number;
  total_banners: number;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (token) {
      statsApi.get(token).then(setStats).catch(console.error);
    }
  }, [token]);

  const statCards = [
    {
      title: "文章总数",
      value: stats?.total_articles || 0,
      description: `已发布 ${stats?.published_articles || 0} 篇`,
      icon: FileText,
    },
    {
      title: "分类数量",
      value: stats?.total_categories || 0,
      description: "文章分类",
      icon: FolderTree,
    },
    {
      title: "菜单数量",
      value: stats?.total_menus || 0,
      description: "导航菜单",
      icon: Menu,
    },
    {
      title: "轮播图",
      value: stats?.total_banners || 0,
      description: "启用中",
      icon: Image,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">控制台</h1>
          <p className="text-muted-foreground">欢迎使用协会网站后台管理系统</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>快速入口</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <a
              href="/articles/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">发布文章</p>
                <p className="text-sm text-muted-foreground">创建新文章</p>
              </div>
            </a>
            <a
              href="/menus"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <Menu className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">管理菜单</p>
                <p className="text-sm text-muted-foreground">配置导航结构</p>
              </div>
            </a>
            <a
              href="/banners"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <Image className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">轮播图</p>
                <p className="text-sm text-muted-foreground">管理首页轮播</p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

