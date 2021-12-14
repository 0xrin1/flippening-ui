import React from 'react';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import Pagination from '@mui/material/Pagination';
import { FlipType } from '../interfaces';

type Props = {
    flips: {
        flips: FlipType[],
        flipsLength: number,
    }
    page: number,
    pageSize: number,
    noFlips: string,
    changePage: (e: any, p: any) => any,
};

const paginatedFlips = (params: Props): ReactJSXElement => {
    return <div>
        { params.flips?.flips && params.flips.flips.length > 0 ? <>
            { params.flips.flips }
            <Pagination
                count={ Math.ceil(params.flips.flipsLength / params.pageSize) }
                page={ params.page }
                onChange={ params.changePage }
                color="primary"
                defaultPage={ 1 }
            />
        </> : <p>{ params.noFlips }</p> }
    </div>;
};

export default paginatedFlips;
