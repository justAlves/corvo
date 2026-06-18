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
import { type LoginValues, loginSchema } from "@/lib/schemas/auth";
import { authClient } from "@/lib/authClient";
import { getOnboardingState } from "@/lib/onboarding";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm() {
	const form = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		mode: "onTouched",
		defaultValues: {
			email: "",
			password: "",
			remember: true,
		},
	});

	const router = useRouter();

	async function handleSubmit(data: LoginValues) {
		await authClient.signIn.email(
			{
				email: data.email,
				password: data.password,
				rememberMe: data.remember,
			},
			{
				async onSuccess() {
					try {
						const state = await getOnboardingState();
						router.push(state.completed ? "/dashboard" : "/onboarding");
					} catch {
						router.push("/dashboard");
					}
					toast.success("Login bem-sucedido! Redirecionando...");
				},
				onError(error) {
					if (error.response.status === 401) {
						toast.error("Oops :(", {
							description:
								"Credenciais inválidas. Verifique seu email e senha.",
						});
					} else {
						toast.error("Oops :(", {
							description:
								"Tivemos um problema interno, por favor tente novamente mais tarde!",
						});
					}
				},
			},
		);
	}

	return (
		<Form {...form}>
			<AuthCardHeader>
				<AuthCardTabs active="login" />
			</AuthCardHeader>

			<form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
				<AuthCardBody>
					<div className="flex flex-col gap-3.5">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											autoComplete="email"
											autoFocus
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
											autoComplete="current-password"
											placeholder="••••••••"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="remember"
							render={({ field }) => (
								<FormItem className="flex-row items-center gap-2">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={(c) => field.onChange(c === true)}
										/>
									</FormControl>
									<FormLabel className="cursor-pointer text-[13px] font-normal text-ink-2">
										Manter conectado por 30 dias
									</FormLabel>
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
						Entrar <ArrowRight className="size-3.5" />
					</Button>

					<div className="mt-3.5 text-center text-[13px] text-ink-3">
						<Link
							href="#"
							className="border-b border-dotted border-line-strong text-ink-2 hover:text-foreground"
						>
							Esqueci a senha
						</Link>
					</div>

					<AuthDivider />

					<div className="grid grid-cols-2 gap-2">
						<OAuthButton provider="google" />
						<OAuthButton provider="apple" />
					</div>
				</AuthCardBody>

				<AuthCardFooter>
					Primeira vez aqui?{" "}
					<Link
						href="/cadastro"
						className="font-semibold text-foreground hover:underline"
					>
						Criar conta grátis
					</Link>
				</AuthCardFooter>
			</form>
		</Form>
	);
}
