import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '../components/ui/States'

export function NotFound() {
  return (
    <div className="page">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="This route does not exist in ReliefOS."
        action={
          <Link to="/" className="btn btn--primary btn--sm">
            Go to Command Center
          </Link>
        }
      />
    </div>
  )
}
