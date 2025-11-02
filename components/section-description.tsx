interface SectionDescriptionProps {
  description: string;
}

const SectionDescription = ({ description }: SectionDescriptionProps) => (
  <p className='text-lg mb-4 text-muted-foreground text-center'>
    {description || 'No description available'}
  </p>
);

export default SectionDescription;
