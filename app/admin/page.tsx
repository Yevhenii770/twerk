// import { getCurrentUser, getAllUsers } from "@/lib/dal";
// import { redirect } from "next/navigation";

// export default async function AdminPage() {
//   const user = await getCurrentUser();

//   //   if (!user || user.role !== "admin") {
//   //     redirect("/signin");
//   //   }

//   const users = await getAllUsers();

//   return (
//     <div>
//       <h1>Admin Dashboard</h1>
//       <ul>
//         {users.map((u) => (
//           <li key={u.id}>
//             {u.email} — {new Date(u.createdAt).toLocaleDateString()}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
