export default function SectionDivider() {
  return (
    <div className='my-24 w-1/2 h-16 mx-auto relative overflow-hidden'>
      <div className='w-full h-[1px] bg-honey-200 dark:bg-honey-800 absolute top-1/2 left-0 transform -translate-y-1/2'></div>
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rotate-45 bg-honey-300 dark:bg-honey-700 z-10'></div>
    </div>
  );
}
