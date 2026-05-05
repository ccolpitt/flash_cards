import { Router } from "express";
import { JsonFileStore } from "../../stores/json-file-store.js";
import { User } from "../../models/user.js";
import { UserService } from "../../services/user-service.js";
import { getLastUserId, setLastUserId } from "../../services/app-state-service.js";

const store = new JsonFileStore<User>("users.json");
const userService = new UserService(store);

export const userRoutes = Router();

// GET /api/users — list all users
userRoutes.get("/", (_req, res) => {
    res.json(userService.listUsers());
});

// GET /api/users/last — get last logged-in user
userRoutes.get("/last", (_req, res) => {
    const lastId = getLastUserId();
    if (!lastId) return res.json(null);
    res.json(userService.readUser(lastId));
});

// POST /api/users — create user
userRoutes.post("/", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const user = userService.createUser(name);
    setLastUserId(user.id);
    res.status(201).json(user);
});

// POST /api/users/login/:id — set as last user
userRoutes.post("/login/:id", (req, res) => {
    const user = userService.readUser(req.params.id);
    if (!user) return res.status(404).json({ error: "user not found" });
    setLastUserId(user.id);
    userService.updateUser(user.id, { num_sessions: user.num_sessions + 1 });
    res.json(user);
});

// GET /api/users/:id
userRoutes.get("/:id", (req, res) => {
    const user = userService.readUser(req.params.id);
    if (!user) return res.status(404).json({ error: "not found" });
    res.json(user);
});

// PUT /api/users/:id
userRoutes.put("/:id", (req, res) => {
    const updated = userService.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
});

// DELETE /api/users/:id
userRoutes.delete("/:id", (req, res) => {
    const deleted = userService.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: "not found" });
    res.status(204).send();
});
