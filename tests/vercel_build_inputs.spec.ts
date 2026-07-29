import { readFileSync } from 'fs';
import ignore from 'ignore';
import path from 'path';

interface PackageJson {
  scripts: Record<string, string>;
}

describe('Vercel build inputs', () => {
  it('uploads every TypeScript entrypoint invoked by postbuild', () => {
    const rootDir = path.resolve(__dirname, '..');
    const packageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8')) as PackageJson;
    const vercelIgnore = readFileSync(path.join(rootDir, '.vercelignore'), 'utf8');
    const postbuildScriptNames = Array.from(
      packageJson.scripts.postbuild.matchAll(/npm run ([\w:-]+)/g),
      (match) => match[1],
    );
    const postbuildEntrypoints = postbuildScriptNames
      .map((scriptName) => packageJson.scripts[scriptName])
      .flatMap((script) => script?.match(/\S+\.ts\b/g) ?? []);
    const ignoredEntrypoints = postbuildEntrypoints.filter((entrypoint) =>
      ignore().add(vercelIgnore).ignores(entrypoint),
    );

    expect(postbuildEntrypoints).not.toHaveLength(0);
    expect(ignoredEntrypoints).toEqual([]);
  });
});
