export function renderTemplate(template = "", context = {}) {
  return template.replace(/{{\s*([A-Z0-9_]+)\s*}}/g, (_, key) => {
    return context[key] ?? "";
  });
}

export function buildFacilityContext(facility = {}) {
  return {
    FACILITY_NAME: facility.name || "Facility Name",
    FACILITY_ADDRESS: facility.address || "",
    FACILITY_CITY: facility.city || "",
    FACILITY_STATE: facility.state || "",
    FACILITY_ZIP: facility.zip_code || "",
    FACILITY_PHONE: facility.phone || "",
    FACILITY_EMAIL: facility.email || "",
    FACILITY_LICENSE: facility.license_number || "",
  };
}
