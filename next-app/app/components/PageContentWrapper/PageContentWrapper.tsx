'use client';

import React, { useState } from 'react';
import { PageContentProvider } from '@/src/contexts/PageContentContext';
import { CounterLocationFeature } from '@/src/interfaces/counterLocationTypes';
import { CyclingNetworkFeature } from '@/src/interfaces/cyclingNetworkTypes';
import Sidebar from '@/components/Sidebar/Sidebar'; 
import MapWrapper from '@/components/Map/MapWrapper/MapWrapper';
import styles from './PageContentWrapper.module.scss'; 

interface PageContentWrapperProps {
  counterLocations: CounterLocationFeature[];
  counterGroups: any;
  cyclingNetwork: CyclingNetworkFeature[];
}

/**
 * Client component that wraps the Sidebar and MapClient with the 
 * CounterDataProvider, and defines the primary layout for the map page
 * (Header, Sidebar, Map).
 */
export default function PageContentWrapper(
  { counterLocations, counterGroups, cyclingNetwork }: PageContentWrapperProps
) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <PageContentProvider locations={counterLocations} counterGroups={counterGroups} network={cyclingNetwork}>
      <div className={styles.mainContainer}> 
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />
        <div className={styles.contentColumn}>
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