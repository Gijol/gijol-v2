export interface CourseMetadata {
  id: string;
  code: string;
  name: string;
  credit: number;
  is_offered: boolean;
}

export interface RecommendationItem {
  courseCode: string;
  courseName: string;
  credit: number;
  reason: string;
}

export interface CourseRepository {
  findByCode(code: string): Promise<CourseMetadata | null>;
  findAllOffered(): Promise<CourseMetadata[]>;
}

// Mock Implementation
export class MockCourseRepository implements CourseRepository {
  private courses: CourseMetadata[] = [
    { id: '1', code: 'CSE101', name: 'Computer Science 101', credit: 3, is_offered: true },
    { id: '2', code: 'MAT101', name: 'Calculus I', credit: 3, is_offered: true },
    { id: '3', code: 'ENG101', name: 'English 101', credit: 3, is_offered: true },
    // Add more mocks as needed
  ];

  async findByCode(code: string): Promise<CourseMetadata | null> {
    return this.courses.find((c) => c.code === code) || null;
  }

  async findAllOffered(): Promise<CourseMetadata[]> {
    return this.courses.filter((c) => c.is_offered);
  }
}

/**
 * Maps deficit credits/categories to specific course recommendations.
 * This is where the complex "What should I take?" logic lives.
 */
export const mapDeficitToRecommendations = async (
  deficits: Record<string, number>,
  repo: CourseRepository,
): Promise<RecommendationItem[]> => {
  const recommendations: RecommendationItem[] = [];
  const offeredCourses = await repo.findAllOffered();

  // Simple heuristic: if 'major' is in deficit, recommend any offered major course
  // (In reality, this would filter by specific major requirements)
  if (deficits['major'] > 0) {
    // Just pick one for demo purposes
    const rec = offeredCourses.find((c) => c.code.startsWith('CSE')); // Assuming CSE is major
    if (rec) {
      recommendations.push({
        courseCode: rec.code,
        courseName: rec.name,
        credit: rec.credit,
        reason: 'Major requirement deficit',
      });
    }
  }

  return recommendations;
};
