import { render, screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';
import { MultiSelect } from '@/components/ui/multi-select';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { MINOR_OPTIONS } from '@/lib/const/major-minor-options';

describe('MultiSelect option discovery', () => {
  it('shows the complete minor option count and keeps every minor discoverable', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

    render(
      <MultiSelect
        options={MINOR_OPTIONS}
        selected={[]}
        onChange={() => undefined}
        placeholder="부전공 선택…"
        optionName="부전공"
      />,
    );

    await user.click(screen.getByRole('combobox'));

    expect(await screen.findByText(`전체 ${MINOR_OPTIONS.length}개 부전공`)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /의생명/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /반도체공학/ })).not.toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: '부전공 검색' }), '마음');

    expect(screen.getByRole('option', { name: /마음과 행동/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /전기전자컴퓨터공학/ })).not.toBeInTheDocument();
    expect(screen.getByText(`검색 결과 1개 / 전체 ${MINOR_OPTIONS.length}개 부전공`)).toBeInTheDocument();
  });

  it('keeps a non-portalled option list inside its parent dialog so wheel scrolling is not locked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>학적 정보 수정</DialogTitle>
          <DialogDescription>학적 컨텍스트를 수정합니다.</DialogDescription>
          <MultiSelect
            options={MINOR_OPTIONS}
            selected={[]}
            onChange={() => undefined}
            placeholder="부전공 선택…"
            optionName="부전공"
            portalled={false}
          />
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole('combobox'));

    const dialog = screen.getByRole('dialog', { name: '학적 정보 수정' });
    const listbox = await screen.findByRole('listbox', { name: '부전공' });
    expect(dialog.contains(listbox)).toBe(true);
  });
});
