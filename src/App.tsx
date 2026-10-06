import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { calculate, toShareText, validate, won, type SettlementResult } from './settlement';

/** "12,345" 같은 문자열에서 숫자만 뽑아 정수로 변환 */
function parseMoney(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/** 입력 중인 금액을 천 단위 콤마 형식으로 변환 (빈 값은 빈 문자열 유지) */
function formatMoney(text: string): string {
  const digits = text.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 12);
  return digits ? Number(digits).toLocaleString('ko-KR') : '';
}

type MoneyFieldProps = {
  id: string;
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
};

/** 금액 입력 필드: 모바일 숫자 키패드 + 자동 콤마 */
function MoneyField({ id, label, helper, value, onChange }: MoneyFieldProps) {
  return (
    <TextField
      id={id}
      fullWidth
      label={label}
      helperText={helper}
      placeholder="0"
      value={value}
      onChange={(e) => onChange(formatMoney(e.target.value))}
      slotProps={{
        htmlInput: { inputMode: 'numeric', pattern: '[0-9,]*', style: { fontSize: 20, fontWeight: 600 } },
        input: { endAdornment: <InputAdornment position="end">원</InputAdornment> },
      }}
    />
  );
}

type PeopleStepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

/** 인원 수 입력: 엄지로 누르기 쉬운 - / + 버튼 + 직접 입력 */
function PeopleStepper({ label, value, onChange }: PeopleStepperProps) {
  const set = (n: number) => onChange(Math.max(0, Math.min(999, n)));
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
      <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <IconButton aria-label={`${label} 줄이기`} onClick={() => set(value - 1)} disabled={value <= 0}
          sx={{ bgcolor: 'action.hover', width: 44, height: 44 }}>
          <RemoveRoundedIcon />
        </IconButton>
        <TextField
          value={value}
          onChange={(e) => set(parseMoney(e.target.value))}
          onFocus={(e) => e.target.select()}
          sx={{ width: 72 }}
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
              'aria-label': label,
              style: { textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '8px 4px' },
            },
            input: { endAdornment: <InputAdornment position="end" sx={{ ml: 0, mr: -0.5 }}>명</InputAdornment> },
          }}
        />
        <IconButton aria-label={`${label} 늘리기`} onClick={() => set(value + 1)}
          sx={{ bgcolor: 'action.hover', width: 44, height: 44 }}>
          <AddRoundedIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

/** 결과 박스의 한 줄 (라벨 + 금액) */
function ResultRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Box sx={{ py: 1.25 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: strong ? 28 : 22,
          fontWeight: 800,
          color: strong ? 'primary.main' : 'text.primary',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/**
 * 모임회식정산계산기 메인 화면
 * 1) 총금액 / 술값 / 술 마신 인원 / 안 마신 인원 입력
 * 2) 계산하기 → 결과 박스 노출 + 자동 스크롤
 * 3) 결과 박스는 단톡방에 붙여넣기 좋은 텍스트로 복사 가능
 */
export default function App() {
  const [total, setTotal] = useState('');
  const [alcohol, setAlcohol] = useState('');
  const [drinkers, setDrinkers] = useState(0);
  const [nonDrinkers, setNonDrinkers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SettlementResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const input = { total: parseMoney(total), alcohol: parseMoney(alcohol), drinkers, nonDrinkers };
    const message = validate(input);
    setError(message);
    if (message) {
      setResult(null);
      return;
    }
    setResult(calculate(input));
    // 결과 렌더 후 결과 박스로 부드럽게 스크롤
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const handleReset = () => {
    setTotal('');
    setAlcohol('');
    setDrinkers(0);
    setNonDrinkers(0);
    setError(null);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = toShareText(result);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 일부 인앱 브라우저(카카오톡 등)는 clipboard API 를 막으므로 textarea 방식으로 대체
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setToast('결과를 복사했어요. 단톡방에 붙여넣으세요.');
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', pb: 'env(safe-area-inset-bottom)' }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 4, pb: 3 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography component="h1" sx={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            모임회식정산계산기
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            안주값은 모두 똑같이, 술값은 마신 사람끼리 나눠요.
          </Typography>
        </Box>

        {/* 입력 카드 */}
        <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
          <Stack spacing={2.5}>
            <MoneyField id="total" label="총금액" value={total} onChange={setTotal} />
            <MoneyField id="alcohol" label="전체 술값" helper="소주 + 맥주 등 술 금액 합계" value={alcohol} onChange={setAlcohol} />
            <Divider />
            <Stack spacing={1}>
              <PeopleStepper label="술 마신 사람" value={drinkers} onChange={setDrinkers} />
              <PeopleStepper label="술 안 마신 사람" value={nonDrinkers} onChange={setNonDrinkers} />
            </Stack>
            {error && <Alert severity="warning">{error}</Alert>}
            <Button variant="contained" size="large" fullWidth disableElevation onClick={handleCalculate}
              sx={{ py: 1.75, fontSize: 18 }}>
              계산하기
            </Button>
          </Stack>
        </Paper>

        {/* 결과 박스 */}
        {result && (
          <Paper ref={resultRef} elevation={0}
            sx={{ mt: 3, p: 2.5, border: 2, borderColor: 'primary.main', scrollMarginTop: 16 }}>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>정산 결과</Typography>
            <ResultRow label="총금액" value={won(result.total)} />
            <ResultRow label="술금액" value={won(result.alcohol)} />
            <ResultRow label="안주값 (총금액 - 술금액)" value={won(result.food)} />
            <Divider sx={{ my: 1 }} />
            {result.drinkers > 0 && (
              <ResultRow label={`술 마신 사람 인당 금액 (${result.drinkers}명)`} value={won(result.perDrinker)} strong />
            )}
            {result.nonDrinkers > 0 && (
              <ResultRow label={`술 안 마신 사람 인당 금액 (${result.nonDrinkers}명)`} value={won(result.perNonDrinker)} strong />
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
              1인당 금액은 원 단위 올림한 값이에요.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" disableElevation fullWidth startIcon={<ContentCopyRoundedIcon />}
                onClick={handleCopy} sx={{ py: 1.25 }}>
                결과 복사하기
              </Button>
              <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={handleReset}
                sx={{ py: 1.25, flexShrink: 0 }}>
                초기화
              </Button>
            </Stack>
          </Paper>
        )}

        {/* 광고 영역: AdSense 승인 후 아래 주석의 <ins> 태그로 교체 */}
        <Box
          component="aside"
          aria-label="광고"
          sx={{
            mt: 4,
            minHeight: 100,
            borderRadius: 2,
            border: 1,
            borderStyle: 'dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            fontSize: 12,
          }}
        >
          {/*
            <ins className="adsbygoogle" style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="XXXXXXXXXX"
              data-ad-format="auto" data-full-width-responsive="true" />
            마운트 후 useEffect 에서 (window.adsbygoogle = window.adsbygoogle || []).push({}) 호출
          */}
          AD
        </Box>
      </Container>

      <Snackbar
        open={!!toast}
        autoHideDuration={2000}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
