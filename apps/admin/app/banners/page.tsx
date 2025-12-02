"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { bannerApi } from "@/lib/api";
import { ImageUpload } from "@/components/image-upload";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Banner {
  id: number;
  title: string | null;
  image: string;
  link: string | null;
  sort: number;
  is_active: boolean;
  created_at: string;
}

export default function BannersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    link: "",
    sort: 0,
    is_active: true,
  });

  const loadData = async () => {
    if (!token) return;
    try {
      const data = await bannerApi.list(token);
      setBanners(data);
    } catch (error) {
      toast({ title: "加载数据失败", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const openCreateDialog = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      image: "",
      link: "",
      sort: 0,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      image: banner.image,
      link: banner.link || "",
      sort: banner.sort,
      is_active: banner.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!formData.image) {
      toast({ title: "请上传图片", variant: "destructive" });
      return;
    }

    try {
      if (editingBanner) {
        await bannerApi.update(token, editingBanner.id, formData);
        toast({ title: "轮播图更新成功" });
      } else {
        await bannerApi.create(token, formData);
        toast({ title: "轮播图创建成功" });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({ title: "操作失败", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!token) return;
    if (!confirm("确定删除这个轮播图吗？")) return;
    try {
      await bannerApi.delete(token, banner.id);
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
            <h1 className="text-2xl font-bold">轮播图管理</h1>
            <p className="text-muted-foreground">管理首页轮播图</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            添加轮播图
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">预览</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>链接</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <img
                        src={banner.image}
                        alt={banner.title || "Banner"}
                        className="h-12 w-20 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {banner.title || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {banner.link || "-"}
                    </TableCell>
                    <TableCell>{banner.sort}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          banner.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {banner.is_active ? "启用" : "禁用"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(banner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(banner)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {banners.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      暂无轮播图
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "编辑轮播图" : "添加轮播图"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>图片 *</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              </div>
              <div className="space-y-2">
                <Label>标题（可选）</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="轮播图标题"
                />
              </div>
              <div className="space-y-2">
                <Label>链接（可选）</Label>
                <Input
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="点击跳转链接"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>排序值</Label>
                  <Input
                    type="number"
                    value={formData.sort}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>是否启用</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, is_active: v })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

