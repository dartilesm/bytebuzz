import { adminService } from "@/lib/db/services/admin.service";
import { log } from "@/lib/logger/logger";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { RequestLike } from "node_modules/@clerk/nextjs/dist/types/server/types";

export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req as RequestLike);

    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, first_name, last_name, username, image_url } = evt.data;

      const { data, error } = await adminService.user.upsert({
        id,
        username: username ?? undefined,
        display_name: `${first_name} ${last_name}`,
        image_url: image_url,
      });

      if (error) {
        log.error("Error upserting user in webhook", { error });
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
        });
      }

      return new Response(JSON.stringify({ data, success: true }), {
        status: 200,
      });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      const { data, error: deleteError } = await adminService.user.delete(id as string);

      if (deleteError) {
        log.error("Error deleting user in webhook", { error: deleteError });
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400,
        });
      }

      return new Response(JSON.stringify({ data, success: true }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Action not supported" }), {
      status: 200,
    });
  } catch (err) {
    log.error("Error verifying webhook", { err });
    return new Response(JSON.stringify({ error: "Error verifying webhook" }), {
      status: 400,
    });
  }
}
