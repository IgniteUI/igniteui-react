import { useRef } from 'react';
import {
  IgrButton,
  IgrCheckbox,
  type IgrCheckboxChangeEventArgs,
  IgrInput,
  IgrRadio,
  type IgrRadioChangeEventArgs,
  IgrRadioGroup,
  IgrSelect,
  IgrSelectItem,
} from '../../src/components';
import CountriesCombo from './Country';
import '../../node_modules/igniteui-webcomponents/themes/light/bootstrap.css';

export default function BasicForm() {
  const select = useRef<IgrSelect>(null);

  async function toggleSelect() {
    await select.current?.toggle();
  }

  const logEvent = (e: IgrRadioChangeEventArgs | IgrCheckboxChangeEventArgs) => console.log(e);

  return (
    <form style={{ padding: '1rem' }}>
      <IgrInput name="username" label="Username" required>
        <p slot="helper-text">Your username</p>
      </IgrInput>

      <IgrInput name="password" label="Password" type="password" required>
        <p slot="helper-text">Your password</p>
      </IgrInput>

      <CountriesCombo />

      <IgrCheckbox name="remember" onChange={logEvent}>
        Remember credentials
      </IgrCheckbox>

      <IgrRadioGroup name="radios" onChange={logEvent}>
        <IgrRadio value="on">On</IgrRadio>
        <IgrRadio value="off">Off</IgrRadio>
      </IgrRadioGroup>

      <IgrSelect style={{ marginBlockStart: '2rem' }} ref={select} name="pick" value="two">
        <IgrSelectItem value="one">one</IgrSelectItem>
        <IgrSelectItem value="two">two</IgrSelectItem>
      </IgrSelect>

      <div style={{ marginBlockStart: '2rem' }}>
        <IgrButton type="submit">Submit</IgrButton>
        <IgrButton href="/password-reset" variant="flat">
          Forgot your password?
        </IgrButton>
        <IgrButton type="button" variant="flat" onClick={toggleSelect}>
          Toggle Select
        </IgrButton>
      </div>
    </form>
  );
}
