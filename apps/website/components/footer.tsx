import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import type { Settings, MenuItem } from "@/lib/api";

interface FooterProps {
  settings: Settings;
  menus: MenuItem[];
}

export function Footer({ settings, menus }: FooterProps) {
  // Get top-level menu items for footer links
  const footerLinks = menus.filter((m) => m.slug !== "home").slice(0, 6);

  return (
    <footer className="bg-gray-800 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              {settings.site_name || "山西省电力工程企业协会"}
            </h3>
            <p className="text-sm leading-relaxed">
              服务会员企业，促进行业发展，为山西省电力工程建设事业贡献力量。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">快速链接</h3>
            <ul className="space-y-2">
              {footerLinks.map((menu) => (
                <li key={menu.id}>
                  <Link
                    href={
                      menu.type === "page"
                        ? `/page/${menu.slug}`
                        : `/category/${menu.slug}`
                    }
                    className="text-sm hover:text-white transition-colors"
                  >
                    {menu.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">联系我们</h3>
            <ul className="space-y-3">
              {settings.site_address && (
                <li className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{settings.site_address}</span>
                </li>
              )}
              {settings.site_phone && (
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{settings.site_phone}</span>
                </li>
              )}
              {settings.site_email && (
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>{settings.site_email}</span>
                </li>
              )}
            </ul>
          </div>

          {/* QR Code placeholder */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">关注我们</h3>
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400 text-xs p-2">
                <div className="w-24 h-24 bg-gray-200 mb-1 rounded flex items-center justify-center">
                  二维码
                </div>
                <span>扫码关注公众号</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
            <p>
              {settings.site_copyright ||
                `© ${new Date().getFullYear()} ${settings.site_name || "山西省电力工程企业协会"} 版权所有`}
            </p>
            {settings.site_icp && (
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {settings.site_icp}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

