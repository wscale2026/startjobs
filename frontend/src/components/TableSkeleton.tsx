import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton, Box } from '@mui/material';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function TableSkeleton({ columns = 5, rows = 10 }: TableSkeletonProps) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from(new Array(columns)).map((_, index) => (
              <TableCell key={`head-${index}`}>
                <Skeleton animation="wave" height={24} width="80%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(new Array(rows)).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from(new Array(columns)).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  {colIndex === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton animation="wave" variant="circular" width={40} height={40} />
                      <Box sx={{ width: '100%' }}>
                        <Skeleton animation="wave" height={20} width="60%" />
                        <Skeleton animation="wave" height={16} width="40%" />
                      </Box>
                    </Box>
                  ) : (
                    <Skeleton animation="wave" height={24} width="70%" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
