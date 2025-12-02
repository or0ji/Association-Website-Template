"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { articleApi, categoryApi } from "@/lib/api";
import { RichEditor } from "@/components/editor/rich-editor";
import { ImageUpload } from "@/components/image-upload";
import { ArrowLeft } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    cover: "",
    summary: "",
    content: "",
    category_id: null as number | null,
    is_published: false,
    is_top: false,
  });

  useEffect(() => {
    if (token) {
      categoryApi.list(token).then(setCategories).catch(console.error);
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!token) return;
    if (!formData.title) {
      toast({ title: "请填写文章标题", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await articleApi.create(token, formData);
      toast({ title: "文章创建成功" });
      router.push("/articles");
    } catch (error: any) {
      toast({ title: "创建失败", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">发布文章</h1>
            <p className="text-muted-foreground">创建新文章</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>文章内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>标题 *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="输入文章标题"
                  />
                </div>
                <div className="space-y-2">
                  <Label>摘要</Label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    placeholder="简短描述文章内容（可选）"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>正文</Label>
                  <RichEditor
                    content={formData.content}
                    onChange={(content) =>
                      setFormData({ ...formData, content })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Select
                    value={formData.category_id?.toString() || ""}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        category_id: v ? parseInt(v) : null,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>立即发布</Label>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_published: v })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>置顶显示</Label>
                  <Switch
                    checked={formData.is_top}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_top: v })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>封面图</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={formData.cover}
                  onChange={(url) => setFormData({ ...formData, cover: url })}
                />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "提交中..." : "保存"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

