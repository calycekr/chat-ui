import { env } from "$env/dynamic/private";
import { PUBLIC_ORIGIN } from "$env/static/public";
import type { Session } from "$lib/types/Session";
import { logger } from "./logger";
import { v4 } from "uuid";

class AdminTokenManager {
	private token = env.ADMIN_TOKEN || v4();
	// contains all session ids that are currently admin sessions
	private adminSessions: Array<Session["sessionId"]> = [];

	public get enabled() {
		// if open id is configured, disable the feature
		return env.ADMIN_CLI_LOGIN === "true";
	}
	public isAdmin(sessionId: Session["sessionId"]) {
		if (!this.enabled) return false;
		return this.adminSessions.includes(sessionId);
	}

	public checkToken(token: string, sessionId: Session["sessionId"]) {
		if (!this.enabled) return false;
		if (token === this.token) {
			logger.info(`[ADMIN] Token validated`);
			this.adminSessions.push(sessionId);
			this.token = env.ADMIN_TOKEN || v4();
			return true;
		}

		return false;
	}

	public removeSession(sessionId: Session["sessionId"]) {
		this.adminSessions = this.adminSessions.filter((id) => id !== sessionId);
	}

	public displayToken() {
		// if admin token is set, don't display it
		if (!this.enabled || env.ADMIN_TOKEN) return;

		const port = import.meta.env.PORT ?? 5173;
		const url = (PUBLIC_ORIGIN || `http://localhost:${port}`) + "?token=";
		logger.info(`[ADMIN] You can login with ${url + this.token} on port ${port}.`);
	}
}

export const adminTokenManager = new AdminTokenManager();
