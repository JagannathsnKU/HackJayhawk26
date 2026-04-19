import type { NavigationState, PartialState } from '@react-navigation/native';

/** Deepest focused route name in a nested navigator tree. */
export function getFocusedRouteNameFromState(
  state: NavigationState | PartialState<NavigationState> | undefined,
): string | undefined {
  if (!state || state.index === undefined || state.index < 0) return undefined;
  const route = state.routes[state.index];
  if (!route) return undefined;
  if (route.state) {
    return getFocusedRouteNameFromState(route.state as NavigationState);
  }
  return route.name;
}
