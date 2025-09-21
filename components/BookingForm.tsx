"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import {
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormError,
} from "./ui/Form";
import BookingCalendar from "./BookingCalendar";
import { createBooking, type ActionResponse } from "@/app/actions/booking";

const initialState: ActionResponse = {
  success: false,
  message: "",
  errors: undefined,
};

export default function BookingForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (_prevState: ActionResponse, formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      date: formData.get("date") as string,
    };

    try {
      const result = await createBooking(data);
      if (result.success) {
        router.refresh();
        router.push("/dashboard");
      }
      return result;
    } catch (err) {
      return {
        success: false,
        message: (err as Error).message || "An error occurred",
        errors: undefined,
      };
    }
  }, initialState);

  return (
    <Form action={formAction}>
      {state?.message && <FormError>{state.message}</FormError>}

      {/* Full Name */}
      <FormGroup>
        <FormLabel htmlFor="name">Full Name</FormLabel>
        <FormInput
          id="name"
          name="name"
          placeholder="Emma Smith"
          required
          minLength={2}
          disabled={isPending}
          className={state?.errors?.name ? "border-red-500" : ""}
        />
        {state?.errors?.name && (
          <p className="text-sm text-red-500">{state.errors.name[0]}</p>
        )}
      </FormGroup>

      {/* Description (optional) */}
      <FormGroup>
        <FormLabel htmlFor="description">Description (optional)</FormLabel>
        <FormTextarea
          id="description"
          name="description"
          placeholder="Any notes about your training..."
          rows={3}
          disabled={isPending}
        />
      </FormGroup>

      {/* Calendar */}
      <FormGroup>
        <FormLabel className="">Select Training Date</FormLabel>

        <BookingCalendar />

        {state?.errors?.date && (
          <p className="text-sm text-red-500">{state.errors.date[0]}</p>
        )}
      </FormGroup>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isPending}>
          Book Training
        </Button>
      </div>
    </Form>
  );
}
