import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { MinorDeclarationTerms } from '../lib/types/grad';
import { MinorDeclarationTermFields } from '../components/dashboard/minor-declaration-term-fields';

function MinorDeclarationTermFieldsHarness() {
  const [terms, setTerms] = useState<MinorDeclarationTerms>({});

  return <MinorDeclarationTermFields selectedMinors={['IR']} terms={terms} onChange={setTerms} />;
}

describe('MinorDeclarationTermFields', () => {
  it('keeps partial year input while the user types a declaration year', async () => {
    const user = userEvent.setup();
    render(<MinorDeclarationTermFieldsHarness />);

    const yearInput = screen.getByLabelText('선언 연도');
    await user.type(yearInput, '2026');

    expect(yearInput).toHaveValue(2026);
  });
});

it('explains energy closure while allowing existing declarers to enter their term', () => {
  render(
    <MinorDeclarationTermFields
      selectedMinors={['FE']}
      terms={{ FE: { year: 2024, semester: '2' } }}
      onChange={() => {}}
    />,
  );
  expect(screen.getByLabelText('선언 연도')).toHaveValue(2024);
  expect(screen.getByText(/에너지 부전공은 2025-1학기부터 취소만/)).toBeInTheDocument();
});
