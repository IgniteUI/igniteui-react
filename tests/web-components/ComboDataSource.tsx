import { IgrCombo } from '../../src/components';
import { type ComboDataSource, useComboDataSource } from '../../src/extras/combo-data-source';
import '../../node_modules/igniteui-webcomponents/themes/light/bootstrap.css';

export interface City {
  id: number;
  name: string;
}

type Visibility = 'shown' | 'hidden';

type Props = {
  source: ComboDataSource<City>;
  pageSize?: number;
  combo?: Visibility;
  value?: number[];
};

export function RemoteCombo({ source, pageSize, combo = 'shown', value }: Props) {
  const cities = useComboDataSource(source, { pageSize, debounce: 0 });

  return (
    <>
      <button type="button" onClick={() => void cities.refresh()}>
        Refresh
      </button>
      {combo === 'shown' && (
        <IgrCombo ref={cities.ref} label="City" valueKey="id" displayKey="name" value={value} />
      )}
    </>
  );
}
