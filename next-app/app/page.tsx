import MapWrapper from '@/components/Map/MapWrapper/MapWrapper';
import { CyclingNetworkPkgClient } from '@/src/api/torontoOpenDataApi/clients/CyclingNetworkPkgClient';
import { 
    PermanentBicycleCountersPkgClient
} from '@/src/api/torontoOpenDataApi/clients/PermanentBicycleCountersPkgClient';
import React from 'react';

export default async function HomePage() {
    let counterLocations: any = null; 
    let cyclingNetwork: any = null; 
    let error: string | null = null;

    // --- Server-Side Fetching ---
    try {
        // This runs once on the server, fetching the data before the map component loads
        const pbClient = new PermanentBicycleCountersPkgClient();
        counterLocations = await pbClient.getCounterLocations();

        const cnClient = new CyclingNetworkPkgClient();
        cyclingNetwork = await cnClient.getGeoJson();
    } catch (e) {
        error = e instanceof Error ? e.message : "An unknown fetching error occurred.";
        console.error("Fatal Fetch Error:", e);
    }

    if (error || !counterLocations) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '16px' }}>
                <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', border: '1px solid #f87171' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>Error Loading Map Data</h1>
                    <p style={{ color: '#4b5563' }}>Could not load required GeoJSON data for the map.</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '12px' }}>Details: {error || "Data not found or empty."}</p>
                </div>
            </div>
        );
    }
    
    // --- Client-Side Map Rendering ---
    return (
        <main style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <MapWrapper data={[
                counterLocations, 
                cyclingNetwork
            ]} />
        </main>
    );
}