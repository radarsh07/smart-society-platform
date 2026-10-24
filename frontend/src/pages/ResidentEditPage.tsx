import { useParams } from 'react-router-dom';
import { ResidentForm } from '@/pages/shared/ResidentForm';

export function ResidentEditPage() {
  const { residentId } = useParams();
  return <ResidentForm mode="edit" residentId={residentId ? Number(residentId) : undefined} />;
}