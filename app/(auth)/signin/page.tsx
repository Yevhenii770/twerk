"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signIn, ActionResponse } from "@/app/actions/auth";

const initialState: ActionResponse = { success: false, message: "", errors: undefined };

export default function SignInPage() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    async (_, formData) => {
      const result = await signIn(formData);
      if (result.success) {
        toast.success("Signed in successfully");
        router.push("/dashboard");
        router.refresh();
      }
      return result;
    },
    initialState
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-heading text-2xl italic font-light text-[#F5EDE0]/80 hover:text-[#F5EDE0] transition-colors">
            bounce lab
          </Link>
          <p className="mt-2 text-[10px] tracking-[0.35em] uppercase text-[#F5EDE0]/40">Sign in to your account</p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8">
          {state?.message && !state.success && (
            <p className="mb-5 text-sm text-[#E8637A] bg-[#E8637A]/10 border border-[#E8637A]/20 px-4 py-3">
              {state.message}
            </p>
          )}

          <form action={formAction} className="flex flex-col gap-5">
            <Field id="email" name="email" type="email" label="Email" autoComplete="email" disabled={isPending} error={state?.errors?.email?.[0]} />
            <Field id="password" name="password" type="password" label="Password" autoComplete="current-password" disabled={isPending} error={state?.errors?.password?.[0]} />

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 bg-[#E8637A] hover:bg-[#C94060] disabled:opacity-50 text-white text-xs tracking-[0.2em] uppercase py-4 transition-colors cursor-pointer font-sans"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

function Field({ id, name, type, label, autoComplete, disabled, error }: {
  id: string; name: string; type: string; label: string;
  autoComplete?: string; disabled?: boolean; error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] tracking-[0.25em] uppercase text-[#F5EDE0]/50">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="bg-[#0D0D0D] border border-[#333] text-[#F5EDE0] placeholder:text-[#F5EDE0]/20 px-4 py-3 text-sm outline-none focus:border-[#C9A96E] transition-colors disabled:opacity-50"
      />
      {error && <p className="text-xs text-[#E8637A]">{error}</p>}
    </div>
  );
}
