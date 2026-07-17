import { readFileSync, readdirSync } from 'fs';
import path from 'path';

function collectPageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectPageFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith('.tsx') ? [absolutePath] : [];
  });
}

describe('dashboard route scope', () => {
  it('keeps dashboard-only modules out of the global app interface', () => {
    const source = readFileSync(path.join(process.cwd(), 'pages/_app.tsx'), 'utf8');

    expect(source).not.toContain('@components/layouts/layout');
    expect(source).not.toContain('QueryClientProvider');
    expect(source).not.toContain('ReactQueryDevtools');
    expect(source).not.toContain('Toaster');
    expect(source).not.toContain('ThemeProvider');
  });

  it('makes every dashboard page explicitly own the dashboard layout', () => {
    const pageFiles = collectPageFiles(path.join(process.cwd(), 'pages/dashboard'));
    expect(pageFiles.length).toBeGreaterThan(0);

    pageFiles.forEach((file) => {
      const source = readFileSync(file, 'utf8');
      expect(source).toMatch(
        /import \{ (dashboard|graduation|timetable)Layout \} from '@\/components\/layouts\/.+-runtime'/,
      );
      expect(source).toMatch(/\.getLayout = (dashboard|graduation|timetable)Layout/);
    });
  });

  it('limits Query and toast providers to their real consumers', () => {
    const dashboardRuntime = readFileSync(path.join(process.cwd(), 'components/layouts/dashboard-runtime.tsx'), 'utf8');
    const timetableRuntime = readFileSync(path.join(process.cwd(), 'components/layouts/timetable-runtime.tsx'), 'utf8');
    const graduationRuntime = readFileSync(
      path.join(process.cwd(), 'components/layouts/graduation-runtime.tsx'),
      'utf8',
    );

    expect(dashboardRuntime).not.toContain('QueryClientProvider');
    expect(dashboardRuntime).not.toContain('Toaster');
    expect(timetableRuntime).toContain('QueryClientProvider');
    expect(graduationRuntime).toContain('Toaster');

    ['pages/dashboard/timetable.tsx', 'pages/dashboard/timetable/[planId].tsx'].forEach((file) => {
      expect(readFileSync(path.join(process.cwd(), file), 'utf8')).toContain('.getLayout = timetableLayout');
    });
    [
      'pages/dashboard/index.tsx',
      'pages/dashboard/graduation/certificate-builder.tsx',
      'pages/dashboard/graduation/upload.tsx',
    ].forEach((file) => {
      expect(readFileSync(path.join(process.cwd(), file), 'utf8')).toContain('.getLayout = graduationLayout');
    });
  });

  it('keeps one outer dashboard runtime across scoped provider layouts', () => {
    const timetableRuntime = readFileSync(path.join(process.cwd(), 'components/layouts/timetable-runtime.tsx'), 'utf8');
    const graduationRuntime = readFileSync(
      path.join(process.cwd(), 'components/layouts/graduation-runtime.tsx'),
      'utf8',
    );
    expect(timetableRuntime).toContain('<DashboardRuntime>');
    expect(graduationRuntime).toContain('<DashboardRuntime overlay={<Toaster />}>');
  });

  it('keeps the dashboard shell deep by removing its public pass-through branch', () => {
    const source = readFileSync(path.join(process.cwd(), 'components/layouts/layout.tsx'), 'utf8');
    expect(source).not.toContain("router.pathname.includes('dashboard')");
    expect(source).not.toContain('if (!isDashboard)');
  });
});
