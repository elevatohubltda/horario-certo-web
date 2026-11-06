// Matchers do Testing Library (toBeInTheDocument, toHaveTextContent...) em todos os testes
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// O jsdom não tem TextEncoder/TextDecoder, que o React Router 7 usa
if (typeof global.TextEncoder === "undefined") {
  Object.assign(global, { TextEncoder, TextDecoder });
}
