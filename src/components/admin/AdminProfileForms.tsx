"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminUser } from "@/lib/admin/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Use at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine((values) => values.newPassword === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface AdminProfileFormsProps {
  initialUser: AdminUser;
}

export function AdminProfileForms({ initialUser }: AdminProfileFormsProps) {
  const [user, setUser] = useState(initialUser);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialUser.name,
      email: initialUser.email,
      currentPassword: "",
    },
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const saveAccount = async (
    values: ProfileFormValues & { newPassword?: string; confirmPassword?: string },
  ): Promise<AdminUser> => {
    const response = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await response.json() as { user?: AdminUser; error?: string };
    if (!response.ok || !result.user) {
      throw new Error(result.error || "Could not update your profile");
    }

    setUser(result.user);
    window.dispatchEvent(
      new CustomEvent<AdminUser>("admin-profile-updated", { detail: result.user }),
    );
    return result.user;
  };

  const updateProfile = async (values: ProfileFormValues) => {
    setProfileMessage("");
    setProfileError("");
    try {
      const updatedUser = await saveAccount(values);
      profileForm.reset({
        name: updatedUser.name,
        email: updatedUser.email,
        currentPassword: "",
      });
      setProfileMessage("Your profile details were updated.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not update your profile");
    }
  };

  const updatePassword = async (values: PasswordFormValues) => {
    setPasswordMessage("");
    setPasswordError("");
    try {
      await saveAccount({
        name: user.name,
        email: user.email,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      passwordForm.reset();
      setPasswordMessage("Your password was changed.");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Could not change your password");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-flex rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium capitalize text-brand-blue">
              {user.role.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="font-semibold text-foreground">Profile details</h3>
          <p className="text-sm text-muted-foreground">
            Update the name and email address associated with your account.
          </p>
        </div>

        <form onSubmit={profileForm.handleSubmit(updateProfile)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium">Full name</label>
            <Input id="profile-name" autoComplete="name" {...profileForm.register("name")} />
            {profileForm.formState.errors.name && (
              <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-email" className="text-sm font-medium">Email address</label>
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              {...profileForm.register("email")}
            />
            {profileForm.formState.errors.email && (
              <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-current-password" className="text-sm font-medium">
              Confirm with current password
            </label>
            <Input
              id="profile-current-password"
              type="password"
              autoComplete="current-password"
              {...profileForm.register("currentPassword")}
            />
            {profileForm.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">
                {profileForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          {profileError && <p role="alert" className="text-sm text-destructive">{profileError}</p>}
          {profileMessage && <p role="status" className="text-sm text-green-700 dark:text-green-400">{profileMessage}</p>}
          <Button type="submit" disabled={profileForm.formState.isSubmitting}>
            {profileForm.formState.isSubmitting ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold text-foreground">Change password</h2>
          <p className="text-sm text-muted-foreground">
            Use your current password to set a new password of at least 8 characters.
          </p>
        </div>

        <form onSubmit={passwordForm.handleSubmit(updatePassword)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password-current" className="text-sm font-medium">Current password</label>
            <Input
              id="password-current"
              type="password"
              autoComplete="current-password"
              {...passwordForm.register("currentPassword")}
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="password-new" className="text-sm font-medium">New password</label>
            <Input
              id="password-new"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("newPassword")}
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="password-confirm" className="text-sm font-medium">Confirm new password</label>
            <Input
              id="password-confirm"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("confirmPassword")}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          {passwordError && <p role="alert" className="text-sm text-destructive">{passwordError}</p>}
          {passwordMessage && <p role="status" className="text-sm text-green-700 dark:text-green-400">{passwordMessage}</p>}
          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Updating…" : "Change password"}
          </Button>
        </form>
      </section>
    </div>
  );
}
