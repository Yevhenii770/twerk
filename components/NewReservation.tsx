import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal";
import BookingForm from "./BookingForm";

const NewReservation = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return <BookingForm />;
};

export default NewReservation;
