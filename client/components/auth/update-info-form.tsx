"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import type { AxiosError } from "axios";

import api from "@/lib/axios";
import { UNIT_OPTIONS, formatUnit, parseUnit } from "@/lib/unit-options";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const facultyList = Object.keys(UNIT_OPTIONS);

const formSchema = z
  .object({
    faculty: z.string().min(1, "Vui lòng chọn khoa"),
    major: z.string().min(1, "Vui lòng chọn ngành"),
  })
  .superRefine((values, ctx) => {
    const majors = UNIT_OPTIONS[values.faculty] ?? [];
    if (majors.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["faculty"],
        message: "Khoa không hợp lệ",
      });
      return;
    }
    if (!majors.includes(values.major)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["major"],
        message: "Ngành không thuộc khoa đã chọn",
      });
    }
  });

type UpdateInfoErrorResponse = {
  detail?: string;
  unit?: string[];
};

export function UpdateInfoForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, update } = useSession();

  const parsed = parseUnit(session?.user?.unit);
  const initialFaculty = facultyList.includes(parsed.faculty)
    ? parsed.faculty
    : "";
  const initialMajor =
    initialFaculty &&
    (UNIT_OPTIONS[initialFaculty] ?? []).includes(parsed.major)
      ? parsed.major
      : "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faculty: initialFaculty,
      major: initialMajor,
    },
  });

  const selectedFaculty = form.watch("faculty");
  const majorsForSelectedFaculty = UNIT_OPTIONS[selectedFaculty] ?? [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const unit = formatUnit(values.faculty, values.major);
      await api.patch("/auth/me/", {
        unit,
      });

      // Sync NextAuth JWT/session so middleware sees updated unit
      await update({
        user: {
          unit,
        },
      } as unknown as Parameters<typeof update>[0]);

      toast({
        title: "Đã cập nhật",
        description: "Thông tin đơn vị đã được lưu.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const err = error as AxiosError<UpdateInfoErrorResponse>;
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.unit?.[0] ||
        "Không thể cập nhật. Vui lòng thử lại.";
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: detail,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="faculty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khoa</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    onChange={(e) => {
                      const nextFaculty = e.target.value;
                      field.onChange(nextFaculty);
                      form.setValue("major", "", { shouldValidate: true });
                    }}
                  >
                    <option value="" disabled>
                      Chọn khoa...
                    </option>
                    {facultyList.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="major"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngành</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isLoading || !selectedFaculty}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="" disabled>
                      {selectedFaculty ? "Chọn ngành..." : "Chọn khoa trước"}
                    </option>
                    {majorsForSelectedFaculty.map((major) => (
                      <option key={major} value={major}>
                        {major}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cập nhật
          </Button>
        </form>
      </Form>
    </div>
  );
}
