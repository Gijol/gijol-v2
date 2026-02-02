// features/roadmap/fetcher.ts
import type { RoadmapData } from '@/features/roadmap/types';

/**
 * Fetches roadmap data from the API by slug
 * @param slug - The preset slug (e.g., 'EECS_AI')
 * @returns Promise<RoadmapData> - The roadmap data
 * @throws Error if the fetch fails or preset is not found
 */
export async function getRoadmapData(slug: string): Promise<RoadmapData> {
  const response = await fetch(`/api/roadmap/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Roadmap preset '${slug}' not found`);
    }
    throw new Error(`Failed to fetch roadmap: ${response.statusText}`);
  }

  return response.json();
}
