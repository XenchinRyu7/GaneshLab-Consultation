import Link from "next/link";

import Particles from "@/components/particles";

const navigation = [
  { name: "Get Started", href: "/get-started" },
  { name: "Terms Of Service", href: "/terms-of-service" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-linear-to-tl from-black via-zinc-600/20 to-black">
      <nav className="animate-fade-in my-16">
        <ul className="flex items-center justify-center gap-4">
          {navigation.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-500 duration-500 hover:text-zinc-300"
            >
              {item.name}
            </Link>
          ))}
        </ul>
      </nav>
      <div className="animate-glow animate-fade-left hidden h-px w-screen bg-linear-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 md:block" />
      <Particles className="animate-fade-in absolute inset-0 -z-10" quantity={100} />
      <h1 className="text-edge-outline animate-title font-display z-10 cursor-default bg-white bg-clip-text px-0.5 py-3.5 text-4xl whitespace-nowrap text-transparent duration-1000 sm:text-6xl md:text-9xl">
        GaneshLab
      </h1>

      <div className="animate-glow animate-fade-right hidden h-px w-screen bg-linear-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 md:block" />
      <div className="animate-fade-in my-16 space-y-4 text-center">
        <h2 className="text-sm text-zinc-500">
          Connect with our team to discuss your project needs.
        </h2>
        <div className="flex flex-col items-center gap-3">
          <div className="space-y-2 text-center">
            <p className="text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">For Clients:</span> Schedule a
              consultation to get started and receive login access to our platform
            </p>
            <Link
              href="/get-started"
              className="inline-block rounded-md border border-zinc-700 bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-100 duration-300 hover:border-zinc-600 hover:bg-zinc-700"
            >
              Get Started
            </Link>
          </div>

          <span className="text-xs text-zinc-500">or</span>

          <div className="space-y-2 text-center">
            <p className="text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">For Guests:</span> Book an appointment
              directly without creating an account
            </p>
            <Link
              href="/guest-appointment"
              className="inline-block rounded-md border border-zinc-700 bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-100 duration-300 hover:border-zinc-600 hover:bg-zinc-700"
            >
              Book as Guest
            </Link>
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-zinc-300 underline duration-300 hover:text-zinc-100"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
