/**
 * Generic fetch utility for making GET requests.
 * Uses generics (T) to provide a type-safe return value, 
 * assuming the server returns JSON data.
 * * This function is intended for server-side use in Next.js 
 * to leverage fetch caching and bypass CORS limitations.
 * * @template T The expected type of the JSON response data.
 * @param url The full URL string for the API endpoint.
 * @param options Optional fetch request configuration (e.g., headers, caching).
 * @returns A promise that resolves to the JSON data of type T.
 * @throws An error if the network request fails or the response status is not 2xx.
 */
export async function get<T>(url: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(url, options);

        // 1. Check for non-2xx HTTP status codes
        if (!response.ok) {
            // Read the error message from the response body if available
            let errorMessage = `HTTP error! Status: ${response.status}`;
            
            try {
                // Clone the response before reading to allow multiple reads
                const errorBody = await response.clone().json();
                errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
            } catch (e) {
                // If JSON parsing fails, the body is likely plain text or empty
                try {
                    const text = await response.text();
                    if (text) {
                        errorMessage = `HTTP error! Status: ${response.status}. Body: ${text.substring(0, 100)}...`;
                    }
                } catch (textError) {
                    // Can't read body, use basic error
                }
            }

            throw new Error(`Failed to fetch data from ${url}: ${errorMessage}`);
        }

        // 2. Parse the JSON response and cast it to the expected type T
        const data: T = await response.json();
        
        return data;

    } catch (error) {
        // Log the error and re-throw for the calling function to handle
        console.error(`[API GET Error] URL: ${url}`, error);
        
        // Re-throw the error to ensure consuming functions can catch it
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`An unknown error occurred while fetching ${url}`);
        }
    }
}
