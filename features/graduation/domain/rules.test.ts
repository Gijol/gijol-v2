import { pickRuleSet } from './rules';

describe('pickRuleSet', () => {
  it('returns 2021+ rules for 2021 and later', () => {
    expect(pickRuleSet(2021).name).toContain('2021');
  });

  it('returns 2018-2020 rules for in-range years', () => {
    expect(pickRuleSet(2020).name).toContain('2018');
  });

  it('throws for unsupported years', () => {
    expect(() => pickRuleSet(2017)).toThrow('Unsupported entry year');
  });
});
