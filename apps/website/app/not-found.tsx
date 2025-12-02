import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-medium text-gray-700 mt-4">
          页面未找到
        </h2>
        <p className="text-gray-500 mt-2">
          您访问的页面不存在或已被删除
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

