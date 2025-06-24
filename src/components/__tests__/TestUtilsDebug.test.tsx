import { render as rtlRender } from '@testing-library/react';
import React from 'react';

import { render as customRender, setupTest, teardownTest } from '../../test-utils';

describe('Test Utils Debug', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  it('should render with native RTL render', () => {
    const { getByText } = rtlRender(<div>Hello RTL</div>);
    expect(getByText('Hello RTL')).toBeInTheDocument();
  });

  it('should render with custom render', () => {
    const { getByText } = customRender(<div>Hello Custom</div>);
    expect(getByText('Hello Custom')).toBeInTheDocument();
  });

  it('should verify custom render exports are correct', () => {
    expect(typeof customRender).toBe('function');
    expect(typeof setupTest).toBe('function');
    expect(typeof teardownTest).toBe('function');
  });
});
