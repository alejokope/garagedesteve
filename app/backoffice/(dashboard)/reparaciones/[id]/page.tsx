import Link from "next/link";
import { notFound } from "next/navigation";

import { RepairDetailEditor } from "@/app/backoffice/(dashboard)/reparaciones/repair-detail-editor";
import {
  getRepairAdmin,
  listRepairHistoryAdmin,
  listRepairMessagesAdmin,
} from "@/lib/backoffice/repairs-db";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notify?: string }>;
};

export default async function ReparacionDetallePage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  let repair: Awaited<ReturnType<typeof getRepairAdmin>> = null;
  let history: Awaited<ReturnType<typeof listRepairHistoryAdmin>> = [];
  let messages: Awaited<ReturnType<typeof listRepairMessagesAdmin>> = [];
  try {
    repair = await getRepairAdmin(id);
    if (repair) {
      [history, messages] = await Promise.all([
        listRepairHistoryAdmin(id),
        listRepairMessagesAdmin(id),
      ]);
    }
  } catch {
    notFound();
  }
  if (!repair) notFound();

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Reparaciones
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
          Reparación <span className="font-mono tracking-wider">{repair.tracking_code}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          <Link href="/backoffice/reparaciones" className="text-violet-300 hover:text-violet-200">
            Listado
          </Link>
        </p>
      </div>
      <RepairDetailEditor
        repair={repair}
        history={history}
        messages={messages}
        emailFailedBanner={sp.notify === "email_failed"}
      />
    </div>
  );
}
