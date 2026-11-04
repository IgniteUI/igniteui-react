import { IgrCombo } from '../../src/components';
import '../../node_modules/igniteui-webcomponents/themes/light/bootstrap.css';

interface Ticker {
  symbol: string;
}

const tickers: Ticker[] = ['AAPL', 'MSFT', 'NVDA', 'NFLX', 'TSLA', 'AMZN', 'META'].map(
  (symbol) => ({ symbol }),
);

export function TemplatedCombo({ onClick }: { onClick?: () => void }) {
  return (
    <IgrCombo
      singleSelect
      label="Symbol"
      data={tickers}
      valueKey="symbol"
      displayKey="symbol"
      onClick={onClick}
      itemTemplate={({ item }: { item: Ticker }) => <span>T:{item.symbol}</span>}
    />
  );
}
