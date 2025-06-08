import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const PageContainer = ({ title, description, children }: PageContainerProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline md:text-4xl">{title}</h1>
        {description && <p className="text-lg text-muted-foreground mt-2">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageContainer;
