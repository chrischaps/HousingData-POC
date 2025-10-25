import { useEffect, useState } from 'react';
import { migrateFromLocalStorage } from '../utils/indexedDBCache';

/**
 * Cache Migration Component
 *
 * Automatically migrates cache data from localStorage to IndexedDB on first load.
 * Shows a subtle notification during migration.
 */
export const CacheMigration = () => {
  const [migrating, setMigrating] = useState(false);
  const [migratedCount, setMigratedCount] = useState(0);

  useEffect(() => {
    const performMigration = async () => {
      // Check if migration has already been performed
      const migrationFlag = localStorage.getItem('cache-migrated-to-indexeddb');

      if (migrationFlag === 'true') {
        console.log('[Migration] Already migrated to IndexedDB');
        return;
      }

      console.log('[Migration] Starting migration from localStorage to IndexedDB');
      setMigrating(true);

      try {
        const count = await migrateFromLocalStorage();
        setMigratedCount(count);

        // Set migration flag
        localStorage.setItem('cache-migrated-to-indexeddb', 'true');

        console.log(`[Migration] ✓ Successfully migrated ${count} entries`);

        // Hide notification after 3 seconds
        setTimeout(() => {
          setMigrating(false);
        }, 3000);
      } catch (error) {
        console.error('[Migration] Failed:', error);
        setMigrating(false);
      }
    };

    performMigration();
  }, []);

  if (!migrating && migratedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-start gap-3">
        {migrating ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <div>
              <div className="font-medium text-blue-900">Upgrading Cache</div>
              <div className="text-sm text-blue-700">
                Migrating to IndexedDB for better performance...
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-blue-500 text-xl">✓</div>
            <div>
              <div className="font-medium text-blue-900">Cache Upgraded</div>
              <div className="text-sm text-blue-700">
                Migrated {migratedCount} entries to IndexedDB
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
