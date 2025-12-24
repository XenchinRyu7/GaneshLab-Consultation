import { redirect } from "next/navigation";

export default function Home() {
  redirect("/id/dashboard/overview");
  return <>Coming Soon</>;
}
