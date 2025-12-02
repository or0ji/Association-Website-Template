"use client";

import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { menuApi, categoryApi } from "@/lib/api";
import { RichEditor } from "@/components/editor/rich-editor";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";

interface Menu {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  type: "page" | "category";
  page_content: string | null;
  category_id: number | null;
  category_name: string | null;
  sort: number;
  is_visible: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function MenusPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: null as number | null,
    type: "page" as "page" | "category",
    page_content: "",
    category_id: null as number | null,
    sort: 0,
    is_visible: true,
  });

  const loadData = async () => {
    if (!token) return;
    try {
      const [menuData, categoryData] = await Promise.all([
        menuApi.list(token),
        categoryApi.list(token),
      ]);
      setMenus(menuData);
      setCategories(categoryData);
    } catch (error) {
      toast({ title: "加载数据失败", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const openCreateDialog = (parentId: number | null = null) => {
    setEditingMenu(null);
    setFormData({
      name: "",
      slug: "",
      parent_id: parentId,
      type: "page",
      page_content: "",
      category_id: null,
      sort: 0,
      is_visible: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      slug: menu.slug,
      parent_id: menu.parent_id,
      type: menu.type,
      page_content: menu.page_content || "",
      category_id: menu.category_id,
      sort: menu.sort,
      is_visible: menu.is_visible,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!token) return;
    try {
      const data = {
        ...formData,
        page_content: formData.type === "page" ? formData.page_content : null,
        category_id: formData.type === "category" ? formData.category_id : null,
      };

      if (editingMenu) {
        await menuApi.update(token, editingMenu.id, data);
        toast({ title: "菜单更新成功" });
      } else {
        await menuApi.create(token, data);
        toast({ title: "菜单创建成功" });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({ title: "操作失败", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (menu: Menu) => {
    if (!token) return;
    if (!confirm(`确定删除菜单"${menu.name}"吗？`)) return;
    try {
      await menuApi.delete(token, menu.id);
      toast({ title: "删除成功" });
      loadData();
    } catch (error: any) {
      toast({ title: "删除失败", description: error.message, variant: "destructive" });
    }
  };

  // Build tree structure
  const topMenus = menus.filter((m) => !m.parent_id);
  const getChildren = (parentId: number) =>
    menus.filter((m) => m.parent_id === parentId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">菜单管理</h1>
            <p className="text-muted-foreground">管理网站导航菜单结构</p>
          </div>
          <Button onClick={() => openCreateDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            添加一级菜单
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">菜单名称</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>关联分类</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>显示</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMenus.map((menu) => (
                  <>
                    <TableRow key={menu.id}>
                      <TableCell className="font-medium">{menu.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {menu.slug}
                      </TableCell>
                      <TableCell>
                        {menu.type === "page" ? "单页" : "文章分类"}
                      </TableCell>
                      <TableCell>{menu.category_name || "-"}</TableCell>
                      <TableCell>{menu.sort}</TableCell>
                      <TableCell>
                        {menu.is_visible ? "显示" : "隐藏"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCreateDialog(menu.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(menu)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(menu)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {getChildren(menu.id).map((child) => (
                      <TableRow key={child.id} className="bg-muted/30">
                        <TableCell className="font-medium pl-8">
                          <ChevronRight className="inline h-4 w-4 mr-1" />
                          {child.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {child.slug}
                        </TableCell>
                        <TableCell>
                          {child.type === "page" ? "单页" : "文章分类"}
                        </TableCell>
                        <TableCell>{child.category_name || "-"}</TableCell>
                        <TableCell>{child.sort}</TableCell>
                        <TableCell>
                          {child.is_visible ? "显示" : "隐藏"}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(child)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(child)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? "编辑菜单" : "添加菜单"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>菜单名称</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="如：协会简介"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL标识)</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="如：about-intro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>菜单类型</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: "page" | "category") =>
                      setFormData({ ...formData, type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">单页富文本</SelectItem>
                      <SelectItem value="category">文章分类</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>排序值</Label>
                  <Input
                    type="number"
                    value={formData.sort}
                    onChange={(e) =>
                      setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>是否显示</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      checked={formData.is_visible}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, is_visible: v })
                      }
                    />
                  </div>
                </div>
              </div>

              {formData.type === "category" && (
                <div className="space-y-2">
                  <Label>关联分类</Label>
                  <Select
                    value={formData.category_id?.toString() || ""}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category_id: parseInt(v) })
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
              )}

              {formData.type === "page" && (
                <div className="space-y-2">
                  <Label>页面内容</Label>
                  <RichEditor
                    content={formData.page_content}
                    onChange={(content) =>
                      setFormData({ ...formData, page_content: content })
                    }
                  />
                </div>
              )}
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

