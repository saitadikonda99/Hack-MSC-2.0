import Image from "next/image";
import { HiChartBar, HiUpload } from 'react-icons/hi';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to CivicIndia
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Your Smart City Issue Management Platform. Report civic issues, track their resolution, and help build better communities together.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-white transition-colors hover:bg-zinc-800 md:w-[158px]"
            href="/dashboard"
          >
            <HiChartBar className="text-lg" />
            View Dashboard
          </a>
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-zinc-900 px-5 text-zinc-900 transition-colors hover:bg-zinc-50 md:w-[158px]"
            href="/report"
          >
            <HiUpload className="text-lg" />
            Report Issue
          </a>
        </div>
      </main>
    </div>
  );
}