import Link from "next/link";
import { FileText, Users, BookOpen, Phone } from "lucide-react";

const links = [
  {
    icon: FileText,
    title: "协会简介",
    description: "了解协会基本情况",
    href: "/page/about-intro",
    color: "bg-blue-500",
  },
  {
    icon: Users,
    title: "入会指南",
    description: "会员申请流程",
    href: "/page/member-guide",
    color: "bg-green-500",
  },
  {
    icon: BookOpen,
    title: "政策法规",
    description: "行业政策文件",
    href: "/category/policy",
    color: "bg-orange-500",
  },
  {
    icon: Phone,
    title: "联系我们",
    description: "联系方式查询",
    href: "/page/contact",
    color: "bg-purple-500",
  },
];

export function QuickLinks() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {links.map((link) => (
        <Link
          key={link.title}
          href={link.href}
          className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <div
            className={`w-14 h-14 ${link.color} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
          >
            <link.icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-medium text-gray-800 group-hover:text-primary">
            {link.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{link.description}</p>
        </Link>
      ))}
    </div>
  );
}

