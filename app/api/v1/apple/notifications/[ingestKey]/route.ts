import { ServiceError } from "@/lib/services/errors";
import { serviceErrorJson, serviceJson } from "@/lib/services/envelope";
import { getRequestId } from "@/lib/services/request-id";
import { processAppleNotificationReceipt } from "@/lib/services/apple-notifications";

type AppleNotificationRouteContext = {
  params: Promise<{
    ingestKey: string;
  }>;
};

type AppleNotificationRequestBody = {
  signedPayload?: unknown;
};

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: AppleNotificationRouteContext,
) {
  const requestId = await getRequestId(request);

  try {
    const body = (await request.json()) as AppleNotificationRequestBody;
    const { ingestKey } = await context.params;
    const signedPayload =
      typeof body.signedPayload === "string" ? body.signedPayload.trim() : "";

    if (!signedPayload) {
      throw new ServiceError("bad_request", "Missing signedPayload.", {
        status: 400,
      });
    }

    const result = await processAppleNotificationReceipt({
      ingestKey,
      requestId,
      signedPayload,
    });

    return serviceJson(
      {
        accepted: true,
        duplicate: result.duplicate,
        app: result.app,
        receipt: result.receipt,
        normalizedEventId: result.normalizedEventId,
      },
      {
        requestId,
        status: 202,
      },
    );
  } catch (error) {
    return serviceErrorJson(error, { requestId });
  }
}
