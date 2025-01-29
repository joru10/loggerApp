import { render, screen } from '@testing-library/react';
import App from './App';

test('renders audio logger title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Audio Logger/i);
  expect(titleElement).toBeInTheDocument();
});
