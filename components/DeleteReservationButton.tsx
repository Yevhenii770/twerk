"use client";

import { Button } from "@/components/ui";
import { Trash2Icon } from "lucide-react";
import { deleteBooking } from "@/app/actions/booking";
import { useRouter } from "next/navigation";

interface DeleteReservationButtonProps {
  id: number;
}

export function DeleteReservationButton({ id }: DeleteReservationButtonProps) {
  const router = useRouter();
  const handleDelete = async () => {
    try {
      const result = await deleteBooking(id);

      if (!result || !result.success) {
        throw new Error(result?.error || "Failed to delete reservation");
      }
      router.refresh();
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  return (
    <Button size="sm" onClick={() => handleDelete()}>
      <Trash2Icon size={16} className="mr-1" />
    </Button>
  );
}
