import Image from "next/image";

import { LoginForm } from "../_components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen w-full">
      <div className="bg-primary hidden lg:block lg:w-1/3">
        <div className="flex h-full min-h-screen flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Image
                src="/logo/ganeshlabs.png"
                alt="GaneshLab Logo"
                width={120}
                height={120}
                className="rounded-lg"
                priority
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-primary-foreground text-5xl font-light">Welcome to GaneshLab</h1>
              <p className="text-primary-foreground/80 text-xl">
                Sign in to your account to continue
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background flex w-full items-center justify-center p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
          <div className="space-y-4 text-center">
            <div className="mb-6 flex items-center justify-center lg:hidden">
              <Image
                src="/logo/ganeshlabs.png"
                alt="GaneshLab Logo"
                width={80}
                height={80}
                className="rounded-lg"
                priority
              />
            </div>
            <div className="text-foreground text-2xl font-medium tracking-tight">
              Login to GaneshLab
            </div>
            <div className="text-muted-foreground mx-auto max-w-xl">
              Enter your email and password to access your account. Manage your projects and
              consultations with ease.
            </div>
          </div>
          <div className="space-y-4">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
