import Link from 'next/link';
import Image from 'next/image';

export default function MainLayoutHeader() {
  return (
    <header className="sticky top-0 z-50 h-fit border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl flex-row items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image
            src="/images/gijol_3d_icon.png"
            alt="Gijol"
            width={38}
            height={38}
            className="drop-shadow-md transition-transform duration-200 hover:scale-110"
          />
          <span className="text-xl font-bold text-gray-900">Gijol</span>
        </Link>

        {/* Navigation */}
        <div className="hidden flex-row items-center gap-1 sm:flex">
          <Link
            href="https://choieungi-project.notion.site/Q-A-9e325eabef4e479a8f47e95eb90bb344"
            rel="noreferrer"
            target="_blank"
            className="no-underline"
          >
            <div className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
              자주 묻는 질문
            </div>
          </Link>
          <Link
            href="https://choieungi-project.notion.site/Team-Gijol-e5e279e91a0646c2a84b548873601a3f"
            rel="noreferrer"
            target="_blank"
            className="no-underline"
          >
            <div className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
              팀 소개
            </div>
          </Link>
          <Link href="/dashboard" className="ml-2 no-underline">
            <div className="rounded-lg bg-[#0B62DA] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0952B8]">
              시작하기
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
