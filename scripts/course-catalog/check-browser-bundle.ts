import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import snapshot from '../../features/course-catalog/generated/course-catalog.snapshot.json';
import type { CourseCatalogSnapshot } from '../../features/course-catalog/types';

const catalog = snapshot as CourseCatalogSnapshot;
const fingerprints = [
  catalog.offerings.at(-1)?.offeringId,
  catalog.manualListings.at(-1)?.id,
  catalog.requirementFacets.at(-1)?.id,
].filter((value): value is string => Boolean(value));
const chunksDirectory = join(process.cwd(), '.next', 'static', 'chunks');
const leakedChunks = readdirSync(chunksDirectory)
  .filter((file) => file.endsWith('.js'))
  .filter((file) => {
    const source = readFileSync(join(chunksDirectory, file), 'utf8');
    return fingerprints.every((fingerprint) => source.includes(fingerprint));
  });

if (leakedChunks.length > 0) {
  throw new Error(`Course catalog snapshot leaked into browser chunks: ${leakedChunks.join(', ')}`);
}

console.log(`Browser catalog boundary verified across ${readdirSync(chunksDirectory).length} chunk files.`);
