'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, 
  AlignLeft, AlignCenter, AlignRight, 
  Link as LinkIcon, Image as ImageIcon, 
  Code, Eye, Upload, Loader2, Undo, Redo
} from 'lucide-react';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Start typing page description...' }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [modalType, setModalType] = useState('link'); // 'link' or 'image'

  // Initialize editor content once
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setRawHtml(value || '');
  }, [value, isHtmlMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setRawHtml(html);
      if (onChange) onChange(html);
    }
  };

  const handleRawHtmlChange = (e) => {
    const html = e.target.value;
    setRawHtml(html);
    if (onChange) onChange(html);
  };

  const execCommand = (command, val = null) => {
    if (isHtmlMode) return;
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  // Image Upload handler
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Insert uploaded image into editor
      execCommand('insertHTML', `<div class="my-4"><img src="${data.url}" alt="${file.name}" class="max-w-full h-auto rounded-lg shadow border border-slate-200" /></div><p><br/></p>`);
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Insert Link or Image URL
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (modalType === 'link') {
      execCommand('createLink', urlInput.trim());
    } else if (modalType === 'image') {
      execCommand('insertHTML', `<div class="my-4"><img src="${urlInput.trim()}" alt="Image" class="max-w-full h-auto rounded-lg shadow border border-slate-200" /></div><p><br/></p>`);
    }

    setUrlInput('');
    setShowUrlModal(false);
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-gold-500 transition">
      {/* Hidden file input for image upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageFile} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Editor Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1 text-slate-700 select-none">
        <button
          type="button"
          onClick={() => execCommand('undo')}
          title="Undo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('redo')}
          title="Redo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition"
        >
          <Redo className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h1>')}
          title="Heading 1"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition font-bold text-xs"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          title="Heading 2"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition font-bold text-xs"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          title="Heading 3"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition font-bold text-xs"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          title="Paragraph"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition text-xs"
        >
          P
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Basic Styles */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          title="Bold"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          title="Italic"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          title="Underline"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('strikeThrough')}
          title="Strikethrough"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Lists & Alignment */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          title="Blockquote"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <Quote className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Link & Image Upload */}
        <button
          type="button"
          onClick={() => {
            setModalType('link');
            setShowUrlModal(true);
          }}
          title="Insert Link"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Upload Image button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload Image from Computer"
          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gold-50 text-gold-700 hover:bg-gold-100 rounded border border-gold-300 text-xs font-medium transition"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setModalType('image');
            setShowUrlModal(true);
          }}
          title="Insert Image URL"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            title={isHtmlMode ? 'Switch to Visual Editor' : 'Switch to HTML Code Mode'}
            className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition ${
              isHtmlMode 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isHtmlMode ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span>{isHtmlMode ? 'Visual' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Box */}
      {isHtmlMode ? (
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          rows={16}
          className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-900 text-slate-100 focus:outline-none resize-y"
          placeholder="Type or paste raw HTML code here..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="prose max-w-none p-5 min-h-[320px] focus:outline-none text-slate-800 text-sm leading-relaxed"
          style={{ whiteSpace: 'pre-wrap' }}
          data-placeholder={placeholder}
        />
      )}

      {/* Insert URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              {modalType === 'link' ? 'Insert Hyperlink' : 'Insert Image from URL'}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {modalType === 'link' 
                ? 'Enter the destination URL (e.g. https://dailyhukamnama.in/...)' 
                : 'Enter the public image URL'}
            </p>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold shadow"
                >
                  Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
