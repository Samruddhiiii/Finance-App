import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { formatCurrencyINR } from "@/lib/utils";

export default async function AccountPage({ params }) {
  const accountData = await getAccountWithTransactions(params.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            {formatCurrencyINR(account.balance)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense fallback={null}>
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense fallback={null}>
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
