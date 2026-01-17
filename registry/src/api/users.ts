/**
 * Users API
 * 
 * User registration, authentication, and management for the job marketplace.
 */

import { Hono } from "hono";
import { registry } from "./index.js";
import { authMiddleware, adminMiddleware } from "./middleware.js";
import type { UserRole } from "../types.js";

export const usersApi = new Hono();

// =============================================================================
// PUBLIC ENDPOINTS
// =============================================================================

/**
 * Get agent token for automated services
 * GET /users/agent-token
 * 
 * Used by creation/profile/suggestion agents to get their token on startup.
 * Requires BOOTSTRAP_SECRET env var to match.
 */
usersApi.get("/agent-token", (c) => {
  const secret = c.req.header("X-Bootstrap-Secret");
  const expectedSecret = process.env.BOOTSTRAP_SECRET || "xbounty-bootstrap-2024";
  
  if (secret !== expectedSecret) {
    return c.json({ error: "Invalid bootstrap secret" }, 401);
  }
  
  // Find or create agent
  const { users } = registry.listUsers(0, 100);
  let agent = users.find(u => u.role === "agent" && u.name === "xBountyAgent");
  
  if (!agent) {
    // Bootstrap hasn't run yet, create agent now
    agent = registry.createUser({
      name: "xBountyAgent",
      role: "agent",
    });
  }
  
  return c.json({ 
    token: agent.token,
    agentId: agent.id,
  });
});

/**
 * Register a new user
 * POST /users/register
 * 
 * Returns user with bearer token. Save the token - it's only shown once!
 * First user created becomes admin.
 */
usersApi.post("/register", async (c) => {
  try {
    const body = await c.req.json() as { 
      name: string; 
      twitterHandle?: string;
    };
    
    if (!body.name || body.name.trim().length === 0) {
      return c.json({ error: "Name is required" }, 400);
    }
    
    // First user becomes admin
    const { total } = registry.listUsers(0, 1);
    const role = total === 0 ? "admin" : "user";
    
    const user = registry.createUser({
      name: body.name.trim(),
      role,
      twitterHandle: body.twitterHandle,
    });
    
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        twitterHandle: user.twitterHandle,
        createdAt: user.createdAt,
      },
      token: user.token, // Only returned on registration!
    }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

/**
 * Get current user (from token)
 * GET /users/me
 */
usersApi.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  
  return c.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      twitterHandle: user.twitterHandle,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    },
  });
});

/**
 * Update current user
 * PATCH /users/me
 */
usersApi.patch("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json() as { name?: string; twitterHandle?: string };
  
  if (body.name) user.name = body.name;
  if (body.twitterHandle !== undefined) user.twitterHandle = body.twitterHandle || undefined;
  
  registry.updateUser(user);
  
  return c.json({
    id: user.id,
    name: user.name,
    role: user.role,
    twitterHandle: user.twitterHandle,
  });
});

// =============================================================================
// ADMIN ENDPOINTS
// =============================================================================

/**
 * List all users (admin only)
 * GET /users?limit=50&offset=0
 */
usersApi.get("/", authMiddleware, adminMiddleware, (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  
  const result = registry.listUsers(offset, limit);
  return c.json({
    users: result.users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      twitterHandle: u.twitterHandle,
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
    })),
    total: result.total,
    offset,
    limit,
  });
});

/**
 * Get user by ID (admin only)
 * GET /users/:id
 */
usersApi.get("/:id", authMiddleware, adminMiddleware, (c) => {
  const id = c.req.param("id");
  const user = registry.getUser(id);
  
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  
  return c.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      twitterHandle: user.twitterHandle,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    },
  });
});

/**
 * Create user with specific role (admin only)
 * POST /users
 */
usersApi.post("/", authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.json() as { 
      name: string; 
      role?: UserRole;
      twitterHandle?: string;
    };
    
    const user = registry.createUser({
      name: body.name,
      role: body.role || "user",
      twitterHandle: body.twitterHandle,
    });
    
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      token: user.token,
    }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 400);
  }
});
