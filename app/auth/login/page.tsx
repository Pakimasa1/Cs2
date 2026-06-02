import { LoginForm } from '@/components/auth-forms';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span className="text-xl font-bold text-primary-foreground">H</span>
        </div>
        <span className="text-2xl font-bold tracking-tight">HAKI TAN</span>
      </Link>
      <LoginForm />
    </div>
  );
}
