'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Quote, 
  AlignLeft, AlignCenter, AlignRight, 
  Link as LinkIcon, Image as ImageIcon, 
  Code, Eye, Upload, Loader2, Undo, Redo
} from 'lucide-react';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Start typing page description...' }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [modalType, setModalType] = useState('link'); // 'link' or 'image'

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    h5: false,
    h6: false,
    p: false,
    ul: false,
    ol: false,
    quote: false,
  });

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setRawHtml(value || '');
  }, [value, isHtmlMode]);

  // Set default paragraph separator to <p>
  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (e) {}
  }, []);

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

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const updateActiveFormats = () => {
    if (isHtmlMode || !editorRef.current) return;
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isStrike = document.queryCommandState('strikeThrough');
      const isUl = document.queryCommandState('insertUnorderedList');
      const isOl = document.queryCommandState('insertOrderedList');

      let currentBlock = '';
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === 1) {
            const tag = node.tagName.toLowerCase();
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote'].includes(tag)) {
              currentBlock = tag;
              break;
            }
          }
          node = node.parentNode;
        }
      }

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strikeThrough: isStrike,
        h1: currentBlock === 'h1',
        h2: currentBlock === 'h2',
        h3: currentBlock === 'h3',
        h4: currentBlock === 'h4',
        h5: currentBlock === 'h5',
        h6: currentBlock === 'h6',
        p: currentBlock === 'p',
        ul: isUl,
        ol: isOl,
        quote: currentBlock === 'blockquote',
      });
    } catch (e) {}
  };

  const execCommand = (command, val = null) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
    updateActiveFormats();
  };

  // Robust heading formatting with toggle back to paragraph
  const formatBlockTag = (tag) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }

    const lowerTag = tag.toLowerCase();

    // Check if the current selection is already inside this tag
    const selection = window.getSelection();
    let currentTag = '';
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeType === 1 && /^(H[1-6]|P|BLOCKQUOTE)$/i.test(node.tagName)) {
          currentTag = node.tagName.toLowerCase();
          break;
        }
        node = node.parentNode;
      }
    }

    // Toggle: if already in this heading, toggle back to paragraph <p>
    const targetTag = (currentTag === lowerTag && lowerTag !== 'p') ? 'p' : lowerTag;

    let success = false;
    try {
      success = document.execCommand('formatBlock', false, `<${targetTag}>`);
    } catch (e) {}

    if (!success) {
      try {
        success = document.execCommand('formatBlock', false, targetTag);
      } catch (e) {}
    }

    if (!success) {
      try {
        success = document.execCommand('formatBlock', false, targetTag.toUpperCase());
      } catch (e) {}
    }

    handleInput();
    updateActiveFormats();
  };

  const insertList = (type) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const cmd = type === 'ol' ? 'insertOrderedList' : 'insertUnorderedList';
    document.execCommand(cmd, false, null);
    handleInput();
    updateActiveFormats();
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

    restoreSelection();
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('undo')}
          title="Undo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('redo')}
          title="Redo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition"
        >
          <Redo className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Headings: H1, H2, H3, H4, H5, H6, P */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h1')}
          title="Heading 1"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h1
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h2')}
          title="Heading 2"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h2
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h3')}
          title="Heading 3"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h3
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h4')}
          title="Heading 4"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h4
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H4
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h5')}
          title="Heading 5"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h5
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H5
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h6')}
          title="Heading 6"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h6
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H6
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('p')}
          title="Paragraph (Normal Text)"
          className={`px-2 py-1 rounded font-medium text-xs transition ${
            activeFormats.p
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          P
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Basic Styles */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('bold')}
          title="Bold"
          className={`p-1.5 rounded transition ${
            activeFormats.bold
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('italic')}
          title="Italic"
          className={`p-1.5 rounded transition ${
            activeFormats.italic
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('underline')}
          title="Underline"
          className={`p-1.5 rounded transition ${
            activeFormats.underline
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('strikeThrough')}
          title="Strikethrough"
          className={`p-1.5 rounded transition ${
            activeFormats.strikeThrough
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insertList('ul')}
          title="Bullet List"
          className={`p-1.5 rounded transition ${
            activeFormats.ul
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insertList('ol')}
          title="Numbered List"
          className={`p-1.5 rounded transition ${
            activeFormats.ol
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('blockquote')}
          title="Blockquote"
          className={`p-1.5 rounded transition ${
            activeFormats.quote
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Quote className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Link & Image Upload */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
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
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
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
            onMouseDown={(e) => e.preventDefault()}
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
          className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 focus:outline-none resize-y"
          placeholder="Type or paste raw HTML code here..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onSelect={updateActiveFormats}
          className="rich-text-content prose max-w-none p-5 min-h-[340px] focus:outline-none text-slate-800 text-sm leading-relaxed"
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
