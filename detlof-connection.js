/* ==========================================================================
   DETLOF — CONNECTION NOTICE
   --------------------------------------------------------------------------
   The portal only works when opened from the school server, because that is
   what serves the pages, the register and the sign-in endpoints together.

   Opening the .html file directly (file://) makes every /api/... request miss
   the server, which surfaces as "HTTP 404" or a bare "sign-in failed" with no
   clue about the cause. These helpers turn that into one clear instruction.
   ========================================================================== */

const DETLOF_SERVER_URL = "http://127.0.0.1:5000";

/* True when this page was opened from disk instead of from the server. */
function detlofOpenedFromDisk() {
  return window.location.protocol === "file:";
}

/* True when the page is being served from somewhere other than our own server,
   which is what a plain static file server looks like. */
function detlofServedFromElsewhere() {
  if (detlofOpenedFromDisk()) return true;
  return window.location.origin !== DETLOF_SERVER_URL;
}

/* One sentence explaining how to get the pages working, for a given failure. */
function detlofConnectionHint(status) {
  if (detlofOpenedFromDisk()) {
    return "You opened this file directly from disk. Run python server.py in the Detlof folder, "
      + "then open " + DETLOF_SERVER_URL + " instead of double-clicking the HTML file.";
  }
  if (status === 404 || status === 405) {
    return "This page is not being served by the Detlof server. Open " + DETLOF_SERVER_URL + ".";
  }
  if (status === 403) {
    return "The Detlof server rejected the request as coming from another address. Open the site at "
      + DETLOF_SERVER_URL + " so the page and the server share one address.";
  }
  return "The Detlof server could not be reached. Run python server.py in the Detlof folder, then open "
    + DETLOF_SERVER_URL + ".";
}

/* A banner shown once per page when the page is being opened the wrong way.
   The pages themselves stay fully usable; this just explains the errors. */
function detlofShowConnectionNotice() {
  if (!detlofServedFromElsewhere()) return;
  if (document.getElementById("detlofConnectionNotice")) return;

  const banner = document.createElement("div");
  banner.id = "detlofConnectionNotice";
  banner.setAttribute("role", "alert");
  banner.style.cssText = [
    "position:fixed", "left:0", "right:0", "top:0", "z-index:99999",
    "background:#fff3cd", "border-bottom:2px solid #ffc107", "color:#6b4e00",
    "padding:12px 16px", "font-size:13px", "line-height:1.5",
    "font-family:system-ui,-apple-system,'Segoe UI',sans-serif",
    "box-shadow:0 4px 14px rgba(0,0,0,.15)"
  ].join(";");
  banner.innerHTML =
    "<strong>Open this through the school server.</strong> "
    + "This page was opened as a file, so it cannot reach the register, results or sign-in. "
    + "From the Detlof folder run <code>python server.py</code>, then open "
    + "<a href=\"" + DETLOF_SERVER_URL + "\">" + DETLOF_SERVER_URL + "</a>. "
    + "<button type=\"button\" style=\"margin-left:8px;padding:4px 10px;border:1px solid #d39e00;"
    + "background:#fff;border-radius:6px;cursor:pointer;font-size:12px;\">Dismiss</button>";

  const dismiss = banner.querySelector("button");
  if (dismiss) {
    dismiss.addEventListener("click", () => banner.remove());
  }

  document.body.appendChild(banner);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", detlofShowConnectionNotice);
} else {
  detlofShowConnectionNotice();
}