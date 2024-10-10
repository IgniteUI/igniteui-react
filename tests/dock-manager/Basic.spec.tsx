import React from 'react';
import { test } from 'vitest';
import { render } from 'vitest-browser-react';

import BasicDocManager from './Basic';

test('Default dock manager sample', async () => {
  render(<BasicDocManager />);
});
