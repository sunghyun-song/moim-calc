/**
 * 회식 정산 계산 로직
 *
 * - 안주값(총금액 - 술값)은 참석자 전원이 똑같이 나눕니다.
 * - 술값은 술 마신 사람끼리만 나눕니다.
 * - 1인당 금액은 원 단위 올림하여, 모자라는 일이 없도록 합니다.
 */

/** 정산 입력값 */
export type SettlementInput = {
  /** 총금액 */
  total: number;
  /** 전체 술값 (소주 + 맥주) */
  alcohol: number;
  /** 술 마신 사람 수 */
  drinkers: number;
  /** 술 안 마신 사람 수 */
  nonDrinkers: number;
};

/** 정산 결과 */
export type SettlementResult = {
  /** 총금액 */
  total: number;
  /** 술금액 */
  alcohol: number;
  /** 안주값 (총금액 - 술금액) */
  food: number;
  /** 술 마신 사람 1인당 금액 */
  perDrinker: number;
  /** 술 안 마신 사람 1인당 금액 */
  perNonDrinker: number;
  /** 술 마신 사람 수 */
  drinkers: number;
  /** 술 안 마신 사람 수 */
  nonDrinkers: number;
};

/** 입력값 검증. 문제가 있으면 오류 메시지를, 없으면 null 을 반환합니다. */
export function validate(input: SettlementInput): string | null {
  const { total, alcohol, drinkers, nonDrinkers } = input;
  if (total <= 0) return '총금액을 입력해 주세요.';
  if (alcohol < 0) return '술값은 0원 이상이어야 합니다.';
  if (alcohol > total) return '술값이 총금액보다 클 수 없습니다.';
  if (drinkers + nonDrinkers <= 0) return '인원 수를 입력해 주세요.';
  if (alcohol > 0 && drinkers <= 0) return '술값이 있으면 술 마신 사람이 1명 이상이어야 합니다.';
  return null;
}

/** 정산 계산. 입력값은 validate 를 통과했다고 가정합니다. */
export function calculate(input: SettlementInput): SettlementResult {
  const { total, alcohol, drinkers, nonDrinkers } = input;
  const food = total - alcohol;
  const foodShare = food / (drinkers + nonDrinkers);
  const alcoholShare = drinkers > 0 ? alcohol / drinkers : 0;

  return {
    total,
    alcohol,
    food,
    perDrinker: drinkers > 0 ? Math.ceil(foodShare + alcoholShare) : 0,
    perNonDrinker: nonDrinkers > 0 ? Math.ceil(foodShare) : 0,
    drinkers,
    nonDrinkers,
  };
}

/** 금액을 "12,345원" 형식으로 변환 */
export function won(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`;
}

/** 단톡방에 붙여넣기 좋은 텍스트로 변환 */
export function toShareText(r: SettlementResult): string {
  const lines = [
    '[모임회식정산]',
    `총금액: ${won(r.total)}`,
    `술금액: ${won(r.alcohol)}`,
    `안주값: ${won(r.food)}`,
    '',
  ];
  if (r.drinkers > 0) lines.push(`술 마신 사람 (${r.drinkers}명): 1인당 ${won(r.perDrinker)}`);
  if (r.nonDrinkers > 0) lines.push(`술 안 마신 사람 (${r.nonDrinkers}명): 1인당 ${won(r.perNonDrinker)}`);
  return lines.join('\n');
}
