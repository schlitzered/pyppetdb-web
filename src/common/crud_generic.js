export function useCrudReload(fetchFunction) {
  return {
    reload: () => fetchFunction()
  }
}
