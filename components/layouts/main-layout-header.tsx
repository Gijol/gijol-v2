import Link from 'next/link';

export default function MainLayoutHeader() {
  return (
    <header className="h-fit py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-6xl flex flex-row justify-between mx-auto h-full items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-[#0B62DA] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-900">GradPath</span>
        </Link>

        {/* Navigation */}
        <div className="hidden sm:flex flex-row gap-1 items-center">
          <Link
            href="https://choieungi-project.notion.site/Q-A-9e325eabef4e479a8f47e95eb90bb344"
            rel="noreferrer"
            target="_blank"
            className="no-underline"
          >
            <div className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              자주 묻는 질문
            </div>
          </Link>
          <Link
            href="https://choieungi-project.notion.site/Team-Gijol-e5e279e91a0646c2a84b548873601a3f"
            rel="noreferrer"
            target="_blank"
            className="no-underline"
          >
            <div className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              팀 소개
            </div>
          </Link>
          <div className="w-px h-5 bg-gray-200 mx-2" />
          <Link href="/dashboard" className="no-underline">
            <div className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              로그인
            </div>
          </Link>
          <Link href="/dashboard" className="no-underline ml-2">
            <div className="px-5 py-2.5 bg-[#0B62DA] hover:bg-[#0952B8] text-white rounded-lg transition-colors text-sm font-semibold">
              시작하기
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
