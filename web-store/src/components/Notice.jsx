export default function Notice({ children, tone = 'info' }) {
  return children ? <div className={'notice notice-' + tone} role="status">{children}</div> : null;
}
