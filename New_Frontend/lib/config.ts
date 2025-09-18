export const getApiBase = (): string => {
	if (typeof window !== 'undefined') {
	  const fromEnv = process.env.NEXT_PUBLIC_API_BASE;
	  if (fromEnv && fromEnv.length > 0) return fromEnv;
	  return 'https://unenlightening-lisha-unsurveyable.ngrok-free.app';
	}
	// During SSR, prefer env or default to ngrok URL
	return process.env.NEXT_PUBLIC_API_BASE || 'https://unenlightening-lisha-unsurveyable.ngrok-free.app';
  };