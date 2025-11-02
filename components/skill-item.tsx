interface SkillItemProps {
  name: string;
  level: number;
}

const SkillItem = ({ name, level }: SkillItemProps) => (
  <div className='flex items-center justify-between'>
    <span className='font-medium'>{name}</span>
    <span className='text-muted-foreground'>{level}%</span>
  </div>
);

export default SkillItem;
