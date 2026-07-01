import React from 'react';
import { Card, CardContent, CardActions, Skeleton, Box } from '@mui/material';

interface CardSkeletonProps {
  count?: number;
}

export default function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from(new Array(count)).map((_, index) => (
        <Card key={index} sx={{ borderRadius: 3, mb: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Skeleton animation="wave" variant="circular" width={48} height={48} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton animation="wave" height={24} width="70%" />
                <Skeleton animation="wave" height={16} width="40%" />
              </Box>
            </Box>
            <Skeleton animation="wave" height={16} style={{ marginBottom: 6 }} />
            <Skeleton animation="wave" height={16} width="80%" style={{ marginBottom: 6 }} />
            <Skeleton animation="wave" height={16} width="60%" />
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton animation="wave" variant="rounded" width={80} height={28} sx={{ borderRadius: 2 }} />
              <Skeleton animation="wave" variant="rounded" width={80} height={28} sx={{ borderRadius: 2 }} />
            </Box>
            <Skeleton animation="wave" variant="rounded" width={100} height={36} sx={{ borderRadius: 2 }} />
          </CardActions>
        </Card>
      ))}
    </>
  );
}
