import Image from 'next/image';

interface LogoWatermarkProps {
  position?: 'corner' | 'center' | 'bottom-right' | 'top-left';
  opacity?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LogoWatermark({
  position = 'bottom-right',
  opacity = 0.15,
  size = 'md'
}: LogoWatermarkProps) {
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const positionMap = {
    corner: 'bottom-4 right-4',
    center: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'bottom-8 right-8',
    'top-left': 'top-8 left-8'
  };

  return (
    <div className={`absolute ${positionMap[position]} pointer-events-none`} style={{ opacity }}>
      <Image
        src="/logo.png"
        alt="Catia Cooking Watermark"
        width={200}
        height={200}
        className={`${sizeMap[size]} rounded-full shadow-lg`}
      />
    </div>
  );
}
