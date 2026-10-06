import { describe, expect, it } from 'vitest';
import { calculate, toShareText, validate } from './settlement';

describe('calculate', () => {
  it('안주값은 전원, 술값은 술 마신 사람끼리 나눈다', () => {
    // 안주 60,000 / 6명 = 10,000, 술 40,000 / 4명 = 10,000
    const r = calculate({ total: 100000, alcohol: 40000, drinkers: 4, nonDrinkers: 2 });
    expect(r.food).toBe(60000);
    expect(r.perNonDrinker).toBe(10000);
    expect(r.perDrinker).toBe(20000);
  });

  it('나누어 떨어지지 않으면 원 단위 올림한다', () => {
    // 안주 100,000 / 3 = 33,333.33.., 술 10,000 / 2 = 5,000
    const r = calculate({ total: 110000, alcohol: 10000, drinkers: 2, nonDrinkers: 1 });
    expect(r.perNonDrinker).toBe(33334);
    expect(r.perDrinker).toBe(38334);
  });

  it('올림 결과 합계가 총금액보다 작지 않다', () => {
    const input = { total: 187700, alcohol: 53000, drinkers: 5, nonDrinkers: 3 };
    const r = calculate(input);
    expect(r.perDrinker * 5 + r.perNonDrinker * 3).toBeGreaterThanOrEqual(input.total);
  });

  it('술 안 마신 사람이 없으면 0원', () => {
    const r = calculate({ total: 50000, alcohol: 20000, drinkers: 5, nonDrinkers: 0 });
    expect(r.perDrinker).toBe(10000);
    expect(r.perNonDrinker).toBe(0);
  });
});

describe('validate', () => {
  const ok = { total: 100000, alcohol: 40000, drinkers: 4, nonDrinkers: 2 };
  it('정상 입력은 null', () => expect(validate(ok)).toBeNull());
  it('술값 > 총금액', () => expect(validate({ ...ok, alcohol: 200000 })).not.toBeNull());
  it('인원 0명', () => expect(validate({ ...ok, drinkers: 0, nonDrinkers: 0 })).not.toBeNull());
  it('술값 있는데 술 마신 사람 0명', () => expect(validate({ ...ok, drinkers: 0 })).not.toBeNull());
  it('총금액 0원', () => expect(validate({ ...ok, total: 0 })).not.toBeNull());
});

describe('toShareText', () => {
  it('복사용 텍스트에 금액이 포함된다', () => {
    const text = toShareText(calculate({ total: 100000, alcohol: 40000, drinkers: 4, nonDrinkers: 2 }));
    expect(text).toContain('총금액: 100,000원');
    expect(text).toContain('술 마신 사람 (4명): 1인당 20,000원');
    expect(text).toContain('술 안 마신 사람 (2명): 1인당 10,000원');
  });
});
