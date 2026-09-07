'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import PageForm from '@/components/admin/PageForm';

export default function NewPage() {
  return (
    <AdminLayout>
      <PageForm isEdit={false} />
    </AdminLayout>
  );
}
