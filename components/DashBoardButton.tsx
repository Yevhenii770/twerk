import { getCurrentUser } from "@/lib/dal";
import Button from "./ui/Button";
import Link from "next/link";

const DashBoardButton = async () => {
  const user = await getCurrentUser();
  return (
    <>
      {user ? (
        <Link href="/dashboard">
          <Button variant="underline">Go to Dashboard</Button>
        </Link>
      ) : (
        <div className="flex items-center space-x-4">
          <Link href="/signin">
            <Button variant="underline">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="underline">Sign up</Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default DashBoardButton;
