import { Card } from '../ui/Card'

export default function Automations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Automations</h1>
        <p className="text-text-muted">Automate your workflow with smart rules</p>
      </div>

      <Card className="p-12 text-center">
        <p className="text-4xl mb-4">⚡</p>
        <p className="text-text-muted">Automations feature coming soon!</p>
        <p className="text-sm text-text-muted mt-2">
          Create rules to automatically tag, move, or notify based on triggers
        </p>
      </Card>
    </div>
  )
}
