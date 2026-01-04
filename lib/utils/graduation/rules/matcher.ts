import { Course, Matcher, RuleEvalContext } from '@lib/types/grad-matcher-rule-types';

export function matches(course: Course, matcher: Matcher, ctx: RuleEvalContext): boolean {
  switch (matcher.type) {
    case 'codePrefix':
      return course.courseCode.startsWith(matcher.value);
    case 'codeIn':
      return matcher.value.includes(course.courseCode);
    case 'codeRegex':
      return new RegExp(matcher.value).test(course.courseCode);
    case 'nameIncludes':
      return course.courseName.includes(matcher.value);
    case 'courseTypeIncludes':
      return course.courseType.includes(matcher.value);

    case 'dynamicMajorPrefix': {
      const prefix = ctx.userMajor?.trim();
      if (!prefix) return false;
      return course.courseCode.startsWith(prefix);
    }

    case 'dynamicMinorPrefixes': {
      const prefixes = (ctx.userMinors ?? []).map((p) => p.trim()).filter(Boolean);
      if (prefixes.length === 0) return false;
      return prefixes.some((p) => course.courseCode.startsWith(p));
    }

    default: {
      const _exhaustive: never = matcher;
      return _exhaustive;
    }
  }
}

export function matchesAny(course: Course, matchers: Matcher[], ctx: RuleEvalContext): boolean {
  return matchers.some((m) => matches(course, m, ctx));
}
