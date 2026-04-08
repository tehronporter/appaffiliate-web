import { NextResponse } from "next/server";

import {
  buildFinanceExportCsv,
  type FinanceExportScope,
} from "@/lib/services/finance";
import { serviceErrorJson } from "@/lib/services/envelope";
import {
  applyRequestIdHeader,
  getRequestId,
} from "@/lib/services/request-id";

const VALID_SCOPES = new Set<FinanceExportScope>([
  "commission-register",
  "payout-tracking",
]);

export async function GET(request: Request) {
  const requestId = await getRequestId(request);
  const { searchParams } = new URL(request.url);
  const rawScope = searchParams.get("scope") ?? "commission-register";
  const scope = VALID_SCOPES.has(rawScope as FinanceExportScope)
    ? (rawScope as FinanceExportScope)
    : "commission-register";

  try {
    const csv = await buildFinanceExportCsv(scope);
    const filename = `appaffiliate-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    const response = new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });

    return applyRequestIdHeader(response, requestId);
  } catch (error) {
    return serviceErrorJson(error, {
      requestId,
    });
  }
}
