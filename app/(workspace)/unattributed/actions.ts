"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  applyManualAttribution,
  markUnattributedItemInReview,
} from "@/lib/services/attribution";

function buildUnattributedHref(params: {
  eventId?: string;
  notice: string;
}) {
  const search = new URLSearchParams();
  search.set("view", "needs-review");

  if (params.eventId) {
    search.set("item", params.eventId);
  }

  search.set("notice", params.notice);

  return `/review?${search.toString()}`;
}

export async function markUnattributedReviewAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");

  try {
    const result = await markUnattributedItemInReview(
      eventId,
      String(formData.get("note") ?? ""),
    );

    revalidatePath("/review");
    redirect(
      buildUnattributedHref({
        eventId: result.eventId,
        notice: "queue-reviewed",
      }),
    );
  } catch {
    redirect(
      buildUnattributedHref({
        eventId,
        notice: "queue-error",
      }),
    );
  }
}

export async function applyManualAttributionAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");

  try {
    const result = await applyManualAttribution({
      eventId,
      promoCodeId: String(formData.get("promoCodeId") ?? "none"),
      partnerId: String(formData.get("partnerId") ?? "none"),
      note: String(formData.get("note") ?? ""),
    });

    revalidatePath("/review");
    revalidatePath("/events");
    redirect(
      buildUnattributedHref({
        eventId: result.eventId,
        notice: "queue-resolved",
      }),
    );
  } catch {
    redirect(
      buildUnattributedHref({
        eventId,
        notice: "queue-error",
      }),
    );
  }
}
