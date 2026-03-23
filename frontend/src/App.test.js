import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve('[]'),
    })
  );
});

test('renders reserve now button', async () => {
  render(<App />);
  const buttonElement = await screen.findByText(/reserve now/i);
  expect(buttonElement).toBeInTheDocument();
});
