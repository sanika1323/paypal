import { Construction } from 'lucide-react'

import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState } from '../components/ui/States'

export interface WorkspaceSpec {
  eyebrow: string
  title: string
  description: string
  phase: number
  sources: string[]
}

// Interim screen shown until a workspace's phase is implemented.
export function PlannedWorkspace({ spec }: { spec: WorkspaceSpec }) {
  return (
    <div className="page">
      <PageHeader eyebrow={spec.eyebrow} title={spec.title} description={spec.description} />
      <Panel title="Workspace in progress" icon={Construction} iconTone="amber">
        <EmptyState
          icon={Construction}
          title={`Scheduled for Phase ${spec.phase}`}
          description="This workspace will be built on the verified backend endpoints below. No placeholder data is shown in the meantime."
        />
        <ul className="source-list">
          {spec.sources.map((source) => (
            <li key={source}>
              <code>{source}</code>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
