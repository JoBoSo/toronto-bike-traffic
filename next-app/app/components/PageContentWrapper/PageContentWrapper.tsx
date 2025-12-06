'use client';

import React, { useState } from 'react';
import { PageContentProvider } from '@/src/contexts/PageContentContext';
import { CounterLocationFeature } from '@/src/interfaces/counterLocationTypes';
import { CyclingNetworkFeature } from '@/src/interfaces/cyclingNetworkTypes';

// Import the consumer components
import Sidebar from '@/components/Sidebar/Sidebar'; 
import MapWrapper from '@/components/Map/MapWrapper/MapWrapper';
// Import Header
import Header from '@/components/Header/Header'; 
// Styles
import styles from './PageContentWrapper.module.scss'; 

interface PageContentWrapperProps {
  counterLocations: CounterLocationFeature[];
  cyclingNetwork: CyclingNetworkFeature[];
}

/**
 * Client component that wraps the Sidebar and MapClient with the 
 * CounterDataProvider, and defines the primary layout for the map page
 * (Header, Sidebar, Map).
 */
export default function PageContentWrapper(
  { counterLocations, cyclingNetwork }: PageContentWrapperProps
) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <PageContentProvider locations={counterLocations} network={cyclingNetwork}>
      <div className={styles.mainContainer}> 
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />
        <div className={styles.contentColumn}>
          <Header /> 
          <div className={styles.mapArea}>
            <MapWrapper 
              isSidebarCollapsed={isSidebarCollapsed}
            /> 
          </div>
        </div>
      </div>
    </PageContentProvider>
  );
}