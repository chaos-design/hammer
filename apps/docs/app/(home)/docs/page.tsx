import { cn } from "@docs/utils/utils";
import { Library, Pencil } from "lucide-react";
import Link, { type LinkProps } from "next/link";

export default function DocsPage() {
  return (
    <main className="container z-2 flex flex-1 flex-col items-center justify-center py-24 md:py-36 text-center">
      <h1 className="mb-4 font-semibold text-3xl md:text-4xl">
        快速开始
      </h1>
      <p className="text-foreground/70 text-md">
        选择你需要的文档入口继续浏览。
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 text-start md:grid-cols-3">
        {[
          {
            name: "指南",
            description: "安装、更新日志与使用说明。",
            icon: <Library className="size-full" />,
            href: "/docs/guides",
          },
          {
            name: "组件",
            description: "基础组件与使用示例。",
            icon: <Pencil className="size-full" />,
            href: "/docs/components",
          },
          {
            name: "业务组件",
            description: "业务组件与组合方案。",
            icon: <Pencil className="size-full" />,
            href: "/docs/blocks",
          },
        ].map((item) => (
          <Item href={item.href} key={item.name} className="flex flex-row gap-4">
            <Icon>{item.icon}</Icon>
            <div className="flex flex-col">
              <h2 className="mb-2 font-semibold">{item.name}</h2>
              <p className="text-foreground/70 text-sm">
                {item.description}
              </p>
            </div>
          </Item>
        ))}
      </div>
    </main>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 size-8 rounded-lg  bg-primary p-1 text-foreground/70 border ">
      {children}
    </div>
  );
}

function Item(props: LinkProps & { children: React.ReactNode, className?: string }) {
  return (
    <Link {...props} className={cn("rounded-2xl border bg-card p-4 shadow-lg", props.className)}>
      {props.children}
    </Link>
  );
}
