"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  approveCommissionItem,
  rejectCommissionItem,
} from "@/lib/services/finance";

function buildCommissionsHref(params: {
  entry?: string;
  notice: string;
}) {
  const search = new URLSearchParams();

  if (params.entry) {
    search.set("entry", params.entry);
  }

  search.set("notice", params.notice);

  return `/earnings?${search.toString()}`;
}

export async function approveCommissionAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");

  try {
    const result = await approveCommissionItem({
      eventId,
      amount: String(formData.get("amount") ?? ""),
      currency: String(formData.get("currency") ?? ""),
      note: String(formData.get("note") ?? ""),
    });

    revalidatePath("/earnings");
    revalidatePath("/payouts");
    revalidatePath("/payout-batches");
    revalidatePath("/settings/exports");
    redirect(
      buildCommissionsHref({
        entry: result.eventId,
        notice: "commission-approved",
      }),
    );
  } catch {
    redirect(
      buildCommissionsHref({
        entry: eventId,
        notice: "commission-error",
      }),
    );
  }
}

export async function rejectCommissionAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");

  try {
    const result = await rejectCommissionItem({
      eventId,
      note: String(formData.get("note") ?? ""),
    });

    revalidatePath("/earnings");
    revalidatePath("/payouts");
    revalidatePath("/payout-batches");
    revalidatePath("/settings/exports");
    redirect(
      buildCommissionsHref({
        entry: result.eventId,
        notice: "commission-rejected",
      }),
    );
  } catch {
    redirect(
      buildCommissionsHref({
        entry: eventId,
        notice: "commission-error",
      }),
    );
  }
}
