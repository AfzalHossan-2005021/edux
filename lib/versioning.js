/**
 * Content Versioning Library
 * Track course content changes and history
 */

// Version action types
export const VersionActions = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  RESTORE: 'restore',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
};

// Content types that can be versioned
export const ContentTypes = {
  COURSE: 'course',
  TOPIC: 'topic',
  LECTURE: 'lecture',
  EXAM: 'exam',
  QUESTION: 'question',
};

// Create version entry
export function createVersionEntry(options) {
  const {
    contentType,
    contentId,
    action,
    userId,
    previousData,
    newData,
    message,
  } = options;

  return {
    versionId: `VER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    contentType,
    contentId,
    action,
    userId,
    previousData: previousData ? JSON.stringify(previousData) : null,
    newData: newData ? JSON.stringify(newData) : null,
    message: message || `${action} ${contentType}`,
    createdAt: new Date().toISOString(),
  };
}

// Calculate diff between versions
export function calculateDiff(oldData, newData) {
  if (!oldData || !newData) return null;

  const changes = [];
  const oldObj = typeof oldData === 'string' ? JSON.parse(oldData) : oldData;
  const newObj = typeof newData === 'string' ? JSON.parse(newData) : newData;

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        field: key,
        oldValue: oldVal,
        newValue: newVal,
        type: oldVal === undefined ? 'added' : newVal === undefined ? 'removed' : 'modified',
      });
    }
  }

  return {
    hasChanges: changes.length > 0,
    changeCount: changes.length,
    changes,
  };
}

// Format version for display
export function formatVersion(version) {
  const actionLabels = {
    create: '➕ Created',
    update: '✏️ Updated',
    delete: '🗑️ Deleted',
    restore: '♻️ Restored',
    publish: '📢 Published',
    unpublish: '📴 Unpublished',
  };

  return {
    ...version,
    actionLabel: actionLabels[version.action] || version.action,
    formattedDate: new Date(version.createdAt).toLocaleString(),
    diff: calculateDiff(version.previousData, version.newData),
  };
}

// Compare two versions
export function compareVersions(version1, version2) {
  const data1 = version1.newData ? JSON.parse(version1.newData) : {};
  const data2 = version2.newData ? JSON.parse(version2.newData) : {};

  return calculateDiff(data1, data2);
}

// Get version summary
export function getVersionSummary(versions) {
  const summary = {
    total: versions.length,
    byAction: {},
    byContentType: {},
    recentChanges: versions.slice(0, 5),
    firstVersion: versions[versions.length - 1],
    latestVersion: versions[0],
  };

  for (const version of versions) {
    // Count by action
    summary.byAction[version.action] = (summary.byAction[version.action] || 0) + 1;
    // Count by content type
    summary.byContentType[version.contentType] = (summary.byContentType[version.contentType] || 0) + 1;
  }

  return summary;
}

// Check if version can be restored
export function canRestore(version) {
  // Can't restore delete actions (no newData)
  if (version.action === VersionActions.DELETE) return false;
  // Need newData to restore
  if (!version.newData) return false;
  return true;
}

// Generate restore data from version
export function getRestoreData(version) {
  if (!canRestore(version)) return null;
  
  try {
    return JSON.parse(version.newData);
  } catch (e) {
    return null;
  }
}

// Create rollback plan
export function createRollbackPlan(targetVersion, allVersions) {
  const targetIndex = allVersions.findIndex((v) => v.versionId === targetVersion.versionId);
  
  if (targetIndex === -1) return null;
  if (targetIndex === 0) return { steps: [], message: 'Already at this version' };

  const versionsToRollback = allVersions.slice(0, targetIndex);
  
  return {
    targetVersion,
    steps: versionsToRollback.map((v) => ({
      versionId: v.versionId,
      action: v.action,
      message: v.message,
      willUndo: true,
    })),
    message: `Will undo ${versionsToRollback.length} changes`,
  };
}
