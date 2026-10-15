import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <header className="border-b border-line bg-bg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-ink">
            알바 관리자
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-ink-sub">
            <Link href="/" className="hover:text-ink">
              출퇴근 화면
            </Link>
            <Link href="/admin/employees" className="hover:text-ink">
              직원 관리
            </Link>
            <Link href="/admin/records" className="hover:text-ink">
              근무 기록
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
