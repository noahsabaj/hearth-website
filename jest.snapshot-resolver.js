module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    return testPath
      .replace(/\.test\.([tj]sx?)/, `${snapshotExtension}`)
      .replace('src/', 'src/__snapshots__/');
  },

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    return snapshotFilePath
      .replace('__snapshots__/', '')
      .replace(snapshotExtension, '.test.tsx');
  },

  // Example test path, used for preflight consistency check of the implementation above
  testPathForConsistencyCheck: 'src/components/Button/Button.test.tsx',
};