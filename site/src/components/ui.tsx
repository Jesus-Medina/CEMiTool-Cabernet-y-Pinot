import type { HTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

type ButtonLinkProps = LinkProps & {
  variant?: 'primary' | 'secondary' | 'quiet'
  fit?: boolean
}

export function ButtonLink({
  variant = 'secondary',
  fit = false,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={classes('button', 'ui-button', `ui-button--${variant}`, fit && 'ui-button--fit', className)}
      {...props}
    />
  )
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return <span className={classes('ui-badge', `ui-badge--${tone}`, className)} {...props} />
}

type CalloutProps = HTMLAttributes<HTMLElement> & {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  eyebrow?: string
  title: string
  children: ReactNode
}

export function Callout({
  tone = 'neutral',
  eyebrow,
  title,
  children,
  className,
  ...props
}: CalloutProps) {
  return (
    <section className={classes('ui-callout', `ui-callout--${tone}`, className)} {...props}>
      {eyebrow && <p className="ui-callout-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <div className="ui-callout-body">{children}</div>
    </section>
  )
}

type ActionLinkProps = LinkProps & {
  direction?: 'forward' | 'back'
}

export function ActionLink({ direction = 'forward', className, children, ...props }: ActionLinkProps) {
  return (
    <Link className={classes('ui-action-link', className)} {...props}>
      {direction === 'back' && <span aria-hidden="true">←</span>}
      <span>{children}</span>
      {direction === 'forward' && <span aria-hidden="true">→</span>}
    </Link>
  )
}

type ActionCardProps = LinkProps & {
  featured?: boolean
}

export function ActionCard({ featured = false, className, ...props }: ActionCardProps) {
  return (
    <Link
      className={classes('ui-card', 'ui-card--interactive', featured && 'ui-card--featured', className)}
      {...props}
    />
  )
}

type AsyncStateProps = HTMLAttributes<HTMLDivElement> & {
  state: 'loading' | 'error' | 'empty'
  title?: string
  children?: ReactNode
}

export function AsyncState({ state, title, children, className, ...props }: AsyncStateProps) {
  const role = state === 'error' ? 'alert' : 'status'
  return (
    <div className={classes('ui-state', `ui-state--${state}`, className)} role={role} {...props}>
      <span className="ui-state-icon" aria-hidden="true" />
      <div>
        {title && <strong>{title}</strong>}
        {children && <span>{children}</span>}
      </div>
    </div>
  )
}

export function EmptyState({ title = 'Sin resultados', children, ...props }: Omit<AsyncStateProps, 'state'>) {
  return <AsyncState state="empty" title={title} {...props}>{children}</AsyncState>
}

export function FilterBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes('ui-filter-bar', className)} {...props} />
}

type TableFrameProps = HTMLAttributes<HTMLDivElement> & {
  label?: string
}

export function TableFrame({ label, className, ...props }: TableFrameProps) {
  return (
    <div
      className={classes('ui-table-frame', 'scientific-table-wrap', className)}
      role="region"
      aria-label={label}
      tabIndex={0}
      {...props}
    />
  )
}

type ChartCardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  eyebrow?: string
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function ChartCard({ eyebrow, title, actions, children, className, ...props }: ChartCardProps) {
  return (
    <figure className={classes('ui-chart-card', className)} {...props}>
      <figcaption className="ui-chart-card-header">
        <div>
          {eyebrow && <p className="ui-chart-card-eyebrow">{eyebrow}</p>}
          <h3>{title}</h3>
        </div>
        {actions && <div className="ui-chart-card-actions">{actions}</div>}
      </figcaption>
      <div className="ui-chart-card-body">{children}</div>
    </figure>
  )
}
