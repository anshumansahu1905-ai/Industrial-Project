import { useState, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import client from '../api/client';

export default function ComposeBox({ onPosted }) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function submit(e) {
    e.preventDefault();
    if (!caption.trim() && !file) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('caption', caption);
      if (file) form.append('media', file);
      const res = await client.post('/posts', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onPosted(res.data.post);
      setCaption('');
      clearFile();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="border border-hair rounded-2xl bg-surface p-4 mb-6">
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="What's happening?"
        rows={3}
        className="w-full bg-transparent outline-none text-[15px] placeholder:text-muted resize-none"
      />
      {preview && (
        <div className="relative inline-block mt-2">
          <img src={preview} alt="" className="max-h-56 rounded-lg" />
          <button
            type="button"
            onClick={clearFile}
            className="absolute -top-2 -right-2 bg-ink border border-hair rounded-full p-1"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <label className="cursor-pointer text-muted hover:text-sage transition-colors">
          <ImageIcon size={19} strokeWidth={1.75} />
          <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 rounded-lg bg-sage text-ink text-sm font-medium hover:bg-sageDeep transition-colors disabled:opacity-50"
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
