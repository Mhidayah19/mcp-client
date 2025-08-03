import { Agent, type AgentNamespace, routeAgentRequest } from "agents";
import { MCPClientManager } from "agents/mcp/client";

type Env = {
	MyAgent: AgentNamespace<MyAgent>;
	HOST: string;
	// Add any necessary OAuth-related environment variables
	OAUTH_CLIENT_ID?: string;
	OAUTH_CLIENT_SECRET?: string;
};

export class MyAgent extends Agent<Env, never> {
	mcp = new MCPClientManager("my-agent", "1.0.0");

	async onRequest(request: Request): Promise<Response> {
		const reqUrl = new URL(request.url);
		console.log('Incoming request:', reqUrl.pathname);

		// Handle MCP server addition
		if (reqUrl.pathname.endsWith("add-mcp") && request.method === "POST") {
			const mcpServer = (await request.json()) as { url: string; name: string };
			await this.addMcpServer(mcpServer.name, mcpServer.url, this.env.HOST);
			return new Response("Ok", { status: 200 });
		}

		// Handle OAuth callback
		if (reqUrl.pathname.endsWith("oauth/callback")) {
			try {
				const code = reqUrl.searchParams.get('code');
				const state = reqUrl.searchParams.get('state');

				if (!code) {
					return new Response("Missing authorization code", { status: 400 });
				}

				// Validate state if needed
				// You might want to check if the state matches a previously generated state

				// Perform token exchange
				// This is a placeholder - replace with actual token exchange logic
				const tokenResponse = await this.exchangeAuthorizationCode(code);

				return new Response(JSON.stringify(tokenResponse), { 
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				console.error('OAuth callback error:', error);
				return new Response(`Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 400 });
			}
		}

		return new Response("Not found", { status: 404 });
	}

	// Placeholder method for token exchange
	private async exchangeAuthorizationCode(code: string) {
		// Implement actual token exchange logic
		// This typically involves:
		// 1. Sending a POST request to the authorization server
		// 2. Exchanging the code for an access token
		// 3. Potentially storing or processing the token
		console.log('Exchanging authorization code:', code);
		
		// Example (replace with actual implementation):
		// const response = await fetch('https://oauth-provider.com/token', {
		// 	method: 'POST',
		// 	headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		// 	body: new URLSearchParams({
		// 		client_id: this.env.OAUTH_CLIENT_ID,
		// 		client_secret: this.env.OAUTH_CLIENT_SECRET,
		// 		code: code,
		// 		grant_type: 'authorization_code',
		// 		redirect_uri: `${this.env.HOST}/oauth/callback`
		// 	})
		// });

		// if (!response.ok) {
		// 	throw new Error('Failed to exchange authorization code');
		// }

		// return await response.json();
		
		return { status: 'success', message: 'Token exchange simulated' };
	}
}

export default {
	async fetch(request: Request, env: Env) {
		return (
			(await routeAgentRequest(request, env, { cors: true })) ||
			new Response("Not found", { status: 404 })
		);
	},
} satisfies ExportedHandler<Env>;
