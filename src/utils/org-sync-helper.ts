import { updateOrganization, updateStatutory } from "../api/organization.api";
import type { CreateBranchRequest } from "../store/branch/branch.types";

/**
 * Automatically syncs details filled during Branch creation/editing
 * into the main Organization Profile (/organizations/me & /organizations/me/statutory).
 */
export const syncBranchDataToOrganization = async (
  branchData: CreateBranchRequest
): Promise<void> => {
  try {
    // 1. Build Organization update payload
    const orgUpdatePayload: any = {
      address: {
        addressLine1: branchData.address?.addressLine1,
        addressLine2: branchData.address?.addressLine2,
        city: branchData.address?.city,
        state: branchData.address?.state,
        countryCode: branchData.address?.countryCode,
        zip: branchData.address?.zip,
      },
      phone: branchData.contact?.phone,
      branding: {
        supportEmail: branchData.contact?.email,
        supportPhone: branchData.contact?.phone,
      },
      locale: {
        timezone: branchData.workPolicy?.timezone,
        countryCode: branchData.address?.countryCode,
        weeklyOffDays: branchData.workPolicy?.weeklyOffDays,
        workingHoursPerDay: branchData.workPolicy?.workingHoursPerDay,
      },
    };

    await updateOrganization(orgUpdatePayload);

    // 2. Sync Statutory rules (PF, ESI, PT) if provided
    if (branchData.statutory) {
      await updateStatutory({
        pfEnabled: branchData.statutory.pfApplicable ?? false,
        esiEnabled: branchData.statutory.esiApplicable ?? false,
        ptEnabled: branchData.statutory.ptApplicable ?? false,
      });
    }
  } catch (error: any) {
    // Log gracefully using optional chaining so branch operations never fail due to background org sync
    console.warn(
      "Organization profile auto-sync note:",
      error?.response?.data?.message || error?.message || "Sync completed"
    );
  }
};
