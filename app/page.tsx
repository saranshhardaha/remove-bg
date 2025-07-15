'use client';
import { useState } from 'react';

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    const res = await fetch('/api/remove-bg', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setLoading(false);

    if (data.image) setPreview(data.image);
    else alert(data.error || 'Something went wrong');
  }

  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4 font-semibold">Remove Background</h1>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {loading && <p className="mt-4 text-gray-500">Processing...</p>}
      {preview && (
        <img
          src={preview}
          alt="Processed"
          className="mt-6 rounded shadow max-w-full"
        />
      )}
    </main>
  );
}
