import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const RUNTIME_ROOTS = ['components', 'features', 'lib', 'pages'];
const SERVER_QUERY_IMPORTERS = new Set([
  'features/graduation/usecases/uploadAndEvaluate.ts',
  'pages/api/courses/index.ts',
  'pages/api/courses/search.ts',
  'pages/api/roadmap/[slug].ts',
]);

function collectTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return collectTypeScriptFiles(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

describe('course catalog server seam', () => {
  it('keeps generated snapshot imports behind the server catalog query module', () => {
    const workspace = process.cwd();
    const runtimeFiles = RUNTIME_ROOTS.flatMap((root) => collectTypeScriptFiles(join(workspace, root)));
    const generatedImporters = runtimeFiles
      .filter((file) => /(?:from ['"]\.\/generated['"]|course-catalog\/generated)/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(workspace, file));

    expect(generatedImporters).toEqual(['features/course-catalog/server-catalog-query.ts']);
  });

  it('allows only server entrypoints to import the snapshot-owning module', () => {
    const workspace = process.cwd();
    const runtimeFiles = RUNTIME_ROOTS.flatMap((root) => collectTypeScriptFiles(join(workspace, root)));
    const importers = runtimeFiles
      .filter((file) => readFileSync(file, 'utf8').includes('course-catalog/server-catalog-query'))
      .map((file) => relative(workspace, file));

    expect(new Set(importers)).toEqual(SERVER_QUERY_IMPORTERS);
  });
});
