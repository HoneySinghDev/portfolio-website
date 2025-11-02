interface SectionTitleProps {
  title: string;
  id?: string;
}

const SectionTitle = ({ title, id }: SectionTitleProps) => (
  <h2
    id={id ? `${id}-title` : undefined}
    className='text-3xl md:text-4xl font-bold mb-4 text-center neon-text-pink glitch-effect'
  >
    {title || 'Section Title'}
  </h2>
);

export default SectionTitle;
