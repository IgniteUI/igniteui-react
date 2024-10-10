import React from 'react';
import {
  IgcButtonComponent as Button,
  IgcCheckboxComponent as Checkbox,
  IgcInputComponent as Input,
} from '../../src/components';
import '../../node_modules/igniteui-webcomponents/themes/light/bootstrap.css';

export default function BasicForm() {
  return (
    <form>
      <Input name="username" label="Username" required>
        <p slot="helper-text">Your username</p>
      </Input>
      <Input name="password" label="Password" type="password">
        <p slot="helper-text">Your password</p>
      </Input>

      <Checkbox name="remember">Remember credentials</Checkbox>

      <div>
        <Button type="submit">Submit</Button>
        <Button href="/password-reset" variant="flat">
          Forgot your password?
        </Button>
      </div>
    </form>
  );
}
