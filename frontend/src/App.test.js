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

test('renders nearpet landing title', async () => {
  render(<App />);
  const titleElement = await screen.findByText(/nearpet/i);
  expect(titleElement).toBeInTheDocument();
});
