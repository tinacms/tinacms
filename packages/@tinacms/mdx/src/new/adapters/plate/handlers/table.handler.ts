import type { Context, Md, Plate, RichTextField } from '../types';
import flatten from 'lodash.flatten';
import { phrasingContent } from './phrasing-content.handler';

export const handleTable = (
    content: Md.Table,
    field: RichTextField,
    context: Context
): Plate.TableElement => {
    return {
        type: 'table',
        children: content.children.map((tableRow) => ({
            type: 'tr',
            children: tableRow.children.map((tableCell) => ({
                type: 'td',
                children: [
                    {
                        type: 'p',
                        children: flatten(
                            tableCell.children.map((child) => phrasingContent(child, context))
                        ),
                    },
                ],
            })),
        })),
        props: {
            align: content.align?.filter((item) => !!item),
        },
    };
};

