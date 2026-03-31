import type { Template, FieldValues } from '@/core/types'
import { section, formatMultiSelect } from '@/core/compiler'

export const infraMonitorTemplate: Template = {
  id: 'infra-monitor',
  name: 'Infra Monitor',
  description: 'Configure an orchestrator to monitor and respond to cloud infrastructure events',
  icon: '🖥️',
  sections: [
    {
      id: 'scope',
      title: 'Scope',
      description: 'What infrastructure to watch',
      fields: [
        {
          type: 'text',
          id: 'cloud_provider',
          label: 'Cloud provider',
          placeholder: 'e.g. AWS, GCP, Azure',
          default: 'AWS',
        },
        {
          type: 'multi-select',
          id: 'services',
          label: 'Services to monitor',
          options: ['EC2', 'ECS', 'EKS', 'Lambda', 'RDS', 'S3', 'CloudFront', 'ALB', 'SQS', 'SNS', 'DynamoDB', 'ElastiCache'],
          default: ['EC2', 'RDS', 'ECS'],
        },
        {
          type: 'multi-select',
          id: 'environments',
          label: 'Environments',
          options: ['production', 'staging', 'development', 'qa'],
          default: ['production'],
        },
        {
          type: 'text',
          id: 'namespaces',
          label: 'Namespaces / resource tags',
          description: 'Comma-separated list of tags or namespaces to scope monitoring',
          placeholder: 'e.g. team:backend, env:prod',
          default: '',
        },
      ],
    },
    {
      id: 'alerting',
      title: 'Alerting',
      description: 'When and how to raise alerts',
      fields: [
        {
          type: 'slider',
          id: 'alert_sensitivity',
          label: 'Alert sensitivity',
          description: 'How aggressively to flag anomalies',
          min: 1,
          max: 10,
          step: 1,
          default: 7,
          minLabel: 'Low noise',
          maxLabel: 'Flag everything',
        },
        {
          type: 'multi-select',
          id: 'alert_severities',
          label: 'Alert severities to act on',
          options: ['Critical', 'High', 'Medium', 'Low', 'Info'],
          default: ['Critical', 'High'],
        },
        {
          type: 'slider',
          id: 'escalation_threshold',
          label: 'Escalation threshold (minutes)',
          description: 'How long an unresolved alert sits before escalating',
          min: 5,
          max: 120,
          step: 5,
          default: 15,
          minLabel: '5 min',
          maxLabel: '2 hours',
        },
        {
          type: 'text',
          id: 'notification_channel',
          label: 'Notification channel',
          placeholder: 'e.g. #alerts-prod in Slack, ops@company.com',
          default: '',
        },
      ],
    },
    {
      id: 'permissions',
      title: 'Permissions',
      description: 'What actions the orchestrator is allowed to take',
      fields: [
        {
          type: 'toggle',
          id: 'read_only',
          label: 'Read-only mode',
          description: 'Observe and report only — no automated actions',
          default: true,
        },
        {
          type: 'toggle',
          id: 'auto_restart',
          label: 'Allow service restarts',
          description: 'Automatically restart crashed services',
          default: false,
        },
        {
          type: 'toggle',
          id: 'auto_scale',
          label: 'Allow auto-scaling',
          description: 'Trigger scale-up/scale-down based on load',
          default: false,
        },
        {
          type: 'toggle',
          id: 'auto_rollback',
          label: 'Allow rollbacks',
          description: 'Roll back a deployment if error rate spikes post-deploy',
          default: false,
        },
        {
          type: 'toggle',
          id: 'can_open_tickets',
          label: 'Create incident tickets',
          description: 'Automatically open tickets in your issue tracker',
          default: true,
        },
      ],
    },
    {
      id: 'thresholds',
      title: 'Thresholds',
      description: 'Metric thresholds that trigger investigation',
      fields: [
        {
          type: 'slider',
          id: 'cpu_threshold',
          label: 'CPU alert threshold (%)',
          min: 50,
          max: 100,
          step: 5,
          default: 85,
          minLabel: '50%',
          maxLabel: '100%',
        },
        {
          type: 'slider',
          id: 'memory_threshold',
          label: 'Memory alert threshold (%)',
          min: 50,
          max: 100,
          step: 5,
          default: 90,
          minLabel: '50%',
          maxLabel: '100%',
        },
        {
          type: 'slider',
          id: 'error_rate_threshold',
          label: 'Error rate threshold (%)',
          min: 1,
          max: 20,
          step: 1,
          default: 5,
          minLabel: '1%',
          maxLabel: '20%',
        },
        {
          type: 'slider',
          id: 'latency_threshold',
          label: 'Latency threshold (ms)',
          min: 100,
          max: 5000,
          step: 100,
          default: 1000,
          minLabel: '100ms',
          maxLabel: '5s',
        },
      ],
    },
    {
      id: 'context',
      title: 'Context',
      fields: [
        {
          type: 'multi-select',
          id: 'runbook_types',
          label: 'Runbook types available',
          description: 'What kinds of runbooks the orchestrator can reference',
          options: ['Restart procedures', 'Rollback steps', 'Escalation paths', 'Capacity planning', 'DR playbooks'],
          default: ['Restart procedures', 'Escalation paths'],
        },
        {
          type: 'textarea',
          id: 'additional_context',
          label: 'Additional context',
          placeholder: 'Deployment schedule, known flaky services, on-call rotation notes, current incidents...',
          default: '',
          rows: 4,
        },
      ],
    },
  ],

  render(values: FieldValues): string {
    const v = values as Record<string, unknown>
    const lines: string[] = []

    lines.push(`# Infra Monitor Configuration\n`)

    // Objective
    const cloud = v['cloud_provider'] as string
    const services = v['services'] as string[]
    const envs = v['environments'] as string[]

    const objectiveLines: string[] = []
    if (cloud) objectiveLines.push(`- **Cloud provider**: ${cloud}`)
    if (services?.length) objectiveLines.push(`- **Services**: ${formatMultiSelect(services)}`)
    if (envs?.length) objectiveLines.push(`- **Environments**: ${formatMultiSelect(envs)}`)
    const namespaces = v['namespaces'] as string
    if (namespaces?.trim()) objectiveLines.push(`- **Scope tags**: ${namespaces}`)

    lines.push(section('Objective', objectiveLines.join('\n') || '_Not specified_'))

    // Tools
    const toolLines = [
      '- **Metrics API**: Read CloudWatch / Datadog / Prometheus metrics (read)',
      '- **Logs API**: Query application and infrastructure logs (read)',
      '- **Alerts API**: Read active alerts and alert history (read)',
    ]
    if (!v['read_only']) {
      if (v['auto_restart']) toolLines.push('- **Service control**: Restart services (write)')
      if (v['auto_scale']) toolLines.push('- **Auto-scaler**: Trigger scale operations (write)')
      if (v['auto_rollback']) toolLines.push('- **Deployment API**: Trigger rollbacks (write)')
    }
    if (v['can_open_tickets']) toolLines.push('- **Issue tracker**: Create and update incident tickets (write)')

    lines.push(section('Tools', toolLines.join('\n')))

    // Constraints
    const constraintLines: string[] = []
    const sensitivity = v['alert_sensitivity'] as number
    constraintLines.push(`- **Alert sensitivity**: ${sensitivity}/10 — ${sensitivity <= 3 ? 'only flag critical anomalies' : sensitivity <= 6 ? 'moderate filtering' : 'flag all notable deviations'}`)

    const severities = v['alert_severities'] as string[]
    if (severities?.length) constraintLines.push(`- **Act on severities**: ${formatMultiSelect(severities)}`)

    const escalation = v['escalation_threshold'] as number
    constraintLines.push(`- **Escalation**: Unresolved alerts escalate after **${escalation} minutes**`)

    if (v['read_only']) {
      constraintLines.push('- **Mode**: Read-only — observe and report, do not take automated actions')
    } else {
      const allowed = []
      if (v['auto_restart']) allowed.push('service restarts')
      if (v['auto_scale']) allowed.push('auto-scaling')
      if (v['auto_rollback']) allowed.push('rollbacks')
      if (allowed.length) constraintLines.push(`- **Allowed automated actions**: ${allowed.join(', ')}`)
    }

    lines.push(section('Constraints', constraintLines.join('\n')))

    // Parameters / Thresholds
    const paramLines: string[] = []
    paramLines.push(`- **CPU alert**: > ${v['cpu_threshold']}%`)
    paramLines.push(`- **Memory alert**: > ${v['memory_threshold']}%`)
    paramLines.push(`- **Error rate alert**: > ${v['error_rate_threshold']}%`)
    paramLines.push(`- **Latency alert**: > ${v['latency_threshold']}ms`)

    const notif = v['notification_channel'] as string
    if (notif?.trim()) paramLines.push(`- **Notification channel**: ${notif}`)

    const runbooks = v['runbook_types'] as string[]
    if (runbooks?.length) paramLines.push(`- **Available runbooks**: ${formatMultiSelect(runbooks)}`)

    lines.push(section('Parameters', paramLines.join('\n')))

    // Instructions
    const ctx = v['additional_context'] as string
    const instructionLines = [
      'Continuously monitor the defined services and environments.',
      'When a threshold is breached, investigate root cause before escalating.',
      'Summarize findings clearly: what is affected, since when, likely cause, and recommended action.',
      'Cross-reference logs and metrics to confirm anomalies before raising alerts.',
      'Respect the permission model strictly — do not take actions beyond what is permitted.',
    ]
    if (ctx?.trim()) instructionLines.push(`\n**Operator notes**:\n${ctx}`)

    lines.push(section('Instructions', instructionLines.join('\n')))

    return lines.join('\n')
  },
}
