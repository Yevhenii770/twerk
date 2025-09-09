import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/signin");
  }
  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="md:basis-[70%] border-1 p-4">
        <div className="flex">
          My reservations: {!session ? <div> 1111</div> : <div>2222</div>}
        </div>
      </div>
    </div>
  );
}
