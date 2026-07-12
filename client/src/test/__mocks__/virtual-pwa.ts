export function useRegisterSW() {
  return {
    needRefresh: [false, () => {}],
    updateServiceWorker: () => {},
  };
}
