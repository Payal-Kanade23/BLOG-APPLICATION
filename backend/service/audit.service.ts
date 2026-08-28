import Audit from "../models/Audit";

interface LogAuditParams {
  author?: string | undefined;
  action: string;
  resource: string;
  resourceId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export async function logAudit({
  author,
  action,
  resource,
  resourceId,
  metadata,
  ipAddress,
  userAgent,
}: LogAuditParams): Promise<void> {
  try {
    await Audit.create({
      author,
      action,
      resource,
      resourceId,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
