import * as React from 'react';
import { AiFillWarning } from 'react-icons/ai';
import { cn } from '../../../lib/utils';

export const Alert = ({
    children,
    style = 'warning',
    className = '',
}: {
    children?: React.ReactNode;
    style?: 'warning';
    className?: string;
}) => {

    const styles = {
        warning: 'text-sm px-4 py-2 text-amber-700 bg-amber-100 rounded border border-amber-700/20',
    };

    const icon = {
        warning: <AiFillWarning className='w-5 h-auto inline-block mr-1 opacity-70 text-amber-600' />,
    };

    return (
        <div className={cn(styles[style], className)}>
            {icon[style]} {children}
        </div>
    );
};