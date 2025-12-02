"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { settingsApi } from "@/lib/api";

export default function SettingsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "",
    site_icp: "",
    site_phone: "",
    site_address: "",
    site_email: "",
    site_copyright: "",
  });

  useEffect(() => {
    if (token) {
      settingsApi
        .get(token)
        .then((data) => {
          setSettings({
            site_name: data.site_name || "",
            site_icp: data.site_icp || "",
            site_phone: data.site_phone || "",
            site_address: data.site_address || "",
            site_email: data.site_email || "",
            site_copyright: data.site_copyright || "",
          });
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));
      await settingsApi.update(token, settingsArray);
      toast({ title: "设置保存成功" });
    } catch (error: any) {
      toast({ title: "保存失败", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">网站设置</h1>
          <p className="text-muted-foreground">配置网站基本信息</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>网站名称和联系方式</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>网站名称</Label>
              <Input
                value={settings.site_name}
                onChange={(e) =>
                  setSettings({ ...settings, site_name: e.target.value })
                }
                placeholder="山西省电力工程企业协会"
              />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input
                value={settings.site_phone}
                onChange={(e) =>
                  setSettings({ ...settings, site_phone: e.target.value })
                }
                placeholder="0351-XXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>联系邮箱</Label>
              <Input
                type="email"
                value={settings.site_email}
                onChange={(e) =>
                  setSettings({ ...settings, site_email: e.target.value })
                }
                placeholder="contact@sxpeea.cn"
              />
            </div>
            <div className="space-y-2">
              <Label>办公地址</Label>
              <Textarea
                value={settings.site_address}
                onChange={(e) =>
                  setSettings({ ...settings, site_address: e.target.value })
                }
                placeholder="山西省太原市..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>备案信息</CardTitle>
            <CardDescription>网站底部显示的备案和版权信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ICP备案号</Label>
              <Input
                value={settings.site_icp}
                onChange={(e) =>
                  setSettings({ ...settings, site_icp: e.target.value })
                }
                placeholder="晋ICP备XXXXXXXX号"
              />
            </div>
            <div className="space-y-2">
              <Label>版权信息</Label>
              <Input
                value={settings.site_copyright}
                onChange={(e) =>
                  setSettings({ ...settings, site_copyright: e.target.value })
                }
                placeholder="© 2024 山西省电力工程企业协会 版权所有"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存设置"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}

