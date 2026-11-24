import LocalizedContent from './LocalizedContent.jsx';
export default function SectionHeading({ eyebrow, title, description, light = false, align = 'left' }) {
  return <LocalizedContent><div className={'section-heading ' + (light ? 'section-heading-light ' : '') + 'align-' + align}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div></LocalizedContent>;
}
