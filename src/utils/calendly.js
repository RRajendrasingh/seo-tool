/**
 * Triggers the Calendly popup widget dynamically.
 * Prefills the client name and email for a seamless booking experience.
 * 
 * @param {string} email - Prefilled user email
 * @param {string} name - Prefilled user name
 */
export const openCalendly = (email = "", name = "") => {
  const baseUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/seointellect/30min";
  
  if (typeof window !== "undefined" && window.Calendly) {
    const prefill = {};
    if (email) prefill.email = email;
    if (name) prefill.name = name;

    window.Calendly.initPopupWidget({
      url: baseUrl,
      prefill: prefill,
    });
  } else {
    // Graceful fallback: Open the Calendly link in a new window if script failed or hasn't loaded yet.
    if (typeof window !== "undefined") {
      window.open(baseUrl, "_blank");
    }
  }
};
