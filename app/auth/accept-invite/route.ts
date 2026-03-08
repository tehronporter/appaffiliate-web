import { acceptPendingInvitation } from "@/lib/services/invitations";
import { serviceErrorJson, serviceJson } from "@/lib/services/envelope";
import { getRequestId } from "@/lib/services/request-id";

export async function POST(request: Request) {
  const requestId = await getRequestId(request);

  try {
    const result = await acceptPendingInvitation();

    return serviceJson(result, {
      requestId,
      status: 200,
    });
  } catch (error) {
    return serviceErrorJson(error, { requestId });
  }
}
