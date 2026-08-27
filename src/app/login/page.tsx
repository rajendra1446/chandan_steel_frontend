"use client";

import {
    FormEvent,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    Factory,
    Mail,
    Lock,
} from "lucide-react";

import { api } from "../../lib/api";
import { saveAuth } from "../../lib/auth";

export default function LoginPage() {

    const router = useRouter();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        try {

            setLoading(true);
            setError("");

            const response =
                await api.login({
                    email,
                    password,
                });

            saveAuth(
                response.token,
                response.user
            );

            router.push("/dashboard");

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : "Login failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* LOGO */}

                <div className="text-center mb-8">

                    <div className="inline-flex w-16 h-16 items-center justify-center rounded-2xl bg-orange-500">

                        <Factory
                            size={32}
                            className="text-white"
                        />

                    </div>

                    <h1 className="text-3xl font-bold text-white mt-4">
                        Chandan Steel
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Steel Traceability System
                    </p>

                </div>

                {/* LOGIN CARD */}

                <div className="bg-white rounded-2xl p-8 shadow-xl">

                    <h2 className="text-2xl font-bold">
                        Welcome Back
                    </h2>

                    <p className="text-slate-500 mt-1 mb-6">
                        Login to your account
                    </p>

                    {error && (

                        <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>

                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* EMAIL */}

                        <div>

                            <label className="text-sm font-medium">
                                Email
                            </label>

                            <div className="relative mt-2">

                                <Mail
                                    size={18}
                                    className="absolute left-3 top-3 text-slate-400"
                                />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter email"
                                    className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-3 outline-none focus:border-orange-500"
                                    required
                                />

                            </div>

                        </div>

                        {/* PASSWORD */}

                        <div>

                            <label className="text-sm font-medium">
                                Password
                            </label>

                            <div className="relative mt-2">

                                <Lock
                                    size={18}
                                    className="absolute left-3 top-3 text-slate-400"
                                />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter password"
                                    className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-3 outline-none focus:border-orange-500"
                                    required
                                />

                            </div>

                        </div>

                        {/* BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-lg font-semibold transition"
                        >

                            {loading
                                ? "Logging in..."
                                : "Login"}

                        </button>

                    </form>

                </div>

            </div>

        </main>
    );
}