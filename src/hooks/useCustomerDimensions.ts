import { useEffect, useState } from 'react';
import { getCustomerDimensions } from '@/services/dimensions.service';
import { Dimension, CustomerDimension } from '@/types/dimensions.types';
import { useGetProfileData } from './useGetProfileData';

export function useCustomerDimensions() {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: profile } = useGetProfileData();

  useEffect(() => {
    const fetchDimensions = async () => {
      if (!profile?.customerNumbers?.length) return;

      try {
        setIsLoading(true);
        setError(null);
        const customerNumber = profile.customerNumbers[0];
        const response = await getCustomerDimensions(customerNumber);

        // Group dimensions by d1_id to create hierarchy
        const dimensionMap = new Map();
        
        response.forEach((dim: CustomerDimension) => {
          const d1Key = dim.d1_id?.toString();
          if (!d1Key) return;

          // Create or get the level 1 dimension
          if (!dimensionMap.has(d1Key)) {
            dimensionMap.set(d1Key, {
              id: dim.d1_id.toString(),
              name: dim.d1_name,
              type: dim.d1_type || '', 
              budget: dim.d1_budget?.toString().replace('.', ',') || '0',
              children: [] as Dimension[]
            });
          }

          // If d2 exists, add it as a child
          if (dim.d2_id) {
            const d1Dim = dimensionMap.get(d1Key);
            const d2Key = `${d1Key}-${dim.d2_id}`;
            
            // Check if this d2 is already added
            const existingChild = d1Dim.children.find((child: Dimension) => child.id === dim.d2_id?.toString());
            if (!existingChild && dim.d2_id && dim.d2_name) {
              const d2Child = {
                id: dim.d2_id.toString(),
                name: dim.d2_name,
                type: dim.d2_type || '',
                budget: dim.d2_budget?.toString().replace('.', ',') || '0',
                children: [] as Dimension[]
              };
              d1Dim.children.push(d2Child);

              // If d3 exists, add it as a child of d2
              if (dim.d3_id) {
                d2Child.children.push({
                  id: dim.d3_id.toString(),
                  name: dim.d3_name?.toString() || '',
                  type: dim.d3_type || '',
                  budget: dim.d3_budget?.toString().replace('.', ',') || '0',
                  children: [] as Dimension[]
                });
              }
            }
          }
        });

        const formattedDimensions = Array.from(dimensionMap.values());

        setDimensions(formattedDimensions);
      } catch (err) {
        console.error('Error fetching dimensions:', err);
        setError('Failed to fetch dimensions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDimensions();
  }, [profile]);

  return { dimensions, isLoading, error };
}
