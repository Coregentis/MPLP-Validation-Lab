
const BASE_URL = 'http://localhost:3000';

export async function checkRoute(route: string): Promise<boolean> {
    try {
        // Handle full URL if passed
        const url = route.startsWith('http') ? route : `${BASE_URL}${route}`;
        const res = await fetch(url);
        if (res.status === 200) {
            console.log(`[PASS] ${route} -> 200 OK`);
            return true;
        } else {
            console.error(`[FAIL] ${route} -> ${res.status}`);
            return false;
        }
    } catch (e) {
        console.error(`[FAIL] ${route} -> Network Error: ${(e as Error).message}`);
        return false;
    }
}
