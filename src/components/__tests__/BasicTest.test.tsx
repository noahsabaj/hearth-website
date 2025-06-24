import { render } from '@testing-library/react';
import React from 'react';

// Ultra simple test to verify basic React testing works
describe('Basic Test', () => {
  it('should render a simple div', () => {
    const { getByText } = render(<div>Hello World</div>);
    expect(getByText('Hello World')).toBeInTheDocument();
  });

  it('should verify jest is working', () => {
    expect(2 + 2).toBe(4);
  });
});
