import Link from 'next/link';


export default function MainLayoutHeader() {
  return (
    <header className="h-fit p-3 sticky top-0 bg-white dark:bg-slate-950 z-50 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-[1023px] flex flex-row justify-between mx-auto h-full items-center">
        <h2 className="m-0 font-bold text-xl">🎓 Gijol.v2</h2>
        <div className="hidden sm:flex flex-row gap-2 items-center">
          <Link
            href="https://choieungi-project.notion.site/Q-A-9e325eabef4e479a8f47e95eb90bb344"
            rel="noreferrer"
            target="_blank"
            className="no-underline h-full"
          >
            <div className="h-fit px-3 py-2 no-underline text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              자주 묻는 질문
            </div>
          </Link>
          <Link
            href="https://choieungi-project.notion.site/Team-Gijol-e5e279e91a0646c2a84b548873601a3f"
            rel="noreferrer"
            target="_blank"
            className="no-underline"
          >
            <div className="h-fit px-3 py-2 no-underline text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base">
              팀 소개
            </div>
          </Link>
          <Link
            href="/dashboard"
            rel="noreferrer"
            target="_blank"
            className="no-underline"
          >
            <div className="h-fit px-3 py-2 no-underline text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              대쉬보드
            </div>
          </Link>

        </div>
      </div>
    </header>
  );
}
