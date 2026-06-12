import { AppError, kindFromStatus } from "@/lib/errors";
import { authClient } from "@/services/auth/better-auth-client";
import type { OrganizationRepository } from "@/services/repositories/types";
import type { Organization } from "@/types";

/**
 * OrganizationRepository backed by better-auth's organization plugin.
 *
 * "Active org" lives on the server session: `setActive` updates
 * `session.activeOrganizationId`, and the backend persists it as
 * `user.lastActiveOrganizationId` so new sessions restore it automatically.
 */

/** The organization shape better-auth returns. */
interface BetterAuthOrganization {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
}

function toOrganization(raw: BetterAuthOrganization): Organization {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? undefined,
    logoUrl: raw.logo ?? undefined,
  };
}

function toAppError(error: {
  status: number;
  statusText: string;
  message?: string;
}): AppError {
  return new AppError({
    kind: kindFromStatus(error.status),
    status: error.status,
    message: error.message ?? error.statusText ?? "Organization request failed",
    cause: error,
  });
}

export class BetterAuthOrganizationRepository
  implements OrganizationRepository
{
  async list(): Promise<Organization[]> {
    const { data, error } = await authClient.organization.list();
    if (error) throw toAppError(error);
    return (data ?? []).map(toOrganization);
  }

  async getActiveOrganizationId(): Promise<string | null> {
    const { data, error } = await authClient.getSession();
    if (error) throw toAppError(error);
    return data?.session?.activeOrganizationId ?? null;
  }

  async setActive(organizationId: string): Promise<void> {
    const { error } = await authClient.organization.setActive({
      organizationId,
    });
    if (error) throw toAppError(error);
  }

  async create(input: { name: string }): Promise<Organization> {
    // First try the clean slug; on a collision (or a slug the backend
    // forbids) retry once with a random suffix instead of failing the form.
    const slug = slugify(input.name);
    const first = await authClient.organization.create({
      name: input.name,
      slug,
    });
    if (first.data) return toOrganization(first.data);

    if (first.error.status >= 500) throw toAppError(first.error);

    const retry = await authClient.organization.create({
      name: input.name,
      slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
    });
    if (retry.error) throw toAppError(retry.error);
    return toOrganization(retry.data);
  }
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "org"
  );
}
