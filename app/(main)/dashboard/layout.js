import DashboardPage from "./page";
import { Suspense } from "react";

export default function Layout() {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-5xl font-bold tracking-tight gradient-title">
          Dashboard
        </h1>
      </div>
      <Suspense fallback={null}>
        <DashboardPage />
      </Suspense>
    </div>
  );
}
