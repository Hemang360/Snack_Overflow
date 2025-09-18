import { getApiBase } from './config';

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
	[token: string]: unknown;
}

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
	const base = getApiBase();
	const res = await fetch(`${base}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init && init.headers ? init.headers : {}),
		},
		cache: 'no-store',
	});
	if (!res.ok) {
		let text: string | undefined;
		try { text = await res.text(); } catch {}
		throw new Error(`API ${res.status}: ${text || res.statusText}`);
	}
	try {
		return (await res.json()) as T;
	} catch (e) {
		throw new Error('Failed to parse API response');
	}
}

export async function checkHealth() {
	return apiFetch<ApiResponse>('/status', { method: 'GET' });
}

export interface LoginCollectorBody {
	collectorId: string;
	password: string;
}

export interface LoginCollectorResponse extends ApiResponse<{ collectorId: string }>{}

export async function loginCollector(body: LoginCollectorBody) {
	return apiFetch<LoginCollectorResponse>('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}
