/**
 * Triggers the Calendly popup widget dynamically.
 * Prefills the client name and email for a seamless booking experience.
 * 
 * @param {string} email - Prefilled user email
 * @param {string} name - Prefilled user name
 */
export const openCalendly = (email = "", name = "") => {
  const baseUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/rajendrasinghrathore613/15min";
  
  if (typeof window !== "undefined") {
    // Fallback to guest details if logged-in session info is not available
    const finalEmail = email || localStorage.getItem("guest_email") || "";
    const finalName = name || localStorage.getItem("guest_name") || "";

    if (window.Calendly) {
      const prefill = {};
      if (finalEmail) prefill.email = finalEmail;
      if (finalName) prefill.name = finalName;

      window.Calendly.initPopupWidget({
        url: baseUrl,
        prefill: prefill,
      });
    } else {
      // Graceful fallback: Open the Calendly link in a new window if script failed or hasn't loaded yet.
      window.open(baseUrl, "_blank");
    }
  }
};
