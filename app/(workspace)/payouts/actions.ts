"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelPayoutBatch,
  createDraftPayoutBatch,
  markPayoutBatchExported,
  markPayoutBatchPaid,
} from "@/lib/services/finance";

function buildPayoutsHref(params: {
  view?: string;
  batch?: string;
  notice: string;
}) {
  const search = new URLSearchParams();

  if (params.view && params.view !== "all") {
    search.set("view", params.view);
  }

  if (params.batch) {
    search.set("batch", params.batch);
  }

  search.set("notice", params.notice);

  return `/payouts?${search.toString()}`;
}

function buildPayoutBatchesHref(params: {
  batch?: string;
  notice: string;
}) {
  const search = new URLSearchParams();

  if (params.batch) {
    search.set("batch", params.batch);
  }

  search.set("notice", params.notice);

  return `/payout-batches?${search.toString()}`;
}

export async function createDraftPayoutBatchAction(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");

  try {
    const result = await createDraftPayoutBatch({
      groupId,
      note: String(formData.get("note") ?? ""),
    });

    revalidatePath("/commissions");
    revalidatePath("/payouts");
    revalidatePath("/payout-batches");
    revalidatePath("/settings/exports");
    redirect(
      buildPayoutsHref({
        view: "batches",
        batch: result.batchId,
        notice: "batch-created",
      }),
    );
  } catch {
    redirect(
      buildPayoutsHref({
        notice: "batch-error",
      }),
    );
  }
}

export async function markPayoutBatchExportedAction(formData: FormData) {
  const batchId = String(formData.get("batchId") ?? "");

  try {
    const result = await markPayoutBatchExported({
      batchId,
      externalReference: String(formData.get("externalReference") ?? ""),
      note: String(formData.get("note") ?? ""),
    });

    revalidatePath("/commissions");
    revalidatePath("/payouts");
    revalidatePath("/payout-batches");
    revalidatePath("/settings/exports");
    redirect(
      buildPayoutBatchesHref({
        batch: result.batchId,
        notice: "batch-exported",
      }),
    );
  } catch {
    redirect(
      buildPayoutBatchesHref({
        batch: batchId,
        notice: "batch-error",
      }),
    );
  }
}

export async function markPayoutBatchPaidAction(formData: FormData) {
  const batchId = String(formData.get("batchId") ?? "");

  try {
    const result = await markPayoutBatchPaid({
      batchId,
      note: String(formData.get("note") ?? ""),
    });

    revalidatePath("/commissions");
    revalidatePath("/payouts");
    revalidatePath("/payout-batches");
    revalidatePath("/settings/exports");
    redirect(
      buildPayoutBatchesHref({
        batch: result.batchId,
        notice: "batch-paid",
      }),
    );
  } catch {
    redirect(
      buildPayoutBatchesHref({
        batch: batchId,
        notice: "batch-error",
      }),
    );
  }
}

export async function cancelPayoutBatchAction(formData: FormData) {
  const batchId = String(formData.get("batchId") ?? "");

  try {
    const result = await cancelPayoutBatch({
      batchId,
      note: String(formData.get("note") ?? ""),
    });

    revalidatePath("/commissions");
    revalidatePath("/payouts");
    revalidatePath("/payout-batches");
    revalidatePath("/settings/exports");
    redirect(
      buildPayoutBatchesHref({
        batch: result.batchId,
        notice: "batch-cancelled",
      }),
    );
  } catch {
    redirect(
      buildPayoutBatchesHref({
        batch: batchId,
        notice: "batch-error",
      }),
    );
  }
}
