import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <div className="container mx-auto my-32">{children}</div>;
}
