"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import {
  AuthCardBody,
  AuthCardFooter,
  AuthCardHeader,
} from "@/components/auth/auth-card";
import { AuthCardTabs } from "@/components/auth/auth-card-tabs";
import { AuthDivider } from "@/components/auth/auth-divider";
import { OAuthButton } from "@/components/auth/oauth-button";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type SignupValues, signupSchema } from "@/lib/schemas/auth";
import { authClient } from "@/lib/authClient";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

export function SignupForm() {
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = form.watch("password");

  async function handleSubmit(data: SignupValues) {
    setLoading(true)
    await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password
    }, 
    {
      onSuccess: () => {
        setLoading(false)
        router.push("/dashboard")
        toast.success("Conta criada!", {
          description: "Tudo certinho, seja bem vindo!"
        })
      },
      onError: (error) => {
        setLoading(false)
        if(error.error.message.includes("email")){
          toast.error("Oops :(", {
            description: "Parece que esse email já está em uso, por favor utilize outro!"
          })
          return
        }
        toast.error("Oops :(", {
          description: "Tivemos um problema interno, por favor tente novamente mais tarde!"
        })
      }
    }
  )
  }

  return (
    <Form {...form}>
      <AuthCardHeader>
        <AuthCardTabs active="cadastro" />
      </AuthCardHeader>

      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <AuthCardBody>
          <div className="flex flex-col gap-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu nome</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      autoFocus
                      placeholder="Como podemos te chamar?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do trabalho</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="voce@negocio.com.br"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      {...field}
                    />
                  </FormControl>
                  <PasswordStrength value={password ?? ""} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Repita a senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex-row items-start gap-2">
                  <FormControl>
                    <Checkbox
                      className="mt-[3px]"
                      checked={field.value === true}
                      onCheckedChange={(c) => field.onChange(c === true)}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="cursor-pointer text-[13px] font-normal leading-[1.5] text-ink-2">
                      Concordo com os{" "}
                      <a
                        href="#"
                        className="border-b border-dotted border-line-strong"
                      >
                        termos
                      </a>{" "}
                      e a{" "}
                      <a
                        href="#"
                        className="border-b border-dotted border-line-strong"
                      >
                        política de privacidade
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="mt-4 w-full"
            disabled={form.formState.isSubmitting}
          >
            {loading ? (
              <Spinner/>
            ) : (
              <>
                Criar conta e começar <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>

          <AuthDivider />
          <div className="grid grid-cols-2 gap-2">
            <OAuthButton provider="google" />
            <OAuthButton provider="apple" />
          </div>
        </AuthCardBody>

        <AuthCardFooter>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground hover:underline"
          >
            Entrar
          </Link>
        </AuthCardFooter>
      </form>
    </Form>
  );
}
