import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * react-router 6 removed withRouter, but 72 components in this app take `history`, `location`
 * and `match` as injected props. This reproduces the v5 prop shape on top of the v6/v7 hooks so
 * those components keep working unchanged - only their import moves here.
 *
 * Only the surface this codebase actually used is implemented (push/replace/goBack/go and
 * match.params). Reach for the hooks directly in new code.
 */
export function withRouter(Component) {
  function WithRouter(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    const history = React.useMemo(() => ({
      push: (to, state) => navigate(to, { state }),
      replace: (to, state) => navigate(to, { state, replace: true }),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
      go: delta => navigate(delta),
      location,
    }), [navigate, location]);

    const match = React.useMemo(() => ({ params }), [params]);

    return <Component {...props} history={history} location={location} match={match} />;
  }

  WithRouter.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`;
  return WithRouter;
}

export default withRouter;
