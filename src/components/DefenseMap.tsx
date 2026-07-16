import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import countriesGeoJSON from '../data/countries.geo.json';

// Helper to convert Lat/Lng to 3D Cartesian coordinates on a sphere
export function latLongToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  
  return new THREE.Vector3(x, y, z);
}

interface GlobeMapProps {
  radius?: number;
  color?: string;
  opacity?: number;
}

export const GlobeMap: React.FC<GlobeMapProps> = ({ 
  radius = 5, 
  color = 'var(--color-aluminum-400)', 
  opacity = 0.4 
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const lineGeometries = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    countriesGeoJSON.features.forEach((feature: any) => {
      const geometryType = feature.geometry.type;
      const coordinates = feature.geometry.coordinates;

      if (geometryType === 'Polygon') {
        coordinates.forEach((polygon: number[][]) => {
          const points: THREE.Vector3[] = [];
          polygon.forEach(([lng, lat]) => {
            points.push(latLongToVector3(lat, lng, radius));
          });
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          geometries.push(geo);
        });
      } else if (geometryType === 'MultiPolygon') {
        coordinates.forEach((multiPolygon: number[][][]) => {
          multiPolygon.forEach((polygon: number[][]) => {
            const points: THREE.Vector3[] = [];
            polygon.forEach(([lng, lat]) => {
              points.push(latLongToVector3(lat, lng, radius));
            });
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            geometries.push(geo);
          });
        });
      }
    });

    return geometries;
  }, [radius]);

  return (
    <group ref={groupRef}>
      {lineGeometries.map((geo, idx) => (
        <line key={idx} geometry={geo}>
          <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
        </line>
      ))}
      {/* A subtle dark sphere behind the wireframe to occlude the back-side of the globe (optional, makes it look more solid) */}
      <mesh>
        <sphereGeometry args={[radius * 0.99, 32, 32]} />
        <meshBasicMaterial color="var(--color-charcoal-900)" />
      </mesh>
    </group>
  );
};
