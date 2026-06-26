import User from "../models/User.js";

const roleProtect = (role) => {
  // Normalise to array so both string and array signatures work
  const allowedRoles = Array.isArray(role) ? role : [role];

  return async (req, res, next) => {
    try {
      // ── 1. Confirm authMiddleware ran first ─────────────────────────────────
      // req.user is set by authMiddleware; if it's missing, the middleware
      // chain was configured incorrectly — treat as server misconfiguration.
      if (!req.user?.id) {
        console.error("[roleProtect] req.user is missing — ensure authMiddleware runs before roleProtect");
        return res.status(401).json({ message: "Unauthorized: Authentication required" });
      }

      // ── 2. Fast-path: trust req.user.role from authMiddleware ───────────────
      // authMiddleware already validated the token and fetched the user from DB.
      // Re-querying the DB here on every protected route is redundant and slow.
      // We only re-fetch if role is somehow absent (defensive guard).
      let userRole = req.user.role;

      if (!userRole) {
        // Fallback DB fetch — should not normally be needed
        const freshUser = await User.findById(req.user.id).select("role isVerified").lean();

        if (!freshUser) {
          return res.status(401).json({ message: "Unauthorized: Account not found" });
        }

        if (freshUser.isVerified === false) {
          return res.status(403).json({ message: "Email not verified. Please verify your account." });
        }

        userRole = freshUser.role;
      }

      // ── 3. Enforce role ─────────────────────────────────────────────────────
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: `Forbidden: '${userRole}' role does not have access to this resource`,
        });
      }

      next();
    } catch (err) {
      console.error("[roleProtect] Unexpected error:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};

export default roleProtect;