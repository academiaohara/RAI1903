/** Auth flows are lightweight; prefetching main nav from them pulls heavy image preloads from other routes. */
export function shouldPrefetchRoute(pathname: string): boolean {
  return !pathname.startsWith("/login") && !pathname.startsWith("/auth");
}
