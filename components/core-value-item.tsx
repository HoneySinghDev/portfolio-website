interface CoreValueItemProps {
  title: string;
  description: string;
}

const CoreValueItem = ({ title, description }: CoreValueItemProps) => (
  <div className='bg-black/50 backdrop-blur-sm p-6 rounded-lg border-2 border-honey-800/50 hover:border-honey-500 transition-all duration-300 group'>
    <h4 className='text-lg font-semibold mb-2'>{title}</h4>
    <p className='text-sm text-muted-foreground'>{description}</p>
  </div>
);

export default CoreValueItem;
