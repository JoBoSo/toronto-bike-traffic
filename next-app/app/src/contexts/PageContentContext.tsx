'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { CounterLocationFeature } from '@/src/interfaces/counterLocationTypes';
import { CyclingNetworkFeature } from '@/src/interfaces/cyclingNetworkTypes';

// 3. Define the shape of the Context value, which holds an array of these features
interface PageContentContextType {
    counterLocations: CounterLocationFeature[];
    cyclingNetwork: CyclingNetworkFeature[];
    isLoading: boolean;
}

// Create the Context with a default (undefined) value
const PageContentContext = createContext<PageContentContextType | undefined>(undefined);

interface PageContentProviderProps {
    locations: CounterLocationFeature[];
    network: CyclingNetworkFeature[];
    children: ReactNode;
}

/**
 * Client Component Provider: Renders the context provider and holds the 
 * data fetched from the server.
 */
export function PageContentProvider({ locations, network, children }: PageContentProviderProps) {
    const contextValue: PageContentContextType = {
        counterLocations: locations,
        cyclingNetwork: network,
        isLoading: false, // Data is already loaded since it came from the server
    };

    return (
        <PageContentContext.Provider value={contextValue}>
            {children}
        </PageContentContext.Provider>
    );
}

/**
 * Custom Hook to easily consume the counter data anywhere in the component tree.
 */
export const usePageContentContext = (): PageContentContextType => {
    const context = useContext(PageContentContext);
    if (context === undefined) {
        throw new Error('usePageContentContext must be used within a PageContentProvider');
    }
    return context;
};