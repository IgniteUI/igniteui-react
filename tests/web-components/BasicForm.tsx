import React, { useRef } from 'react';
import { IgrButton, IgrCheckbox, IgrInput, IgrSelect, IgrSelectItem } from '../../src/components';
import CountriesCombo from './Country';
import '../../node_modules/igniteui-webcomponents/themes/light/bootstrap.css';

export default function BasicForm() {
  const select = useRef<IgrSelect>(null);

  async function toggleSelect() {
    await select.current?.toggle();
  }

  return (
    <form style={{ padding: '1rem' }}>
      <IgrInput name="username" label="Username" required>
        <p slot="helper-text">Your username</p>
      </IgrInput>

      <IgrInput name="password" label="Password" type="password" required>
        <p slot="helper-text">Your password</p>
      </IgrInput>

      <CountriesCombo />

      <IgrCheckbox name="remember">Remember credentials</IgrCheckbox>

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
