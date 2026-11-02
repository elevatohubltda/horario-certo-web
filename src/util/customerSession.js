import { useEffect, useState } from "react";
import { getCustomerMe, logoutCustomer as logoutRequest } from "../services/endpoints/customer";

// Estado do cliente final logado, compartilhado entre as telas.
// undefined = ainda não consultado; null = sem conta; objeto = cliente logado.
let current;
let pending = null;
const listeners = new Set();

// Marca local de que este navegador já entrou numa conta; evita consultar o backend para quem nunca entrou
const KNOWN_KEY = "hc-customer-known";
// Escolha feita na agenda: "guest" (seguir sem conta) não pergunta de novo
const CHOICE_KEY = "hc-customer-choice";

const storage = {
  get: (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
};

const emit = () => listeners.forEach((listener) => listener(current));

export const setCurrentCustomer = (customer) => {
  current = customer || null;
  if (customer) {
    storage.set(KNOWN_KEY, "1");
    storage.remove(CHOICE_KEY);
  }
  emit();
};

export const loadCustomer = (force = false) => {
  if (!force && current !== undefined) return Promise.resolve(current);
  if (!force && !storage.get(KNOWN_KEY)) {
    current = null;
    return Promise.resolve(null);
  }
  if (!pending) {
    pending = getCustomerMe()
      .then((response) => response.data)
      .catch(() => null)
      .then((customer) => {
        pending = null;
        if (!customer) storage.remove(KNOWN_KEY);
        current = customer;
        emit();
        return customer;
      });
  }
  return pending;
};

export const logoutCurrentCustomer = async () => {
  try { await logoutRequest(); } catch {}
  storage.remove(KNOWN_KEY);
  current = null;
  emit();
};

export const hasChosenGuest = () => storage.get(CHOICE_KEY) === "guest";
export const chooseGuest = () => storage.set(CHOICE_KEY, "guest");

export function useCustomer() {
  const [customer, setCustomer] = useState(current);
  const [loading, setLoading] = useState(current === undefined);

  useEffect(() => {
    const listener = (value) => {
      setCustomer(value);
      setLoading(false);
    };
    listeners.add(listener);
    loadCustomer().then(listener);
    return () => listeners.delete(listener);
  }, []);

  return { customer, loading };
}
