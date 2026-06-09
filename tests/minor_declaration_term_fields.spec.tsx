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
