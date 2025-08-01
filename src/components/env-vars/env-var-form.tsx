import React from "react";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VStack } from "@/components/ui/stack";

import { setEnvVar } from "@/actions/add-env-var";

import type { EnvVars } from "@/toolkits/types";

interface Props {
  resourceName: string;
  envVars: EnvVars;
  onSuccess: () => void;
  disabled?: boolean;
}

export const EnvVarForm: React.FC<Props> = ({
  resourceName,
  envVars,
  onSuccess,
  disabled,
}) => {
  const formSchema = z.object(
    Object.fromEntries(
      envVars.map((vars, index) => {
        return [
          index.toString(),
          vars.type === "all"
            ? z.object(
                Object.fromEntries(
                  vars.keys.map((key) => [key, z.string().min(1)]),
                ),
              )
            : z
                .object(
                  Object.fromEntries(
                    vars.keys.map((keyObj) => [keyObj.key, z.string()]),
                  ),
                )
                .refine(
                  (data) =>
                    Object.values(data).some((value) => value.length > 0),
                  {
                    message:
                      "At least one of the environment variables must be set",
                  },
                ),
        ];
      }),
    ),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.fromEntries(
      envVars.map((vars, index) => {
        return [
          index.toString(),
          vars.type === "all"
            ? Object.fromEntries(vars.keys.map((key) => [key, ""]))
            : Object.fromEntries(vars.keys.map((keyObj) => [keyObj.key, ""])),
        ];
      }),
    ),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const envVarsToUpdate = Object.values(values)
      .map(Object.entries)
      .flat()
      .map(([key, value]) => ({
        key,
        value: value as string,
      }))
      .filter(({ value }) => value !== undefined && value.length > 0);
    const { success } = await setEnvVar(envVarsToUpdate);

    if (success) {
      toast.success("Environment variables have been set successfully");
      onSuccess();
    } else {
      toast.error("Failed to set environment variables");
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {envVars.map((vars, index) =>
          vars.type === "all" ? (
            <div key={index} className="flex flex-col gap-2">
              {vars.keys.map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`${index}.${key}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="mb-1 text-sm font-medium">
                        {key}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={key}
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <FormDescription>{vars.description}</FormDescription>
            </div>
          ) : (
            <div key={index} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">
                You only need{" "}
                <strong className="text-primary">one of these</strong> keys
              </h3>
              <div className="bg-muted/60 flex flex-col gap-2 rounded-md border p-2">
                {vars.keys.map((keyObj) => (
                  <FormField
                    key={keyObj.key}
                    control={form.control}
                    name={`${index}.${keyObj.key}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel className="mb-1 text-sm font-medium">
                          {keyObj.key}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={keyObj.key}
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormDescription>{keyObj.description}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          ),
        )}
        <VStack className="w-full">
          <Button
            type="submit"
            disabled={!form.formState.isValid || disabled}
            className="w-full"
          >
            Update .env file
          </Button>
          <p className="text-center text-xs">
            This will refresh the page. After the refresh you will be able to
            use {resourceName}.
          </p>
        </VStack>
      </form>
    </Form>
  );
};
