import { useRouter } from 'next/router';
import React, { AnchorHTMLAttributes, memo } from 'react';

import { cn } from '@/utils';


export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly children?: React.ReactNode;
  soft?: boolean;
}

const Link = ({
  soft,
  children,
  ...props
}: LinkProps) => {
  const { push: navigate } = useRouter();

  return (
    <a
      {...props}
      role={props.role || 'link'}
      rel={props.rel || 'noopener noreferrer'}
      className={cn('anchor-link', props.className)}
      onClick={event => {
        if(!soft || !props.href || props.href.startsWith('#'))
          return;

        event.preventDefault();
        event.stopPropagation();

        navigate(props.href);
      }}
    >
      {children}
    </a>
  );
};

export default memo(Link);
